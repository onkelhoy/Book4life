socket = io('/');
socket.on('searchResults', printbooks);
socket.on('letterResults', printbooks);

function letterPress(letter){
	socket.emit('searchbooks', letter);
}
function search(val){ //change this regex to validateText later!
	if(/\S/.test(val)) { // get a specific book by search (can of course send back lots)
		socket.emit('searchbook', val);
	}
}

letterPress('a'); // print the defualt books