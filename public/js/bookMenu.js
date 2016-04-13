$(document).ready(function(){
	var menuShowed = false;

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
	$('#popup').click(function(e){
		if (!$('#popup > div').is(e.target)  && $('#popup > div').has(e.target).length === 0){
			$('#popup').hide();
			$('#popup > div > div').hide();
		}
	});
});

var modifyPage = "";
var leftP = false;
var beforeVal;
function before(index){
	beforeVal = index == 1;
	showPopup(6);
}

function modify(index, add){
	var txt = ((index==0)?"left":"right");
	modifyPage = $((index==0)?'.lc':'.rc').text();
	if(modifyPage == ""){
		if(add){
			$('.add').hide();
		}
		else {
			$('.change').hide();
		}
		showError("There is no current "+txt+" page");
	}
	else if(modifyPage <= 2 || modifyPage >= $('#book').turn('pages') - 1){
		modifyPage = "";
		var mes = "You can't modify the current "+txt+" page";
		if(add){
			mes = "You can't add to the current "+txt+" page";
			$('.add').hide();
		}
		else {
			$('.change').hide();
		}
		showError(mes);
	}
	else {
		//show remove and change btn
		leftP = (index == 0);
		if(add){
			$('.add').show();
		}
		else {
			$('.change').show();
		}
	}
}

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
	if(current - 3 >= 0 && current - 3 < pages.length){
		var pT = $.extend(true, [], pages);
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
function hidePop(){
	$('#popup').hide();
}

function uploadChapter() {
	canleave = false;
	title = book.title;
	chapter = $('#chapterName').val();
	
	hidePop();
	// $(".menu").hide();

	bookUpload();

	
	//socket.emit('upload', book);
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

			if(pageIndex >= 0 && pageIndex <= pages.length){
				getFiles(pageIndex, true);
				showPopup(5);
			}
			else {
				console.log(modifyPage);
				console.log(pageIndex);
				showError("Pages were out of bounds ~ weird");
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
				if(modifyPage - 3 >= 0 && modifyPage - 3 < pages.length){
					getFiles(modifyPage - 3);
					showPopup(5);
				}
				else {
					console.log((modifyPage - 3) + " " + pages.length);
					showError('Error - there been a misstake, current page is out of bounds!');
				}
			}
		}
	}
}

function showError(msg, index){
	if(index !== undefined){
		showPopup(1);
	}
	else {
		showPopup(3);
	}
	$('.bg-danger').text(msg);
}
function showSucces(msg, index, callback){
	if(index !== undefined){
		showPopup(3);
	}
	else {
		showPopup(4);
	}
	$('.bg-success').text(msg);
	if(callback){
		$('#successBTN').click(function(){ callback(); });
	}
}

function showPopup(index){
	$('#popup').show();
	$('#popup > div > div').hide();
	$('#popup > div').children().eq(0).show();
	$('#popup > div').children().eq(index).show();
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
			if(current - 3 >= 0 && current - 3 < pages.length){
				var pT = $.extend(true, [], pages);
				pT[current - 3] = url;
				console.log('validated link');
				updateChapter(pT);
			}
			else {
				console.log((current - 3) + " " + pages.length);
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
		if(index == 0){//chapter
			showError(err);
		}
		else {//book
			showError(err, index);
		}
	}
}

function goBack(){
	if(book.kapitel == 1){//chapter
		console.log("this");
		socket.emit('goback', book.title);
	}
	else {
		window.location.href = "/";
	}
}
function goBackToBook(id){
	if(id != -1){
		window.location.href = "/book?id="+id;
	}
	else {//this should not happend! :(
		window.location.href = "/";
	}
}

function bookRemoved(index){
	var msg = 'this '+((index == 0) ? 'chapter' : 'book')+' has been successfully removed';
	$('button.btn-success').click(function(){
		goBack();
	})
	if(index == 0){//chapter
		showSucces(msg);
	}
	else {
		showSucces(msg, index);
	}
}