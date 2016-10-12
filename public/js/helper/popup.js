$(document).ready(function(){

	var msg_elm = $('<div>').addClass('showmsg')
		.append($('<p>'), $('<button>').addClass('btn').text('Okay'));
		
	var con_elm = $('<div>').addClass('confirm').append(
		$('<p></p>').addClass('bg-warning'),
		$('<button></button>').addClass('btn btn-primary').text('Confirm'),
		$('<button></button>').addClass('btn btn-danger').text('Abort').click(function(){hidePop();}));
	
	$('#popup > div').append(msg_elm, con_elm);

	$('#popup').click(function(e){
		if (!$('#popup > div').is(e.target)  && $('#popup > div').has(e.target).length === 0){
			$('#popup').hide();
			$('#popup > div > div').hide();
		}
	});
});

function showError(msg, callback){
	showMSG(msg, {klass: 'danger', callback: callback});
}
function showSucces(msg, callback){
	showMSG(msg, {klass: 'success', callback: callback});
}

function showPopup(index){
	$('#popup > div > div').hide();
	$('#popup').show();
	$('#popup > div').children().eq(0).show();
	$('#popup > div').children().eq(index).show();
}

function hidePop(){
	$('#popup').hide();
	$('#popup > div > div').hide();
}

function showPopupClass(klass){
	$('#popup > div > div').hide();
	$('#popup').show();
	$('#popup > div').children().eq(0).show();
	$('#popup > div').children('.'+klass).show();
}



function showMSG(msg, options){
	var classs = options.klass || 'primary';

	
	var elm = $('div.showmsg');

	elm.children('p').addClass('bg-' + classs).text(msg);
	elm.children('button').unbind().addClass('btn-'+classs).text((options.btnText !== undefined ? options.btnText : 'OK')).click((options.callback !== undefined ? options.callback : function(){hidePop();}));
	
	showPopupClass('showmsg');
}

function showConfirm(text, callback, callback2){
	var elm = $('#popup > div > div.confirm');
	elm.children().eq(0).text(text);
	elm.children().eq(1).unbind().click(callback);
	if(callback2 !== undefined) 
		elm.children().eq(2).unbind().click(callback2);
	
	$('#popup').show();
	$('#popup > div > div').hide();
	$('#popup > div').children().eq(0).show();
	elm.show();

	console.log(elm);
}