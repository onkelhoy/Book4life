(function(){
	"user strict";
    var express = require('express');

    var routes = express.Router();
    
    routes.use('/authenticate', require('./authentication/user'));
    routes.use('/book', require('./book/book'));
    routes.use('/chapter', require('./book/chapter'));

    routes.use('/', express.static('public'));
    routes.get('/', function(req, res){
        if(checkUser(req.session, res)){
            res.render('Home', {
                title: 'Book4life',
                classname: 'home',
                user: req.session.user
            });
        }
    }).get('/problem', function(req, res){
        if(checkUser(req.session, res)) {
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
                    user: req.session.user,
                    type: 'problem'
                });
            }
        }
    }).get('/upload', function(req, res){
        if(checkUser(req.session, res)){
            res.render('upload', {
                title: 'Upload a Book',
                user: req.session.user
            });
        }
    }).get('*', function(req, res){
        res.render('defualt', {
            title: 'book4life - 404',
            classname: 'bad',
            type: '404'
        });
    });
    

    //other help functions
    function checkUser(sess, res){ //checks if logged in or not
        if(!sess.user) res.redirect('/authenticate/login');
        else return true;
    }
    module.exports = routes;
}());