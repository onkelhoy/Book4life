(function(){
	"user strict";
    var express = require('express'), 
        filter  = require('../helpers/filter'),
        crypte  = require('../helpers/crypte'),
        sql     = require('../helpers/database/sql'),
        sendm   = require('../helpers/sendmail');

    var routes = express.Router();

    
    routes.use('/', express.static('public'));
    routes.post('/login', function(req, res){
        //login
        var info = req.body;
        if(filter.text(info.username) && filter.text(info.password)){
            var command = 'select * from users where name = "'+info.username+'"';
            sql.query(command, function(err, row){
                if(err) res.status(500).send('Database error');
                else if(row.length == 0 || !crypte.isSame(row[0].password, info.password))
                    res.status(404).send('Username or Password dont match');
                else {
                    if(row[0].emitted == 0) res.status(404).send('confirm email!');
                    else {
                        req.session.user = {
                            username: row[0].name,
                            email: row[0].mail,
                            admin: row[0].admin,
                            id: row[0].id
                        }
                        res.status(200).send('OK');
                    }
                }
            });
        }
        else res.status(404).send('invalid charatures');
    }).post('/register', function(req, res){
        var data = req.body;
        var link = getRandomLink(data.username);

        if(filter.text(data.username) && filter.mail(data.mail)){
            var command = 'insert into users (name, mail, password, emitted, emittlink, admin) values ("'+
                data.username+'", "'+data.mail+'", "'+crypte.enCrypte(data.password)+'", 0, "'+link+'", 0)';

            sql.query(command, function(err, row){
                if(err) res.status(404).send(err); // can also be db error
                else {
                    //send confirm link
                    var d = {
                        key: 1,
                        to: data.mail,
                        link: link,
                        k: 0
                    };
                    resend(d);
                    res.status(200).json(row);
                }
            });
        }
        else res.status(500).send('invalid charatures');
    }).get('/confirm/:link', function(req, res){
        var link = req.params.link;
        var command = 'select * from users where emittlink = "'+ link +'" and emitted = 0';
        sql.query(command, function(err, users){
            if(err || users.length == 0) res.redirect('/bad');
            else {
                command = 'update users set emitted = 1 where id = ' + users[0].id;
                sql.query(command, function(err, row){
                    if(err) res.redirect('/bad');
                    else {
                        res.redirect('/authenticate/login'); //login <- mayby only /login
                        var d = {
                            welcome: 1,
                            to: users[0].mail,
                            link: link,
                            k: 0
                        };
                        resend(d);
                    }
                });
            }
        });
    }).get('/logout', function(req, res){
        req.session.destroy(function(err){
            if(err) res.status(404).send('YOU CANNOT LOG OUT MOAHAHAHAHHA!');
            else res.redirect('/');
        });
    }).get('/login', function(req, res){
        res.render('User', {
            title: 'Login',
            classname: 'login'
        });
    }).get('/register', function(req, res){
        res.render('User', {
            title: 'Register',
            classname: 'register'
        });
    }).get('/password/:password', function(req, res){
        if(req.session.user){
            var command = 'select password from users where id = ' + req.session.user.id;
            sql.query(command, function(err, users){
                if(err) res.status(500).send('Database error');
                else if(users.length == 0) res.status(404).send('Database error');
                else {
                    if(crypte.isSame(users[0].password, req.params.password)) res.status(200).send('ok');
                    else res.status(404).send('wrong password');
                }
            });
        } else res.status(404).send('You have no permission');
    });

    

    // other functions
    function getRandomLink(usn){ // getting the confirm link
        var vals = 'abcdefghijklmnopqrstuvwxyz0123456789';

        var r = usn.slice(0, 1), l = 30;

        for(var i = 0; i < l; i++){
            r+= vals[Math.round(Math.random() * (vals.length-1))]; //this may fail if user list is large as fuck.. but that will not be the case :)
        }

        r+= usn.slice(usn.length-1, usn.length);
        return r;
    }
    function resend(data){
        sendm.send(data, function(err){
            if(err){
                if(data.k < 20){
                    data.k++;
                    setTimeout(function(){ resend(data); }, 60000*15); //wait 15 min if send failed
                }
            }
        });
    }
    module.exports = routes;
}());