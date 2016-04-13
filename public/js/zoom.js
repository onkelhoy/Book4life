var center = document.getElementsByClassName('center');
for(var i = 0; i < center.length; i++){
	var x = (window.innerWidth/2 - center[i].offsetWidth/2) + 'px';
	center[i].style.left = x;
}

document.addEventListener('mousemove', function(e){
	if(zoomElm != null){
		zoomElm.panzoom('option', {
			focal: e
		});
	}
});

var keys = {
	esc: 0,
	minus: 0,
	plus: 0
};
document.addEventListener('keydown', function(key){
	var k = key.keyCode;
	if(k == 27){
		if(keys.esc == 0 && !disPan){
			reset();
		}
		keys.esc = 1;
	}
	if(k == 187){
		if(keys.plus == 0){
			zoomIn();
		}
		keys.plus = 1;
	}
	if(k == 189){
		if(keys.minus == 0){
			zoomOut();
		}
		keys.minus = 1;
	}
});
		
document.addEventListener('keyup', function(key){
	var k = key.keyCode;
	if(k == 27){
		keys.esc = 0;
	}
	if(k == 187){
		keys.plus = 0;
	}
	if(k == 189){
		keys.minus = 0;
	}
});


var disPan = false;
var zoomElm = null;
function zoom(){
	zoomElm = $("#zoomElm");
	zoomElm.panzoom({
		increment: 0.2,
		minScale: 0.8,
		maxScale: 2
	});
	zoomElm.panzoom('option', {
		disablePan: false
	});
	disPan = false;
}

function zoomIn(){
	if(zoomElm != null && !disPan){
		zoomElm.panzoom('zoom');
	}
	else {
		zoom();
		zoomIn();
	}
}
function zoomOut(){
	if(zoomElm != null && !disPan){
		zoomElm.panzoom('zoom', true);
	}
	else {
		zoom();
		zoomOut();
	}
}

function reset(){
	if(zoomElm != null){
		zoomElm.panzoom('reset');
		zoomElm.panzoom('option', {
			disablePan: true
		});
		disPan = true;
	}
}




$('.zoom_controls').hover(
    function() { $(this).children().fadeIn('slow');  },
    function() { $(this).children().fadeOut('slow'); }
);