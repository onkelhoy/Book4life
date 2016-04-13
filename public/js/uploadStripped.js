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

    $.post('/confirmCreator',
    { name: bookNew.creator },
    function(data){
        if(data != 'error'){
            socket.emit('updateChapter', bookNew);
        }
        else {
            showError('You do not have permission to change this content!');
        }
    });
}