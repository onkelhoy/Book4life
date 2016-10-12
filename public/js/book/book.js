window.onload = function(){
	$.ajax({
		method: 'get',
		url: '/chapter/bookid/'+BOOK.id,
		success: function(chapters){
			chapters.forEach(function(chapter){
				var div = $('<div>').addClass('col-sm-2 col-xs-6 bookclass').append(
					$('<a>').attr('href', '/chapter/'+chapter.id).append(
						$('<img>').attr('src', 'http://i.imgur.com/1P4vzie.png').attr('alt', 'chapter picture'),
						$('<p>').text(chapter.name)));

				$('.booklist').append(div);
			});
		},
		error: function(xhr){
			showError(xhr.responseText);
		}
	});

	if(USER.admin != 1){
		if(BOOK.creator == USER.id || USER.username == BOOK.creator) {
            $('#admin').show();
        	$('#adminDelete').remove();
        } 
    	else $('#admin').remove();
    }
	else $('#admin').show();
}

function addChapter(pages, name){
	$.ajax({
		method: 'post',
		url: '/chapter',
		data: {
			bookid: BOOK.id,
			pages: pages,
			name: name
		},
		success: function(ans){
			showSucces('Chapter was successfully added!',
				function(){
					window.location.href = '/chapter/'+ans.insertId;
			});
		},
		error: function(xhr){
			showError(xhr.responseText);
		}
	});
}
function removeConfirm(){
	$.ajax({
		url: '/authenticate/password/'+$('#password').val(),
		method: 'get',
		success: function(ans){
			remove();
		},
		error: function(xhr){
			showError(xhr.responseText);
		}
	})
}
function remove(){
	$.ajax({
		method: 'delete',
		url: '/book/'+BOOK.id,
		success: function(ans){
			showSucces('Book was successfully removed', function(){
					window.location.href = '/';
				});
		},
		error: function(xhr){
			showError(xhr.responseText);
		}
	});
}
function uploadChapter(input) {
	var name = $('#chapterName').val();
	
	hidePop();
	uploadFiles(input.get(0).files, function(err, links){
		if(err) showConfirm('There was an error uploading the images.\n Whould you still like to upload the uploaded images? ()',
			addChapter(links, name), showConfirm('Are you sure wish to abort?', hidePop, addChapter(links, name)));
		else addChapter(links, name);
	});
}

function SEsettings(){ //front-end settings
	var front = BOOK.front.split(',');
	var end = BOOK.end.split(',');
	$('#front-outer').val( front[0] );
	$('#front-inner').val( front[1] );
	$('#end-inner').val( end[1] );
	$('#end-outer').val( end[0] );

	showPopupClass('front-end_settings');
}

function bsUpload(elm, index){
	var type = 'front', outer = true;
	if(index > 2) type = 'end';

	if(index % 2 == 0) outer = false;
	var bigMama = elm.parent().parent();
	var mama = bigMama.children();

	var errorelm = bigMama.parent().children('label').children('span');

	var textInput = mama.eq(0).val(),
		fileInput = mama.eq(1).children('input').get(0).files,
		nextImg = (type == 'front' ? BOOK.front.split(',')[(outer ? 1 : 0)] : BOOK.end.split(',')[(outer ? 1 : 0)]);
	
	var data = {
		type: 'put',
		url: '/book/fe',
		data: {
			link: (outer ? textInput+','+nextImg : nextImg+','+textInput),
			book: BOOK,
			type: type
		},
		success: function( ans ){
			errorelm.addClass('text-success');
			if(errorelm.hasClass('text-danger')) errorelm.removeClass('text-danger');
			mama.eq(0).val('').attr('placeholder', ans.split(',')[(outer ? 0 : 1)]);

			errorelm.text(' - Uploaded ');
			errorelm.append($('<i>').addClass('fa fa-check-circle'));
		},
		error: function( xhr ){
			errorelm.addClass('text-danger');
			if(errorelm.hasClass('text-success')) errorelm.removeClass('text-success');

			errorelm.text(' - ' + xhr.responseText);
		}
	}

	var timer = null;

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
				data.data.link = (outer ? image.toString() + ','+nextImg : nextImg+','+image.toString());
				clearInterval(timer);
				$.ajax(data);
			}
		});
	} else if(textInput != '') {
		var img = new Image();
		img.onload = function(){
			$.ajax(data);
		}
		img.onerror = function(){
			errorelm.text(' - Not a valid image link');
		}
		img.src = textInput;
	}
	else errorelm.text(' - No values where set');
}