var pagesarr = BOOK.pages.split(',');

window.onload = function(){
    addpages(pagesarr, BOOK);
    $('#ratioInfo').val(BOOK.ratio);
    $('#ratioSlider').val(BOOK.ratio).trigger('change');
    
    if(USER.admin != 1) {
        if(USER.id != BOOK.creatorID) $('#admin').remove();
        else $('#admin').show();
    } else $('#admin').show();

    function setInfo(rows){
        if(BOOK != -1){
            $('#summery').text('info - ' + BOOK.summery);
            $('#author').text('author - ' + BOOK.author);
        }
    }
}

function removechap(){
    showConfirm('Are you sure you would like to remove the current chapter?', function(){
        $.ajax({
            method: 'delete',
            url: '/chapter/'+BOOK.id,
            success: function(){
                goBack();
            },
            error: function(xhr){
                showError(xhr.responseText);
            }
        })
    });
}
function goBack(){
	window.location.href = '/book/'+BOOK.bookid;
}
function remove(){
    var pageindex = Number($('.modifypages').attr('side'));
    
    if(pageindex >= 0 && pageindex < pagesarr.length){
        showConfirm('Are you sure you want to remove the current page ('+ pageindex +')?', function(){
            // console.log('remove', 'index: ' + pageindex, pagesarr);
            pagesarr.splice(pageindex, 1);

            // console.log(pagesarr);
            uploadPages(pagesarr.toString());
        });
    } else {
        showError('You cant delete this page');
    }
}
function doChange(side){
    var i = Number($('.'+side).text()) - 3;
    $('.modifypages').attr('side', i);
    $('.modifypages > div > label > span').text((side == 0 ? 'left' : 'right'));
    $('#pagelink').attr('placeholder', (i >= 0 && i < pagesarr.length ? pagesarr[i] : 'This is an empty page'));
    showPopupClass('modifypages');
}
function change(){
    var pageindex = Number($('.modifypages').attr('side'));
    
    if(pageindex >= 0 && pageindex < pagesarr.length) {
        var timer = null;

        var errorelm = $('.modifypages > div > span'),
            textInput = $('#pagelink').val(),
            fileInput = $('#pagefile').get(0).files;
        
        
        if(fileInput.length != 0){
            //upload image then upload to database
            errorelm.removeClass('danger').addClass('success').text(' - Uploading image.');
            timer = setInterval(function(){
                errorelm.append('.');
                if(errorelm.text() == ' - Uploading image....') errorelm.text(' - Uploading image.');
            }, 300);
            upload(fileInput[0], function(err, image){
                if(err) errorelm.text(err);
                else {
                    clearInterval(timer);
                    pagesarr[pageindex] = image;
                    uploadPages(pagesarr.toString());
                }
            });
        } else if(textInput != '') {
            var img = new Image();
            img.onload = function(){
                pagesarr[pageindex] = textInput;
                uploadPages(pagesarr.toString());
            }
            img.onerror = function(){
                errorelm.text(' - Not a valid image link');
            }
            img.src = textInput;
        }
        else errorelm.text(' - No values where set');
    } else {
        showError('You cant update this page');
    }
}
function saveRatio(){
    $.ajax({
        method: 'put',
        url: '/chapter/ratio',
        data: {
            id: BOOK.id,
            ratio: $('#ratioInfo').val()
        },
        success: function(ans){
            showSucces('ratio was saved');
        },
        error: function(xhr){
            showError(xhr.responseText);
        }
    })
}
function add(){
    var files = $('#page1').get(0).files;
    var currentIndex = $("#book").turn("page")-2;
    if(currentIndex > 0) currentIndex -= currentIndex%2;
    
    
    if(currentIndex < 0 || (currentIndex - pagesarr%2) > pagesarr.length) showError('You cant insert pages here');
    else {
        uploadFiles(files, function(err, links){
            if(err) showError('There was a problem uploading the pages');
            else {
                var arr = pagesarr.insertArray(links, currentIndex);
                uploadPages(arr.toString());
            }
        });
    }
}
function uploadPages(pages){
    $.ajax({
        method: 'put',
        url: '/chapter/images',
        data: {
            id: BOOK.id,
            links: pages
        },
        success: function(ans){
            location.reload(); // insert pages without reload
        },
        error: function(xhr){
            showError(xhr.responseText);
        }
    });
}


function addpages(pages, book){
    if(book.front == null || book.front == ',') {
        $('#book').append($('<div></div>').addClass('hard page').append($('<div></div>')).append($('<p></p>').text(book.chapter)));
        $('#book').append($('<div></div>').addClass('hard page inside').append($('<div></div>')).append($('<ul></ul>').append($('<li id="title"></li>').text('title - ' + book.title)).append($('<li id="summery"></li>').text('info - ' + book.summery)).append($('<li id="author"></li>').text('author - ' + book.author))));
    } else {
        //add delete option to popup
        var front = book.front.split(',');
        $('#book').append($("<div></div>").append($("<img>").attr('src', front[0])).addClass('page hard'));
        if(front.length > 1) {
            $('#book').append($("<div></div>").append($("<img>").attr('src', front[1])).addClass('page hard'));
        }
        else {
            //only one and a fill
            $('#book').append($('<div></div>').addClass('hard page inside').append($('<div></div>')).append($('<ul></ul>').append($('<li id="title"></li>').text('title - ' + book.title)).append($('<li id="summery"></li>').text('info - ' + book.summery)).append($('<li id="author"></li>').text('author - ' + book.author))));
        }
    }

    for(var i =0 ; i< pages.length; i++){ // LOADING IN ALL PAGES
        var page = $("<div></div>").append($("<img>").attr('src', pages[i]).attr('alt', 'page ' + i)).addClass('page');
        $('#book').append(page);
    }
    if(pages.length % 2 != 0){
        $('#book').append($('<div></div>').addClass('fill').addClass('page'));
    }

    //end
    if(book.end == null || book.end == ',') {
        $('#book').append($('<div></div>').addClass('hard page inside').append($('<div></div>')));
        $('#book').append($('<div></div>').addClass('hard page').append($('<div></div>')).append($('<p></p>').text('end')));
    } else {
        var end = book.end.split(',');
        if(end.length > 1) {
            $('#book').append($("<div></div>").append($("<img>").attr('src', end[1])).addClass('page hard'));
        }
        else { //only one and a fill
            $('#book').append($('<div></div>').addClass('hard page inside').append($('<div></div>')));
        }
        $('#book').append($("<div></div>").append($("<img>").attr('src', end[0])).addClass('page hard'));
    }

    init();
    $('.slider').attr('max', $("#book").turn("pages")/2 + 1);
}

function blacked(){
    if($('body').hasClass('black')){
        $('body').removeClass('black');
        $('.shadow').css('box-shadow', '0 0 15px #888');
        $('.zoom_controls > li > button ').removeClass('blacked');
        $('#darkTheme').css('color', 'black');
        $('.menuBtn').css('color', '#444');
    }
    else {
        $('body').addClass('black');
        $('.shadow').css('box-shadow', '0 0 15px #000');
        $('.zoom_controls > li > button ').addClass('blacked');
        $('#darkTheme').css('color', 'white');
        $('.menuBtn').css('color', '#eee');
    }
}