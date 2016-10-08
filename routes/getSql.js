var mysql = require('mysql'),
	i = require('./content/database').info;

exports.getConnection = function(){
	var connection = mysql.createConnection({
		host     : i.host,
		user     : i.user,
		password : i.password,
		database : i.database
	});
	 
	connection.connect(function(err){
		if(err){
			console.log('error with sql '+err.stack);
			return null;
		}
	});
	return connection;
}
