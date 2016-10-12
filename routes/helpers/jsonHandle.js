var fs = require('fs'),
	jsonfile = require('jsonfile');

exports.getJson = function(file_){
	var filepath = __dirname + "/content/" + file_
    var file = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(file);
}
exports.setJson = function(file, json){
	var filepath = __dirname + "/content/" + file
	jsonfile.writeFileSync(filepath, json);
}