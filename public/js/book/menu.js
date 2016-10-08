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
		if($(this).val() > 2)
			$('#ratioSlider').val(2).trigger('change');
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

var modifyPage = "";
var leftP = false;
var beforeVal;
function before(index){
	beforeVal = index == 1;
	console.log(beforeVal);
	showPopup(6);
}

// function modify(index, add){
// 	var txt = ((index==0)?"left":"right");
// 	modifyPage = $((index==0)?'.lc':'.rc').text();
// 	if(modifyPage == ""){
// 		if(add){
// 			$('.add').hide();
// 		}
// 		else {
// 			$('.change').hide();
// 		}
// 		showError("There is no current "+txt+" page");
// 	}
// 	else if(modifyPage <= 2 || modifyPage >= $('#book').turn('pagesarr') - 1){
// 		modifyPage = "";
// 		var mes = "You can't modify the current "+txt+" page";
// 		if(add){
// 			mes = "You can't add to the current "+txt+" page";
// 			$('.add').hide();
// 		}
// 		else {
// 			$('.change').hide();
// 		}
// 		showError(mes);
// 	}
// 	else {
// 		//show remove and change btn
// 		leftP = (index == 0);
// 		if(add){
// 			$('.add').show();
// 		}
// 		else {
// 			$('.change').show();
// 		}
// 	}
// }

function checkPage(){
	if(modifyPage != ((leftP) ? $('.lc').text() : $('.rc').text())){
		console.log(modifyPage + ' != ' + ((leftP) ? $('.lc').text() : $('.rc').text()));
		showError('Error - the current page was changed');
		return false;
	}
	else {
		return true;
	}
}
function removeP(){
	showPopup(2);
	$('.removeInfo').text('Are you sure you want to remove the current ' + ((leftP) ? 'left' : 'right') + ' page (' + modifyPage + ')');
	$('.removeCon').click(function(){
		if(checkPage()){
			removePage(modifyPage);
		}
	});
}
function removePage(current){
	if(current - 3 >= 0 && current - 3 < pagesarr.length){
		var pT = $.extend(true, [], pagesarr);
		pT.splice(current - 3, 1);
		updateChapter(pT);
	}
	else {
		console.log("indexoutofbounds");
		showError('Error - there been a misstake, current page is out of bounds!');
	}
}

function changeP(){
	showPopup(1);
}
function uploadChapter() {
	title = book.title;
	chapter = $('#chapterName').val();
	
	hidePop();
	uploadFiles(files, function(err, links){
		if(err) showConfirm('There was an error uploading the images.\n Whould you still like to upload the uploaded images? ()');
		else {

		}
	});
}

function save(index){
	if(index == 0){//upload images
		//upload images
		if(checkPage()){
			var pageIndex = modifyPage - 3;
			if(!beforeVal){
				//after
				pageIndex++;
			}

			if(pageIndex >= 0 && pageIndex <= pagesarr.length){
				getFiles(pageIndex, true);
				showPopup(5);
			}
			else {
				// console.log(modifyPage);
				// console.log(pageIndex);
				showError("pagesarr were out of bounds ~ weird");
			}
		}
	}
	else{//change image
		//validate image link or upload single image
		if(checkPage()){
			if($('#page_link').val() != ""){//validate
				if($('#page_link').val().length < 120){
					validateImage($('#page_link').val(), modifyPage);
				}
				else {
					showError('Error - The link was to long');
				}
			}
			else {//upload
				if(modifyPage - 3 >= 0 && modifyPage - 3 < pagesarr.length){
					getFiles(modifyPage - 3);
					showPopup(5);
				}
				else {
					console.log((modifyPage - 3) + " " + pagesarr.length);
					showError('Error - there been a misstake, current page is out of bounds!');
				}
			}
		}
	}
}

function validateImage(url, current, timeout){
	var img = new Image();
	timeout = timeout || 5000; //5s
	var timedOut = false, timer;
	img.onabort = function(){
		if(!timedOut){
			clearTimeout(timer);
			showError('Error - the image-link was not validated');
			//not validate
		}
	}
	img.onerror = function(){
		if(!timedOut){
			clearTimeout(timer);
			showError('Error - abort the image-link was not validated');
			//not validate
		}
	}
	img.onload = function(){
		if(!timedOut){
			clearTimeout(timer);
			//validated
			if(current - 3 >= 0 && current - 3 < pagesarr.length){
				var pT = $.extend(true, [], pagesarr);
				pT[current - 3] = url;
				console.log('validated link');
				updateChapter(pT);
			}
			else {
				console.log((current - 3) + " " + pagesarr.length);
				showError('Error - there been a misstake, current page is out of bounds!');
			}
		}
	}
	img.src = url;

	timer = setTimeout(function(){
		timedOut = true;
		//not validated
		showError('Error - time reached. The image-link was not validated');
	}, timeout);
}

