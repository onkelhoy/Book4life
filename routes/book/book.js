(function(){
	"user strict";
    var express = require('express');
    var filter = require('../helpers/filter');
    var sql = require('../helpers/database/sql');

    var routes = express.Router();

    routes.use('/', express.static('public'));

    routes.get('/:id', function(req, res){
        if(check(req)){
            var id = req.params.id;
            if(filter.num(id)) {
                var command = 'select * from book where book.id = ' + id;
                sql.query(command, function(err, rows){
                    if(err) res.redirect('/sqlError');
                    else if(rows.length == 0) res.status(404).send('Cant find any book with id: ' + id);
                    else {
                        res.render('book', {
                            type: 'book',
                            row: rows[0],
                            user: req.session.user,
                            title: rows[0].title
                        });
                    }
                });
            }
            else res.redirect('/404');
        } else res.redirect('/authenticate/login');
    }).get('/title/:title', function(req, res){
        if(check(req)){
            if(filter.text(req.params.title)){
                var command = 'select * from book where title = "' + req.params.title + '"';
                sql.query(command, function(err, book){
                    if(err) res.status(404).send('Database error');
                    else res.status(200).send(book);
                });
            } else res.status(404).send('Title is invalid!');
        }
        else res.redirect('/');
    }).get('/search/:query', function(req, res){
        if(!check(req)) res.status(404).send('No permision! '+req.session.username);
        else {
            var q = req.params.query;
            var command = "select * from book where (title like '%"+q+"%' or author like '%"+q+"%' or tags like '%"+q+"%')";
            sql.query(command, function(err, result){
                if(err) res.status(404).send('Database error');
                else res.status(200).send(result);
            });
        }
    }).get('/letter/:letter', function(req, res){ //search by letter
        if(check(req)){
            var letter = req.params.letter;
            if(filter.text(letter)) {
                var command = 'select * from book where title regexp "^['+ letter +'].*$"';
                sql.query(command, function(err, rows){
                    if(err) res.status(404).send('Database error');
                    else res.status(200).json(rows);
                })
            } else res.status(404).send('Invalid letter');
        } else res.status(500).send('You must login first');
    }).put('/fe', function(req, res){ //front - end
        var type = req.body.type,
            book = req.body.book,
            link = req.body.link,
            sess = req.session;
        if(sess.user.username == book.creator || sess.user.admin) {
            if(filter.num(book.id) && filter.text(link)) {
                var command = 'update book set '+type + ' = "'+link+'" where id = ' + book.id;
                
                sql.query(command, function(err, rows){
                    if(err) res.status(404).send('database error');
                    else res.status(200).send(link);
                });
            } else res.status(404).send('Invalid charactures');
        } else res.status(500).send('You have not permision for this');

    }).post('/', function(req, res){
        if(check(req)) {
            var book = req.body;

            if(filter.text(book.author) && filter.text(book.title) 
                && filter.text(book.tags) && filter.text(book.summery)){

                var command = 'insert into book (title, author, summery, tags, creator) VALUES ("'+book.title+'", "'+book.author+'", "'+book.summery+'", "'+book.tags+'", '+req.session.user.id+')';
                sql.query(command, function(err, row){
                    if(err) res.status(404).send('Database error');
                    else res.status(200).json(row);
                });
            } else res.status(404).send('book values are not valid');
        }
        else res.status(500).send('You have no permision to do this!');
    }).delete('/:id', function(req, res){
        if(check(req)){
            var id = req.params.id;
            if(filter.num(id)){
                var command = 'delete from book where id = ' + id;
                if(req.session.user.admin != 1) {
                    command += ' and creatorID = ' + req.session.user.id; // only the creator or admin can delete books!
                }

                sql.query(command, function(err, rows){
                    if(err) res.status(404).send('Database error');
                    else if(rows.length == 0) res.status(404).send('Cant find book with id:'+id);
                    else {
                        res.status(200).json(rows);
                    }
                });
            }
        } else res.status(404).send('You have no permision');
    });


    function check(req){
        return req.session.user !== undefined;
    }
    
    module.exports = routes;
}());