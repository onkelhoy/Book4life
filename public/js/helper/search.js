function letterPress(letter){
	$.ajax({
		method: 'get',
		url: '/book/letter/'+letter,
		success: printbooks,
		error: function(xhr){
			showError(xhr.responseText);
		}
	});
}
function search(val){ //change this regex to validateText later!
	if(/\S/.test(val)) { // get a specific book by search (can of course send back lots)
		$.ajax({
			method: 'get',
			url: '/book/search/'+val,
			success: printbooks,
			error: function(xhr){
				showError(xhr.responseText);
			}
		});
	}
}