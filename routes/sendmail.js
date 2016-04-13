var key = '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';
var sendgrid = require('sendgrid')(key);

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
	'<a href="https://book4life.herokuapp.com/'+data.link+'">book4life tutorial</a>'+//change bok4life link later
	'</p>'+
	'</footer>';
	return html;
}

function getRegistrationMail(data){
	var html = 
	'<h3>You have created a user at book4life</h3>'+
	'<p>For registration - <a href="https://book4life.herokuapp.com/'+data.link+'">https://book4life.herokuapp.com/'+data.link+'</a></p>'+
	'<p><br>If this isn\'t you then just ignore and we will delete this account!</p>'+
	'<p>Have a nice day sincerely - <a href="https://book4life.herokuapp.com/">book4life</a> :)</p>';
	return html;//change book4life link later!
}

exports.send = function(data, done){
	var email = new sendgrid.Email();
	email.addTo(data.to);
	email.from = 'noreply@book4life.com';

	if(data.config == undefined) { //welcome
		email.from = "book4lifeab@gmail.com";
		email.subject = "Welcome to book4life!";
		email.setHtml(getWelcomeMail(data));
	}
	else { //registration
		email.subject = "Get book4life key!";
		email.setHtml(getRegistrationMail(data));
	}

	sendgrid.send(email, function(err, json){
	  	if(err) { return err; }
	  	else done(null);
	});
}