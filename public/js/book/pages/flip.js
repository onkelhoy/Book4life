/*
 * Turn.js responsive book
 */

/*globals window, document, $*/

var init = function () {
    'use strict';

    var module = {
        ratio: 1.38,
        init: function (id) {
            var me = this;

            // if older browser then don't run javascript
            if (document.addEventListener) {
                this.el = document.getElementById(id);
                this.resize();
                this.plugins();

                // on window resize, update the plugin size
                window.addEventListener('resize', function (e) {
                    var size = me.resize();
                    $(me.el).turn('size', size.width, size.height);
                });
                $('#ratioSlider').on('change', function(){
                    me.ratio = 1.38 * $(this).val();
                    var size = me.resize();
                    $(me.el).turn('size', size.width, size.height);
                });
            }
        },
        resize: function () {
            // reset the width and height to the css defaults
            this.el.style.width = '';
            this.el.style.height = '';

            var width = this.el.clientWidth,
                height = Math.round(width / this.ratio),
                padded = Math.round(document.body.clientHeight * 0.9);

            // if the height is too big for the window, constrain it
            if (height > padded) {
                height = padded;
                width = Math.round(height * this.ratio);
            }

            // set the width and height matching the aspect ratio
            this.el.style.width = width + 'px';
            this.el.style.height = height + 'px';

            return {
                width: width,
                height: height
            };
        },
        plugins: function () {
            // run the plugin
            $(this.el).turn({
                gradients: true,
                acceleration: true
            });
            // hide the body overflow
            document.body.className = 'hide-overflow';
        }
    };

    module.init('book');
};

var keys = {
    left: 0,
    right: 0,
};
document.addEventListener('keydown', function(key){
    var k = key.keyCode;
    if(k == 37 || k == 65){
        if(keys.left == 0){
            $('#book').turn('previous');
        }
        keys.left = 1;
    }
    if(k == 39 || k == 68){
        if(keys.right == 0){
            $('#book').turn('next');
        }
        keys.right = 1;
    }
});




document.addEventListener('keyup', function(key){
    var k = key.keyCode;
    if(k == 37 || k == 65){
        keys.left = 0;
    }
    if(k == 39 || k == 68){
        keys.right = 0;
    }
});

$('#slider > span').css('width', 'calc(100%/'+$("#book").turn("pages")+')');

function slider(val){
    // Turn to the page 10
    if(val > 1 && val < $("#book").turn("pages")/2 + 1)
        $("#book").turn("page", val * 2 - 1);
    else
        $("#book").turn("page", (val == 1) ? 1: $("#book").turn("pages"));
}

$("#book").bind("turned", function(event, page, view) {
    var l = $("#book").turn("pages");
    if(page % 2 == 0){
        //even (left side)
        $('.lc').text(page);
        $('.rc').text((page + 1 <= l) ? page + 1 : "");
    }
    else {
        //odd (right side)
        $('.lc').text((page - 1 >= 1) ? page - 1 : "");
        $('.rc').text(page);
    }
    $('.slider').val((page % 2 == 0) ? page/2 + 1 : page/2);
});


 function addPages(pages, book){
    //front
    $.ajax({
        method: 'GET',
        data: {
            title: book.title
        },
        url: '/book/title'
    }).done(function(mainBook){
        addpages(pages, book, (mainBook.length != 0 ? mainBook[0] : null));
    }).fail(function(xhr){
        addpages(pages, book, null);
    });
}

function addpages(pages, book, main){
    if(main == null || main.front == null || main.front == ',') {
        $('#book').append($('<div></div>').addClass('hard page').append($('<div></div>')).append($('<p></p>').text(book.chapter)));
        $('#book').append($('<div></div>').addClass('hard page inside').append($('<div></div>')).append($('<ul></ul>').append($('<li id="title"></li>').text('title - ' + book.title)).append($('<li id="summery"></li>').text('info - ' + book.summery)).append($('<li id="author"></li>').text('author - ' + book.author))));
    } else {
        //add delete option to popup

        var front = main.front.split(',');
        $('#book').append($("<div></div>").append($("<img>").attr('src', front[0])).addClass('page hard'));
        if(front.length > 1) {
            $('#book').append($("<div></div>").append($("<img>").attr('src', front[1])).addClass('page hard'));
        }
        else {
            //only one and a fill

            $('#book').append($('<div></div>').addClass('hard page inside').append($('<div></div>')).append($('<ul></ul>').append($('<li id="title"></li>').text('title - ' + book.title)).append($('<li id="summery"></li>').text('info - ' + book.summery)).append($('<li id="author"></li>').text('author - ' + book.author))));
        }
    }


    for(var i =0 ; i< pages.length; i++){
        var page = $("<div></div>").append($("<img>").attr('src', pages[i]).attr('alt', 'page ' + i)).addClass('page');
        $('#book').append(page);
    }

    if(pages.length % 2 != 0){
        $('#book').append($('<div></div>').addClass('fill').addClass('page'));
    }


    //end
    if(main == null || main.end == null || main.end == ',') {
        $('#book').append($('<div></div>').addClass('hard page inside').append($('<div></div>')));
        $('#book').append($('<div></div>').addClass('hard page').append($('<div></div>')).append($('<p></p>').text('end')));
    } else {
        var end = main.end.split(',');

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