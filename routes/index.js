var express = require('express');
var router = express.Router();
const moment = require('moment');

/* GET home page. */
module.exports = function (db) {
  router.get('/', function (req, res, next) {
    db.query('SELECT * FROM todos', (err, data) => {
      if (err) return res.send(err);
      res.render('list', { todos: data.rows, moment });
    });
  });

  router.get('/add', function (req, res, next) {
    res.render('add', {});
  });

  router.post('/add', function (req, res, next) {
    const { string, integer, float, date, boolean } = req.body;
    db.query(
      'INSERT INTO todos(string, integer, float, date, boolean) values($1, $2, $3, $4, $5)',
      [string, integer, float, date, boolean],
      (err) => {
        if (err) return res.send(err);
        res.redirect('/');
      }
    );
  });

  router.get('/edit/:id', function (req, res, next) {
    db.query('SELECT * FROM todos WHERE id = $1', [Number(req.params.id)],(err, data) => {
      if (err) return res.send(err);
      if(data.rows.length == 0) res.send('data not found')
      res.render('edit', {item: data.rows[0], moment});
    });
  });

  router.post('/edit/:id', function (req, res, next) {
    const { string, integer, float, date, boolean } = req.body;
    db.query('UPDATE todos SET string = $1 , integer = $2, float = $3, date = $4, boolean = $5 WHERE id = $6', [string, integer, float, date, boolean, Number(req.params.id)],
      (err) => {
        if (err) return res.send(err);
        res.redirect('/');
      }
    );
  });

  router.get('/delete/:id', function (req, res, next) {
    db.query('DELETE FROM todos WHERE id = $1', [Number(req.params.id)],(err, data) => {
      if (err) return res.send(err);
      res.redirect('/')
    });
  });

  return router;
};
