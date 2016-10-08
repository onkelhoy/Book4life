$(document).ready(function(){

	setLogo($(window).width());
	$('.social_medias > a').css('height', $('.social_medias > a').width()+'px');

	$(window).resize(function(){
		setLogo($(this).width());
		$('.social_medias > a').css('height', $('.social_medias > a').width()+'px');
	});

	function setLogo(width){
		if(width >= 1200){ //large devices (large desktops)
			// $('.logo').css({'left': '10%', 'top': '1%'});
		}
		else if(width >= 992){ //medium devices (desktops)
			// $('.logo').attr('src', 'content/logo1.png');
			$('.logo').css('margin-left', '20%');
		}
		else if(width >= 768){ //small devices (tablets)
			$('.logo').attr('src', 'content/logo2.png');
			$('.logo').css({'margin-top': '0', 'margin-left': '10%'});
		}
		else if(width > 500){
			$('.logo').css('margin-top', '5%');
		}
		else { //extra small devices (phones)
			$('.logo').css('margin-top', '20%');
			$('.logo').attr('src', 'content/logo3.png');
		}
	}

	$('.inputfile').change(function(e){
		var files = e.target.files;
		if(files.length != 0){
			//input placeholder = name

			var div = $(this).parent().parent();
			div.children('input').val(files[0].name);
			// $(this).parent().parent.children().eq(0).val(files[0].name);
		}
	});
});