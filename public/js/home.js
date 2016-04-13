$(document).ready(function(){
	var alfa = 'abcdefghijklmnopqrstuvwxyz';
	for(var i = 0; i < alfa.length; i++){
		var elm = $('<li></li>')
		.text(alfa[i])
		.click(function() {
			letterPress($(this).text()) 
		});
		$("#alphabet_list").append(elm)
	}
});

function printbooks(books){
	if(books.length > 0){
		$('.booklist').text('');

		for(var i = 0; i < books.length; i++) {
			var img = $('<img>').attr('src', 'http://i.imgur.com/cUV4dew.png').attr('alt', 'book picture');
			var p = $('<p></p>').text(books[i].title);
			var a = $('<a></a>')
					.attr('href', '/book?id='+books[i].id)
					.append(img)
					.append(p);

			var book = $('<div></div>')
				.attr('id', 'book')
				.addClass('col-sm-2')
				.append(a);
			$('.booklist').append(book);
		}
	}
}