var sess;
var connect = require('./getSql');
var crypte = require('./crypte');
var filter = require('./filter');
var mail = require('./sendmail');

var pendingUsers = [];
var canCheck = true;
var getPendingUsers = [];
setInterval(function(){
	checkPendingUsers();
}, 86400000); //one day - 86400000

function checkPendingUsers(user, callback){
	if(user){
		if(canCheck){//preventing double delete or something..(should be async? but for now this should work)
			//usn and link
			var index = getPendingUsers[user.u];
			if(index != undefined){
				if(pendingUsers[index].link == user.c){
					var mail = "";
					pendingUsers.splice(index, 1);
					delete getPendingUsers[user.u];

					emitUser(user.u, callback);
				}
				else return callback('e');
			}
			else return callback('e');
		}
		else return callback('it occured some problems please come back in a short bit :)', null);
	}
	else {
		canCheck = false;
		var del = [];
		currentIndex = 0;
		for(var i = 0; i < pendingUsers.length; i++){
			if(Date.now() - pendingUsers[i].date >= 259200000){//three days -> 259200000
				//expired user.. delete
				del.push(pendingUsers[i].username);
			}
		}
		for(var i = 0; i < del.length; i++){
			console.log("deleting user " + del[i]);
			deleteUser(del[i]);
			delete getPendingUsers[del[i]];
			pendingUsers.splice(0, 1);
		}
		canCheck = true;
	}
}
function deleteUser(username){
	var sql = connect.getConnection();
	if(sql != null){
		sql.query("DELETE FROM `users` WHERE `name` = '"+username+"' AND `emitted` = '0'",
		function(err) {} );
		sql.end();
	}
}
function emitUser(username, callback){
	var sql = connect.getConnection();
	if(sql != null){
		sql.query("UPDATE `users` SET `emitted`=1 WHERE `name` = '"+username+"'",
		function(err) {
			if(err) {
				return callback('e');
			}
			else {
				getEmail(username, callback);
			}
		});
		sql.end();
	}


}
function getEmail(username, callback){
	var sql = connect.getConnection();
	if(sql != null){
		sql.query("SELECT `mail` FROM `users` WHERE `name` = '"+username+"'",
		function(err, rows) {
			if(err) return callback('e');
			else if(rows.length == 1) {
				return callback(null, rows[0].mail);
			}
			else return callback('e');
		});
		sql.end();
	}
}




//	THE GET FUNCTIONS
exports.index = function(req, res){
	sess = req.session;
	if(!sess.username){
		// console.log('login');
		res.redirect('/login');
	}
	else {
		res.render('Home', {
			title: 'Book4life',
			classname: 'home',
			username: sess.username
		});
	}
}

