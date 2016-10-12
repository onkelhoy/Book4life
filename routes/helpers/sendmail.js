var helper = require('sendgrid').mail;
var sg = require('sendgrid')("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");

function getWelcomeMail(data) {
	var html = 
	'<header style="width: 100%;background-color: #FFD1D1;padding: 20px;box-shadow: 0 0 3px black;">'+
	'<h1 style="text-align: center;">Welcome to book4life '+data.usn+'!</h1>'+
	'<p style="width: 80%;margin: auto;">We hope you will like it here, and we really hope you\'re into books as much as we do beacuse then you\'re in for a treat! Before you start check out some short info about the website :)</p>'+
	'</header>'+
	'<article style="width: 100%;float: left;padding: 25px;">'+
	'<section style="float: left;padding: 12px;box-sizing: border-box;width: 30%;">'+
	'<h3>What book4life is</h3>'+
	'<p>A website were you can share your</p>'+
	'<ul>'+
	'<li>knowledge</li>'+
	'<li>history</li>'+
	'<li>story</li>'+
	'<li>thoughts</li>'+
	'</ul>'+
	'</section>'+
	'<section style="float: left;padding: 12px;box-sizing: border-box;width: 50%;">'+
	'<h3>What book4life isn\'t</h3>'+
	'<p>A website were you</p>'+
	'<ul>'+
	'<li>share hate</li>'+
	'<li>discriminate people</li>'+
	'<li>upload other peoples work</li>'+
	'<li>advertise</li>'+
	'</ul>'+
	'</section>'+
	'</article>'+
	'<footer style="width: 100%;padding: 20px;float: left;background-color: #F0F2FF;">'+
	'<p>blabla.. lets get started!</p>'+
	'<p>Master book4life with our really fast and easy tutorial - '+
	'<a href="https://book4life.herokuapp.com/chapter/278">book4life tutorial</a>'+//change bok4life link later
	'</p>'+
	'</footer>';
	return html;
}

function getRegistrationMail(data){
	var html = 
	'<h3>You have created a user at book4life</h3>'+
	'<p>For registration - <a href="https://book4life.herokuapp.com/authenticate/confirm/'+data.link+'">https://book4life.herokuapp.com/authenticate/confirm/'+data.link+'</a></p>'+
	'<p><br>If this isn\'t you then just ignore and we will delete this account!</p>'+
	'<p>Have a nice day sincerely - <a href="https://book4life.herokuapp.com/">book4life</a> :)</p>';
	return html;//change book4life link later!
}


exports.send = function(data, callback){
	var from_email, to_email, subject, content, mail;

	to_email = new helper.Email();
	to_email.email = data.to;

	if(data.key) {
		subject = "Get book4life key!";
		from_email = new helper.Email('noreply@book4life.com');
		content = new helper.Content("text/html", getRegistrationMail(data));
	}
	if(data.welcome) {
		subject = "Welcome to book4life!";
		from_email = new helper.Email('book4lifeab@gmail.com');
	    content = new helper.Content("text/html", getWelcomeMail(data));
	}


	mail = new helper.Mail(from_email, subject, to_email, content);

	var errors = {
		400: "400 - BAD REQUEST",
		401: "401 - UNAUTHORIZED",
		403: "403 - FORBIDDEN",
		404: "404 - NOT FOUND",
		405: "405 - METHOD NOT ALLOWED",
		413: "413 - PAYLOAD TOO LARGE",
		429: "429 - TOO MANY REQUESTS",
		500: "500 - SERVER ERROR",
		503: "503 - SEVICE NOT AVAILABLE"
	}
	
	var requestBody = mail.toJSON()

	var request = sg.emptyRequest()
	request.method = 'POST'
	request.path = '/v3/mail/send'
	request.body = requestBody
	sg.API(request, function (response) {
		if(response) {
			if(response.statusCode >= 400){
		      //error
		      callback(errors[response.statusCode])
		    } else callback(null);
		} else callback(null);
	});
}