//variables
socket.on('updateAns', updateAns);
function updateAns(data){
    if(data.type == 'error'){
        showError(data.msg);
    }
    else {
        canLeave = true;
        clearTimeout(dotTimer);
        showSucces(data.msg);
    }
}

var pagesObjs = [];

var k = 0, count = 0;
var intval, intval_index = 0, ready_index = 0;
var canLeave = true;

var INSERTAT = -1;
var insert = false;
var dotTimer, dots = 0;

window.onbeforeunload = function() {
    if(!canLeave)
        return "Are you sure you want to leave (killing the process)?";
}

function prepare(page){
    var reader = new FileReader();
    reader.onload = function(e){
        page.e = e;
        //uploadImage(page);
        ready_index++;
        if(ready_index == pagesObjs.length){
            startupload();
        }
    }
    reader.readAsDataURL(page.file);
}

function startupload(){
    intval = setInterval(function(){
        uploadImage(pagesObjs[intval_index]);
        intval_index++;
        if(intval_index == pagesObjs.length){
            clearInterval(intval);
        }
    },3000);//3s för varje bild
}

function getFiles(index, ins){// the uploading begins!
    insert = ins || false;
    canLeave = false;
    INSERTAT = index;
    var elm = ((insert) ? $('#pages') : $('#page'));
    var length = elm.get(0).files.length;
    count = length;
    $('#pagesTot').text(count);
    dotTimer = setInterval(function(){
        dots++;
        if(dots == 3){
            dots = 0;
        }
        var txt = ".";
        for(var i = 0; i < dots; i++){
            txt += ".";
        }
        $('#uploadDots').text(txt)
    }, 300);

    for(var i = 0; i < length; i++){
        var img = elm.get(0).files[i];
        pagesObjs.push(new Page(img, i));
        prepare(pagesObjs[i]);
    }
}

function uploadImage(page){
    var iurl = page.e.target.result.substr(page.e.target.result.indexOf(",") + 1, page.e.target.result.length);
    var clientId = '8398bc9cd4ca0f5';
    $.ajax({
        url: "https://api.imgur.com/3/upload",
        type: "POST",
        datatype: "json",
        data: {
            'image': iurl,
            'type': 'base64'
        },
        success: function(data){
            page.link = data.data.link;
            console.log(page.link + " - done");
            //tell the user one of .. is uploaded
            k++;
            $('#currentPage').text(k);
            if(k == count){
                done();
            }

        },//calling function which displays url
        error: function(){
            clearInterval(intval);
            if(!ERROR){
                var first = confirm('Failed to upload current page (' + (k + 1) + '). Do you want to upload chapter anyway (yes) or would you like to quit process (no)');
                if (first) {
                    // Save it!
                    ERROR = true;
                    done();
                }
                else {
                    var second = confirm('You choose to abort, are you sure?');
                    if(second){
                        ERROR = true;
                        canLeave = true;
                        window.location.href = "/";
                    }
                    else {
                        ERROR = true;
                        done();
                    }
                }
            }
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
        }
    });
}

function done(){
    console.log('done');
    var links = [];
    for(var i = 0; i < pagesObjs.length; i++){
        if(pagesObjs[i].link != ""){
            links.push(pagesObjs[i].link);
        }
    }
    if(links.length > 0){
        if(insert){
            for(var i = 0; i < links.length; i++){
                pages.splice(INSERTAT + i, 0, links[i]);
            }
        } else {
            pages.splice(INSERTAT, 1, links[0]);
        }

        updateChapter(pages);
    }
    else {
        showError('Error - failed to upload images');
    }
}


var Page = function(file, index){
    var page = new Object();
    page.index = index;
    page.file = file;
    page.link = "";
    page.e = null;
    return page;
}


function updateChapter(pagesArr){
    var bookNew = $.extend(true, {}, book);
    bookNew.pages_url = "";
    for(var i = 0; i < pagesArr.length; i++){
        bookNew.pages_url += pagesArr[i] + ((i != pagesArr.length - 1) ? "," : "");
    }

    console.log(bookNew, pagesArr);

    // $.post('/confirmCreator',
    // { name: bookNew.creator },
    // function(data){
    //     if(data != 'error'){
    //         socket.emit('updateChapter', bookNew);
    //     }
    //     else {
    //         showError('You do not have permission to change this content!');
    //     }
    // });
}



