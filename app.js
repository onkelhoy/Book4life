// MODULES
var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	session = require('express-session'),
	util = require('util');

// CUSTOM MODULES
var ioHandler = require('./routes/ioHandle'),
	routes = require('./routes/index');

// MODULE STARTS
ioHandler.start(io);//could be done better

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
// app.use('/', routes);

	app.get('/', routes.index);
	app.get('/login', routes.login);
	app.get('/register', routes.signup);
	app.get('/logout', routes.logout);
	app.get('/book', routes.book);
	app.get('/tutorial', routes.tutorial);
	app.get('/upload', routes.upload);
	app.get('/problem', routes.problem);
	app.get('/sqlError', routes.sqlError);
	app.get('/confirm/:u/:c', routes.confirm);
	app.get('*', routes.bad);

	app.post('/login', routes._login);
	app.post('/register', routes._register);
	app.post('/confirmCreator', routes._confirmCreator);

var port = Number(process.env.PORT || 3000);


http.listen(port, function(){
	console.log("Running on *"+port);
});