function DELETE(index){
	showPopup(index);
}
function ADDBOOK(){
	showPopup(4);
}

function deleteConfirmation(index){
	var pas = $('#password').val();
	var err = false;
	if(pas != ""){
		var id = book.id;
		if(id !== undefined){
			console.log(id);
			socket.emit('deleteBook', {id: id, password: pas, user: USERNAME, book: index});
		}
		else {
			err = 'Error - an unresolved error occured';
		}
	}
	else {
		err = 'Error - you need to write your password';
	}
	if(err != false){
		showError(err);
	}
}

function goBack(){
	$.ajax({
		method: 'get',
		url: '/book/title',
		data: {title: book.title},
		success: function(book){
			if(book.length == 0) window.location.href = '/';
			else window.location.href = '/book?id='+book[0].id;
		},
		error: function(xhr){
			window.location.href = "/";
		}
	});
}

function bookRemoved(index){
	var msg = 'this '+((index == 0) ? 'chapter' : 'book')+' has been successfully removed';
	$('button.btn-success').click(function(){
		goBack();
	})
	showSucces(msg);
}


function showBooksetting(){
	$.ajax({
		method: 'GET',
		url: '/book/title',
		data: {
			title: book.title
		}
	}).done(function(books){
		if(books.length != 0){
			var book = books[0];
			var front = (book.front != null ? book.front.split(',') : ['', ''])
			var end = (book.end != null ? book.end.split(',') : ['', '']);

			$('#front-outer').val( front[0] );
			$('#front-inner').val( front[1] );
			$('#end-inner').val( end[1] );
			$('#end-outer').val( end[0] );

			showPopup(7);

		} else showMSG('Can\'t get book with title['+book.title+']', {klass: 'warning'});
	}).fail(function(xhr){
		showMSG(xhr.responseText, {klass: 'danger'});
	});
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
		nextImg = (type == 'front' ? book.front.split(',')[(outer ? 1 : 0)] : book.end.split(',')[(outer ? 1 : 0)]);
	
	var data = {
		type: 'put',
		url: '/book/fe',
		data: {
			link: (outer ? textInput+','+nextImg : nextImg+','+textInput),
			book: book,
			type: type
		},
		success: function( ans ){
			if(!errorelm.hasClass('success')) errorelm.removeClass('danger').addClass('success');
			mama.eq(0).val('').attr('placeholder', ans.split(',')[(outer ? 0 : 1)]);

			errorelm.text(' - Uploaded ');
			errorelm.append($('<i>').addClass('fa fa-check-circle'));
		},
		error: function( xhr ){
			if(errorelm.hasClass('success')) errorelm.removeClass('success').addClass('danger');

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




//add meny
function display(klass, side){
	$('.'+klass).children().unbind();


	$('.'+klass).toggle().children().eq(0).click(function(){
		if(klass == 'add') add(-1, side);
		else modify(true, side); //delete
	});
	$('.'+klass).children().eq(1).click(function(){
		if(klass == 'add') add(1, side);
		else modify(false, side);
	});
}

function add(b, side){
	var currentIndex = Number($((b == -1)?'.lc':'.rc').text()) - 3;

	if(currentIndex >= 0 && currentIndex < pagesarr.length){
		$('#popup > div > div').hide();
		$('#fileUploader').show()
			.children('button').click(function(){
				var files = $(this).parent().children('div').children('#pagesb').get(0).files;
				
				uploadFiles(files, function(images){
					pagesarr.splice(currentIndex, 0, images);
				});
		});
		$('#popup').show();
	}
	else {
		showMSG('Index out of bounds', {klass: 'danger', callback: function(){hidePop();}});
	}
}
function modify(d, side){
	var pagesarr = book.page_url.split(',');
	if(d){ //delete

	}
	else {
		
	}
}