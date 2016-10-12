var conn = require('./getSql');

// export functions
exports.query = function(command, callback) {
	query(command, callback);
}

// functions
function query(command, callback) {
	var sql = conn.getConnection();
	if(sql.error) {
		callback(sql.error, null);
	}
	else {
		sql.query(command, function(err, rows){
			if(err) callback(err, null);
			else callback(null, rows);
		});
		sql.end();
	}
}

function getCategories(callback){
	var command = "SELECT * FROM `category`"; //"SELECT `name` FROM `category` WHERE `parent` IS NULL";
	query(command, function(err, rows){
	    if(err && callback !== undefined) callback(err, null);
	    else {
	    	callback(null, rows);
	    }
    });
}