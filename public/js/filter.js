function validateText(text) {
	if(text.match(/[^\w\s\-\.\,]/)){ // not valid
		return false;
	}
	else { // valid
		return true;
	}
}

function validateTextMore(text) { //add in for special characters å,ä,ö.. etc
	if(text.match(/[^\w\s\-\.\,]/)){ // not valid
		return false;
	}
	else { // valid
		return true;
	}
}

function validateMail(mail){
	var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(mail);
}