// UPLOAD
//variables
if(GHF == undefined){
    socket = io('/');
    socket.on('uploadchapter', bookUpload);
    socket.on('uploadAns', answer);
    socket.on('searchResults', printbooks);
    socket.on('searchResultId', directTo);
}

var pages = [];
var title = "";
var chapter = "";
var book_chapter, _book;

var k = 0,
    count = 0;
var intval, intval_index = 0, ready_index = 0;

var canLeave = true;
var ERROR = false;

window.onbeforeunload = function() {
    if(!canLeave)
        return "Are you sure you want to leave (killing the process)?";
}

function directTo(rows){
    if(rows == -1){
        window.location.href = "/";
    }
    else {
        window.location.href = "/book?id=" + rows.id;
    }
}

function answer(ans){
    if(ans.error){
        //aah noo.. an error :/
        console.log(ans.error);
    }
    else {
        if(ans.type == 0) {
            //the book was uploaded
            //now its time for the chapter
            console.log("The book was succesfully uploaded");
            getFiles();
        }
        else {
            //do a ask mayby if want to go to book or home
            alert("The chapter was succesfully uploaded");
            console.log("redirect to home site");
            socket.emit('searchTitle', title);
        }
    }
}

function upload(){
    /**
    * should check if such book exist
    * if not then add book then add chapter
    */

    var _title = $('#title').val(); //check these for validation
    var _chapter = $('#chapter').val();

    if(validateText(_title)) {
        title = _title;
    } else { // tell the user
        title = "";
        // popup over the title or something
    }
    if(validateText(_chapter)) {
        chapter = _chapter;
    } else { // tell the user
        chapter = "";
        // popup over the chapter or something
    }

    if(title != "" && chapter != ""){
        //check if book exist!
        socket.emit('validatebook', title);
    }
    else {
        console.log("there was a problem with the input values");
    }
}



function bookUpload(ans){
    var mall = {
        title: title,
        pages: null,
        author: null,
        category: null,
        summery: null,
        tags: null,
        kapitel: null,
        chapter: null,
        creator: USERNAME
    }
    book_chapter = $.extend({}, mall);
    book_chapter.pages = ""; // upload and get the links!
    book_chapter.chapter = chapter;
    book_chapter.kapitel = 1;

    // console.log(ans);

    if(ans){ // there was no book
        // book first
        // now should ask user to put in tags, author, category, summery
        _book = $.extend({}, mall);
        _book.kapitel = 0;
        $('#popup').show();
    }
    else {
        getFiles();
    }

    console.log(book_chapter);
}
function uploadBook(){

    var author = $('#author').val(),
        tags = $('#tags').val(),
        sum = $('#summery').val();

        // console.log(sum);

    if(validateText(author) && validateText(tags) && validateText(sum)){
        console.log("values are varified");
        _book.author = author;
        _book.category = 0; //no need for this
        _book.summery = sum;
        _book.tags = tags;

        $('#popup').hide();
        socket.emit('upload', _book);
        //upload the rest now!
    }
    else {
        console.log("values werent good");
    }
}

function startupload(){
    intval = setInterval(function(){
        if(!ERROR){
            uploadImage(pages[intval_index]);
            intval_index++;
            if(intval_index == pages.length){
                clearInterval(intval);
            }
        }
    },3000);//5s för varje bild
}

function getFiles(){// the uploading begins!
    canLeave = false;
    var length = $('#pages').get(0).files.length;
    // console.log(length);
    if(length > 1){
        $('.container').hide();
        $('.info').show();

        count = length;
        $('#count').text(count);
        // console.log(length);

        for(var i = 0; i < length; i++){
            var img = $('#pages').get(0).files[i];
            //console.log(img);
            pages.push(new Page(img, i));
            //uploadImage(pages[i]);
            prepare(pages[i]);
        }
    }
    else {
        alert("make sure that there are atleast two pages!");
    }
}

