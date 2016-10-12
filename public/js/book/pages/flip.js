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