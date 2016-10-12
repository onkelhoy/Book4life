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
                var command = 'select chapter.name, chapter.pages, chapter.ratio, chapter.id, chapter.creatorID, book.title, book.author, book.summery, chapter.bookid, book.front, book.end from chapter, book where chapter.bookid = book.id and chapter.id = ' + id;
                sql.query(command, function(err, rows){
                    if(err) res.redirect('/sqlError');
                    else if(rows.length == 0) res.status(404).send('Cant find chapter');
                    else {
                        res.render('book', {
                            type: 'chapter',
                            user: req.session.user,
                            row: rows[0],
                            title: rows[0].title + ' - ' + rows[0].name
                        });
                    }
                });
            }
            else res.redirect('/404');
        } else res.redirect('/authenticate/login');
    }).get('/bookid/:id', function(req, res){
        if(check(req)){
            var id = req.params.id;
            if(filter.num(id)) {
                var command = 'select chapter.name, chapter.id from chapter where chapter.bookid = ' + id;
                sql.query(command, function(err, rows){
                    if(err) res.status(404).send('Database error');
                    else res.status(200).json(rows);
                });
            }
            else res.status(404).send('Invalid id');
        } else res.status(500).send('You have no permision to do this');
    }).post('/', function(req, res){
        if(check(req)) {
            var chapter = req.body;
            //should be changed into its own tabel pointing to book..
            if(filter.text(chapter.name) && filter.num(chapter.bookid)){

                var command =  'insert into chapter (bookid, name, pages, creatorID)'+
                                'values("'+chapter.bookid+'", "'+chapter.name+'", "'+chapter.pages+'", '+ req.session.user.id+')';
                sql.query(command, function(err, row){
                    if(err) res.status(404).send('Database error');
                    else res.status(200).json(row);
                });
            } else res.status(404).send('chapter values are not valid');
        }
        else res.status(500).send('You have no permision to do this!');
    }).put('/images', function(req, res){
        if(check(req)){
            var data = req.body,
                command = 'update chapter set pages = "'+ data.links +'" where id = ' + data.id;
            if(filter.num(data.id)){
                if(req.session.user.admin == 0) command += ' and creatorID = ' + req.session.user.id;

                sql.query(command, function(err, rows){
                    if(err) res.status(404).send('Database error');
                    else if (rows.length == 0) res.status(404).send('You have no permision to do this!');
                    else {
                        res.status(200).json(rows);
                    }
                });
            } else res.status(404).send('id is invalid!');
        } else res.status(404).send('You have no permision to do this!');
    }).put('/ratio', function(req, res){
        if(check(req)){
            var data = req.body,
                command = 'update chapter set ratio = "'+ data.ratio +'" where id = ' + data.id;
            if(filter.num(data.id) && filter.num(data.ratio)){
                if(req.session.user.admin == 0) command += ' and creatorID = ' + req.session.user.id;

                if(data.ratio >= .05 && data.ratio <= 2.5){
                    sql.query(command, function(err, rows){
                        if(err) res.status(404).send('Database error');
                        else if (rows.length == 0) res.status(404).send('You have no permision to do this!');
                        else {
                            res.status(200).json(rows);
                        }
                    });
                } else res.status(404).send('ratio value is wrong');
            } else res.status(404).send('id is invalid!');
        } else res.status(404).send('You have no permision to do this!');
    }).delete('/:id', function(req, res){
        if(check(req)){
            var id = req.params.id,
                command = 'delete from chapter where id = ' + id;
            if(filter.num(id)){

                if(req.session.user.admin == 0) command += ' and creatorID = ' + req.session.user.id;

                sql.query(command, function(err, rows){
                    if(err) res.status(404).send('Database error');
                    else if (rows.length == 0) res.status(404).send('You have no permision to do this!');
                    else {
                        res.status(200).json(rows);
                    }
                });
            } else res.status(404).send('id is invalid!');
        } else res.status(404).send('You have no permision to do this!');
    });


    function check(req){
        return req.session.user !== undefined;
    }
    
    module.exports = routes;
}());