function uploadImage(page){
    var iurl = page.e.target.result.substr(page.e.target.result.indexOf(",") + 1, page.e.target.result.length);
    var clientId = page.getClientID();
    $.ajax({
        url: "https://api.imgur.com/3/upload",
        type: "POST",
        datatype: "json",
        data: {
            'image': iurl,
            'type': 'base64'
        },
        success: function(data){
            page.link = data.data.link;
            console.log("index:" + page.index + " -> " + page.link);
            //tell the user one of .. is uploaded
            k++;
            $('#current').text(k);
            if(k == count){
                done();
            }

        },//calling function which displays url
        error: function(){
            console.log("failed to upload image");
            clearInterval(intval);
            if(!ERROR){
                var first = confirm('Failed to upload current page (' + (k + 1) + '). Do you want to upload chapter anyway (yes) or would you like to quit process (no)');
                if (first) {
                    // Save it!
                    ERROR = true;
                    done();
                }
                else {
                    var second = confirm('You choose to abort, are you sure?');
                    if(second){
                        ERROR = true;
                        canLeave = true;
                        window.location.href = "/";
                    }
                    else {
                        ERROR = true;
                        done();
                    }
                }
            }
        },
        beforeSend: function (xhr) {
            if(!ERROR){
                xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
            }
        }
    });
}

function done(){
    //all pages were uploaded.. the links are done...
    //now just upload the chapter
    canLeave = true;
    console.log("uploading chapter!");
    // console.log(pages);

    for(var i = 0; i < pages.length; i++){
        if(pages[i].link != ""){
            var text = pages[i].link + ((i != pages.length - 1) ? "," : "");
            book_chapter.pages += text;
        }
    }

    // console.log(book_chapter);
    socket.emit('upload', book_chapter);
}


var Page = function(file, index){
    var page = new Object();
    page.index = index;
    page.file = file;
    page.link = "";
    page.e = null;
    page.errorCount = 0;
    page.clientIndex = 0;
    page.clientIDs = ["5808ae5f45e577b", "0d8ac23c0d6e8d5", "8398bc9cd4ca0f5"];
    page.error = function(){
        page.errorCount++;
        page.clientIndex++;
        if(page.clientIndex >= page.clientIDs.length){
            page.clientIndex = 0;
        }
    };
    page.getClientID = function(){
      return page.clientIDs[page.clientIndex];
    };
    return page;
}


// SEARCH RELATED
function search(val){
    if(val == ""){
        $('.searchList').hide();
    }
    else if(validateText(val)) { // get a specific book by search (can of course send back lots)
        socket.emit('searchbook', val);
    }
}
function printbooks(books){
    $('.searchList').text('');
    if(books.length > 0){
        $('.searchList').show();
    }
    else {
        $('.searchList').hide();
    }
    for(var i = 0; i < books.length; i++){
        var option = $('<option></option>').text(books[i].title).click(function(){
            print(this.innerHTML);
        });
        $('.searchList').append(option);
    }
}

function print(val){
    $('#title').val(val);
    $('.searchList').text('');
    $('.searchList').hide();
}
function prepare(page){
    var reader = new FileReader();
    reader.onload = function(e){
        page.e = e;
        //uploadImage(page);
        ready_index++;
        if(ready_index == pages.length){
            startupload();
        }
    }
    reader.readAsDataURL(page.file);
}




function uploadInterval(files, count, callback){
    canLeave = false;
    var length = files.length;

    var opages = [];

    if(length > count) length = count;

    for(var i = 0; i < length; i++){
        var page = new Page(files[i], i);

        stage(page, function(page){

            uploadImageC(page, function( d ){
                if(d.error){
                    callback({error: 'Error with uploading page ('+d.page.index+')'});
                }
                else {
                    opages.push(d.page.link);
                    if(opages.length == count){
                        canleave = true;
                        callback(opages);
                    }
                }
            });
        });
    }
}

function stage(page, callback){
    
    var reader = new FileReader();
    reader.onload = function(e){
        page.e = e;
        callback(page);
    }
    reader.readAsDataURL(page.file);
}

function uploadImageC(page, callback){
    var iurl = page.e.target.result.substr(page.e.target.result.indexOf(",") + 1, page.e.target.result.length);
    var clientId = '98fb764612f62b2';
    $.ajax({
        url: "https://api.imgur.com/3/upload",
        type: "POST",
        datatype: "json",
        data: {
            'image': iurl,
            'type': 'base64'
        },
        success: function(data){
            page.link = data.data.link;

            callback({
                error: null,
                page: page
            });
        },
        error: function( xhr ){
            callback({
                error: xhr,
                page: page
            });
        },
        beforeSend: function ( xhr ) {
            xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
        }
    });
}