exports.book = function(req, res){
	sess =  req.session;
	if(sess.username){
		var id = req.query.id;
		if(id !== undefined && !id.match(/[^0-9]/)){
			var sql = connect.getConnection();
			if(sql != null){
				var command = "SELECT * FROM `book` WHERE id = " + id;
				sql.query(command,
				function(err, rows, fields) {
					if(err) {
						console.log(err);
						res.redirect('/404-book');
					}
					else if(rows.length == 1) {

						if(rows[0].kapitel == 1){ // this is a chapter.. show the pages
							res.render('book', {
								book: rows[0],
								admin: sess.admin,
								title: rows[0].title,
								username: sess.username
							});
						}
						else { // this is a book.. show all chapters
							var sql2 = connect.getConnection();
							if(sql2 != null){
								command = "SELECT * FROM book WHERE title='"+ rows[0].title +"' AND kapitel=1";
								sql2.query(command, function(err, rows2, fields){
									if(err) {
										console.log(err);
										res.redirect('/404-book');
									}
									else if(rows2.length > 0) {
										res.render('book', {
											chapters: rows2,
											admin: (sess.admin ? sess.admin : false),
											book: rows[0],
											title: rows[0].title,
											username: sess.username
										});
									}
									else {
										console.log('cant find chapters');
										res.redirect('/404-book');
									}
								});
								sql2.end();
							} else {
								res.redirect('/sqlError');
							}
						}
					}
					else {
						console.log('cant find book');
						res.redirect('/404-book');
					}
				});
				sql.end();
			}
			else {
				res.redirect('/sqlError');
			}
		}
		else {
			res.redirect('/404-book'); //404
		}
	}
	else {
		res.redirect('/login');
	}
}
exports.sqlError = function(req, res){
	sess = req.session;
	res.render('defualt', {
		title: 'book4life - Database error',
		classname: 'sql',
		username: sess.username,
		type: 'sql-error'
	});
	res.end();
}
exports.login = function(req, res){
	sess = req.session;
	res.render('User', {
		title: 'Login',
		classname: 'login'
	});
	res.end();
}
exports.problem = function(req, res){
	sess = req.session;
	var id = req.query.id;
	var type = [{
			title: 'Login problems',
			problem: 0
		}, {
			title: 'Registration problems',
			problem: 1
		}, {
			title: 'Uploading problems',
			problem: 2
		}
	];

	if(id === undefined || id > 2 || id < 0 || id.match(/[^0-9]/)){
		res.redirect('/bad');
	}
	else {
		res.render('defualt', {
			title: type[id].title,
			classname: 'problem',
			problem: type[id].problem,
			username: sess.username,
			type: 'problem'
		});
	}
	res.end();
}
exports.signup = function(req, res){
	sess = req.session;
	res.render('User', {
		title: 'Register',
		classname: 'register'
	});
	res.end();
}
exports.logout = function(req, res){
	sess = req.session;
	var usn = sess.username;
	req.session.destroy(function(err){
		if(err) res.status(404).send('YOU CANNOT LOG OUT!');
		else res.redirect('/');
	});
}
exports.bad = function(req, res){
	sess = req.session;
	res.render('defualt', {
		title: 'book4life - 404',
		classname: 'bad',
		username: sess.username,
		type: '404'
	});
}
exports.upload = function(req, res){
	sess = req.session;
	if(sess.username){
		res.render('upload', {
			title: 'Upload a Book',
			username: sess.username
		});// later admin should be passed along every time..
	}
	else {
		res.redirect('/login');
	}
}
exports.confirm = function(req, res){
	//sess = req.session; //dont lose session due to playarounds (i dont think it would.. bu fr safty)
	//UPDATE `users` SET `emitted`= 1 WHERE `name` = "oscar"
	checkPendingUsers(req.params, function(err, email){
		if(err) {
			if(err == 'e') res.redirect('/404');
			else res.send(err);	
		}
		else if(email) {
			//send email
			sendWelMail({
				usn: req.params.u,
				mail: email
			}, function(err, success){
				if(err) res.send(err);
				else res.redirect('/login');
			});
		}
	});
}
function sendWelMail(data, callback){
	mail.send({ 
		usn: data.usn,
		to: data.mail,
		link: 'book?id=67'
	}, function(err){
		if(err) {
			return callback('error sending welcome mail - check out https://book4life.herokuapp.com/book?id=67 for learning', null);
	  	}
		else {
			return callback(null, 'done');
		}
	});
}
function sendConMail(data, callback){
	mail.send({ 
		link: 'confirm/'+data.usn+'/'+data.confirmLink,
		config: true,
		to: data.mail
	}, function(err){
		if(err) {
			return callback('error sending registration mail - email us your username, add "MAIL ERROR" as your title and we will look into it', null);
	  	}
		else {
		  	pendingUsers.push({"username": data.usn, "date": Date.now(), "link": data.confirmLink});
			getPendingUsers[data.usn] = pendingUsers.length-1;
			return callback(null, 'done');
		}
	});
}
exports.tutorial = function(req, res){
	res.send('there will be a tutorial later');
}
//	THE POST FUNCTIONS
exports._login = function(req, res){
	sess = req.session;
	var usn = req.body.user;
	var pas = req.body.pass;
	//FILTER THESE OUT!!
	if(filter.text(usn) && filter.text(pas)){
		var sql = connect.getConnection();
		if(sql != null){
			var command = "SELECT * FROM `users` WHERE `name` = '" + usn + "'";
			sql.query(command,
			function(err, rows, fields) {
				if(err){
					console.log(err);
					res.end('There occured some problems please try again');
				}
				else if(rows.length == 0){
					res.end('Username or password dont match');
				}
				else if(crypte.isSame(rows[0].password, pas)){
					if(rows[0].emitted == 1){
						// users.push(usn);
						sess.username = usn;
						if(rows[0].admin == 1){
							sess.admin = true;
						}

						res.end('done');
					}
					else {
						res.end('User haven\'t got a book4life-key yet!');
					}
				}
				else {
					res.end('Username or password dont match');
				}
			});
			sql.end();
		} else {
			res.redirect('/sqlError');
		}
	}
	else {
		res.end('Values contains non usable characters');
	}
}
exports._confirmCreator = function(req, res){
	sess = req.session;
	var user = req.body.name;
	if(filter.text(user)){//there can't be enough of security!
		if(sess.username == user || sess.admin){
			res.end('done');
		}
		else {
			res.end('error');
		}
	}
	else {
		res.end('error');
	}
}
exports._register = function(req, res){
	sess = req.session;
	var usn = req.body.user;
	var pas = req.body.pass;
	var mail = req.body.mail;
	//FILTER THESE OUT!!
	if(filter.text(usn) && filter.text(pas) && filter.mail(mail)){
		var sql = connect.getConnection();
		var pass = crypte.enCrypte(pas);
		if(sql != null){
			var command = "SELECT * FROM `users` WHERE `name` = '" + usn + "' OR `mail` = '"+mail+"'";
			sql.query(command,
			function(err, rows, fields) {
				if(err){
					console.log(err);
					res.end('There occured some problems please try again');
				}
				else if(rows.length > 0){
					res.end('User already exist!');
				}
				else {
					addUser(usn, pass, mail, function(err, success){
						if(err) res.end(err);
						else if(success) res.end(success)
						else res.redirect('/sqlError');
					});
				}
			});
			sql.end();
		} else {
			res.redirect('/sqlError');
		}
	}
	else {
		res.end('Values contains non usable characters');
	}
}
function addUser(usn, pass, mail, callback){
	var sql = connect.getConnection();
	if(sql != null){
		var command = "INSERT INTO `users` (`name`, `mail`, `password`, `id`, `tutorial`, `emitted`, `admin`) VALUES ('"+usn+"', '"+mail+"', '"+pass+"', NULL, '0', '0', '0')";
		sql.query(command,
		function(err, rows, fields) {
			if(err){
				return callback('There occured some problems please try again', null);
			}
			else {
				// console.log('user created');
				var clink = crypte.enCrypte(usn);
				var con = clink.replaceAll("#","+");
				sendConMail({usn: usn, confirmLink: con, mail: mail}, callback);
			}
		});
		sql.end();
	} else {
		return callback(null, null);
	}
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
