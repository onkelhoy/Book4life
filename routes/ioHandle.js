var connect = require('./getSql');
var filter = require('./filter');
var crypte = require('./crypte');

exports.start = function(io){
	io.on('connection', function(client){
		client.on('searchbook', searchbook);
		client.on('searchTitle', searchTitle);
		client.on('searchbooks', searchbooks);
		client.on('validatebook', validatebook);
		client.on('upload', uploadBook);
		client.on('updateChapter', updateChapter);
		client.on('deleteBook', deleteBook);
		client.on('goback', redirectToBook);
	});
}
function redirectToBook(title){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		sql.query("SELECT * FROM `book` WHERE `title` = '"+title+"' AND kapitel != '1'",
		function(err, rows) {
			if(err) {
				client.emit('gobackToBook', -1);
			}
			else if(rows.length != 0) { 
				client.emit('gobackToBook', rows[0].id);
			}
			else {
				client.emit('gobackToBook', -1);
			}
		});
		sql.end();
	}
	else {
		client.emit('sqlError');
	}
}
function deleteBook(data){
	var client = this;
	if(filter.validateTextMore(data.password) &&
		filter.validateTextMore(data.user) &&
		filter.validateNum(data.id)){

		var sql = connect.getConnection();
		if(sql != null){
			sql.query("SELECT * FROM users WHERE name = '"+data.user+"'",
			function(err, rows) {
				if(err) {
					client.emit('updateAns', {type: 'error', msg: 'Error - it occured some problems, please try again later'});
				}
				else if(rows.length != 0) {
					if(crypte.isSame(rows[0].password, data.password)){
						var sql2 = connect.getConnection();
						if(sql2 != null){
							sql2.query("DELETE FROM `book` WHERE `id` = '"+ data.id +"'",
							function(err) {
								if(err) {
									client.emit('updateAns', {type: 'error', msg: 'Error - it occured some problems, please try again later'});
								}
								else {
									client.emit('bookRemoved', data.book);
								}
							});
							sql2.end();
						} else {
							client.emit('sqlError');
						}
					}
					else {
						client.emit('updateAns', {type: 'error', msg: 'The password isn\'t correct'});
					}
				}
				else {
					client.emit('updateAns', {type: 'error', msg: 'The password isn\'t correct'});
				}
			});
			sql.end();
		} else {
			client.emit('sqlError');
		}
	}
	else {
		client.emit('updateAns', {type: 'error', msg: 'Critical error - values non useble charactures'});
	}
}

function searchTitle(title){
	var client = this;
	var id = -1;
	var sql = connect.getConnection();
	if(sql != null){
		sql.query("SELECT * FROM book WHERE title = '"+title+"' AND kapitel != '1'",
		function(err, rows, fields) {
			if(err) {
				client.emit('searchResultId', -1);
			}
			else if(rows.length > 0){
				client.emit('searchResultId', rows[0]);
			}
			else {
				client.emit('searchResultId', -1);
			}
		});
		sql.end();
	} else {
		client.emit('sqlError');
	}
}
function searchbook(val){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		sql.query("SELECT * FROM book WHERE (title LIKE '%"+val+"%' OR author LIKE '%"+val+"%' OR tags LIKE '%"+val+"%') AND kapitel != '1'",
		function(err, rows, fields) {
			if(err) console.log(err);
			else client.emit('searchResults', rows);
		});
		sql.end();
	}
	else {
		client.emit('sqlError');
	}
}
function searchbooks(letter){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		sql.query("SELECT * FROM `book` WHERE title REGEXP '^["+ letter +"].*$' AND kapitel != '1'",
		function(err, rows, fields) {
			if(err) console.log(err);
			else client.emit('letterResults', rows);
		});
		sql.end();
	} else {
		client.emit('sqlError');
	}
}

function validatebook(title){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		var command = "SELECT * FROM `book` WHERE title = '"+title+"' AND `kapitel` = '0'";
		sql.query(command, function(err, rows){
			if(err) {// no book were find.. upload the book!
				console.log(err);
				client.emit('uploadchapter', true);
			} else {
				if(rows.length == 0)
					client.emit('uploadchapter', true);
				else
					client.emit('uploadchapter', false);
			}
		});
		sql.end();
	} else {
		client.emit('sqlError');
	}
}
function uploadBook(data){
	var client = this;
	var sql = connect.getConnection();
	if(sql != null){
		var command = "INSERT INTO `book`("+
					"`title`, `pages_url`, `author`, `id`, `category`, `summery`, `tags`, `kapitel`, `chapter`, `creator`) VALUES ("+
					"'"+data.title+"','"+data.pages+"','"+data.author+"','null','"+data.category+"','"+data.summery+"',"+
					"'"+data.tags+"','"+data.kapitel+"','"+data.chapter+"','"+data.creator+"')";
		sql.query(command, function(err){
			if(err){
				client.emit('uploadAns', {error: err});
			}
			else {
				client.emit('uploadAns', {type: data.kapitel});
			}
		});	
		sql.end();
	} else {
		client.emit('sqlError');
	}
}

function updateChapter(chapter){
	var client = this;
	
	var sql = connect.getConnection();
	if(sql != null){
		var command = "UPDATE `book` SET `pages_url`='"+chapter.pages_url+"' WHERE `id` = " + chapter.id;
		sql.query(command, function(err){
			if(err){
				client.emit('updateAns', {type: 'error', msg: 'Failed to update chapter'});
			}
			else {
				client.emit('updateAns', {type: 'succes', msg: 'Chapter is now updated, you may want to reload'});
			}
		});
		sql.end();
	} else {
		client.emit('sqlError');
	}
}