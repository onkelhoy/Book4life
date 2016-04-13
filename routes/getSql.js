var mysql = require('mysql');

exports.getConnection = function(){
	var connection = mysql.createConnection({
		host     : 'sql7.freesqldatabase.com',
		user     : 'sql7115025',
		password : 'ldkdGPrtNy',
		database : 'sql7115025'
	});
	 
	connection.connect(function(err){
		if(err){
			console.log('error with sql '+err.stack);
			return null;
		}
	});
	return connection;
}
