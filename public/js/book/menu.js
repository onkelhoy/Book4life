$(document).ready(function(){
	var menuShowed = false;

	$('.inputfile + button').click(function(){
		$(this).parent().children('.inputfile').trigger('click');
	});
	$('.menuBtn').click(function(){
		$('.menu').show();
		$('.menu').animate({left: '0px'}, 200, function(){
			menuShowed = true;//its finished
		});
		$(this).hide();
	});

	$(document).mouseup(function (e) {
	    var tar = $(".menu");

	    if (!tar.is(e.target)  && tar.has(e.target).length === 0 && menuShowed && !$('#popup').is(":visible")){
			hide();
	    }
	});

	$('.closeMenu').click(function(){
		hide();
	});

	function hide(){
		$('.menu').animate({left: (-$('.menu').width()) + 'px'}, 40, function(){
			$('.menuBtn').show();
			$(".menu").hide();
			menuShowed = false;
		});
	}

	$('.lb').click(function(){
	    $('#book').turn('previous');
	});
	$('.rb').click(function(){
	    $('#book').turn('next');
	});

	$('.nav > li').click(function(e){
		navClick($(this), e);
	});

	$('#ratioSlider').on('change', function(){
		$('#ratioInfo').val($(this).val());
	});
	$('#ratioInfo').on('change', function(){
		if($(this).val() > 2.5)
			$('#ratioSlider').val(2.5).trigger('change');
		else if($(this).val() < 0.5)
			$('#ratioSlider').val(0.5).trigger('change');
		else
			$('#ratioSlider').val($(this).val()).trigger('change');
	});

	$('input[type=range]').on('input', function () {
	    $(this).trigger('change');
	});

	function navClick(elm, e){
		var i = elm.children('p').children('i');
		var div = elm.children('div');

		if(i.hasClass('fa-caret-left')){
			i.removeClass('fa-caret-left');
			i.addClass('fa-caret-down');
			
			div.show();
		}
		else if(i.hasClass('admin') && !i.hasClass('admin_r')){
			i.addClass('admin_r');
			rotateCog(100);
			div.show();
		}
		else if(!div.is(e.target) && div.has(e.target).length == 0){//hide
			if(!i.hasClass('admin')){
				i.addClass('fa-caret-left');
				i.removeClass('fa-caret-down');
			}
			else {
				rotateCog(0);
				i.removeClass('admin_r');
			}
			div.hide();
		}
	}

	function rotateCog(a){
		$('i.admin').animate({rotation: a},{
			duration: 300,
			step: function(now, fx){
				$(this).css('transform', 'rotate('+now+'deg)');
			}
		});
	}
});