(function(){
	"user strict";
    var express = require('express');
    var filter = require('./filter');
    var sql = require('./sql');

    var routes = express.Router();

    
    routes.use('/', express.static('public'));

    routes.get('/', function(req, res){
        if(check(req)){
            var id = req.query.id;
            if(filter.num(id)) {
                var command = 'select * from book where id = ' + id;
                sql.query(command, function(err, books){
                    if(err) res.redirect('/sqlError');
                    else {
                        if(books.length > 0){
                            if(books[0].kapitel == 0){
                                command = 'select * from book where title = "'+books[0].title+'" and kapitel = 1';
                                sql.query(command, function(err, chapters){
                                    if(err) res.status(404).send('database error cant get chapters');
                                    else {
                                        res.render('book', {
                                            chapters: chapters,
                                            admin: (req.session.admin ? req.session.admin : false),
                                            book: books[0],
                                            title: books[0].title,
                                            username: req.session.username
                                        });
                                    }
                                });
                            } else {
                                res.render('book', {
                                    book: books[0],
                                    admin: (req.session.admin ? req.session.admin : false),
                                    title: books[0].title,
                                    username: req.session.username
                                });
                            }
                        } else res.redirect('/bad');
                    }
                });
            }
            else res.redirect('/404');
        } else res.redirect('/login');
    }).get('/title', function(req, res){
        if(check(req)){
            var command = 'select * from book where title = "' + req.query.title + '" and kapitel = 0';
            sql.query(command, function(err, book){
                if(err) res.status(404).send('Database error');
                else res.status(200).send(book);
            });
        }
        else {console.log('noooo'); res.redirect('/');}
    }).get('/search/:query', function(req, res){
        if(!check(req)) res.status(404).send('No permision! '+req.session.username);
        else {
            var q = req.params.query;
            var command = "select * from book where (title like '%"+q+"%' or author like '%"+q+"%' or tags like '%"+q+"%') and kapitel != 1";
            sql.query(command, function(err, result){
                if(err) res.status(404).send('Database error');
                else res.status(200).send(result);
            });
        }
    }).get('/letter/:letter', function(req, res){ //search by letter
        if(check(req)){
            var letter = req.params.letter;
            if(filter.text(letter)) {
                var command = 'select * from book where title regexp "^['+ letter +'].*$" and kapitel != 1';
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
        if(sess.username == book.creator || sess.admin) {
            if(filter.num(book.id) && filter.text(link)) {
                

                var command = 'update book set '+type + ' = "'+link+'" where id = ' + book.id;
                

                sql.query(command, function(err, rows){
                    if(err) res.status(404).send('database error');
                    else res.status(200).send(link);
                });
            } else res.status(404).send('Invalid charactures');
        } else res.status(500).send('You have not permision for this');

    }).post('/book', function(req, res){
        if(check(req)) {
            var book = req.body;

            if(filter.text(book.author) && filter.text(book.title) 
                && filter.text(book.tags) && filter.text(book.summery)){

                var command = 'insert into book (title, author, summery, tags, kapitel, creator) VALUES ("'+book.title+'", "'+book.author+'", "'+book.summery+'", "'+book.tags+'", 0, "'+req.session.username+'")';
                sql.query(command, function(err, row){
                    if(err) res.status(404).send('Database error');
                    else res.status(200).json(row);
                });
            } else res.status(404).send('book values are not valid');
        }
        else res.status(500).send('You have no permision to do this!');
    }).post('/chapter', function(req, res){
        if(check(req)) {
            var chapter = req.body;
            //should be changed into its own tabel pointing to book..
            if(filter.text(chapter.title)){

                var command = 'insert into book (title, pages_url, kapitel, creator) VALUES ("'+chapter.title+'", "'+chapter.pages+'", 1, "'+req.session.username+'")';
                sql.query(command, function(err, row){
                    if(err) res.status(404).send('Database error');
                    else res.status(200).json(row);
                });
            } else res.status(404).send('chapter values are not valid');
        }
        else res.status(500).send('You have no permision to do this!');
    });


    function check(req){
        return req.session.username !== undefined;
    }
    
    module.exports = routes;
}());