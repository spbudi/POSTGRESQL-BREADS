var express = require('express');
var router = express.Router();
const moment = require('moment');

module.exports = function (db) {

// HOME
  router.get('/', function (req, res) {
    let page = req.query.page || 1;
    page = Number(page)
    const limit = 3;
    const offset = page * limit - limit ; 

    db.query('SELECT COUNT(*) as total FROM todos', (err, data) => {
      if (err) return res.send(err);
      const total = data.rows[0].total;
      const pages = Math.ceil(total / limit);

      db.query('SELECT * FROM todos LIMIT $1 OFFSET $2',[limit, offset],(err, data) => {
          if (err) return res.send(err);
          res.render('list', {
            todos: data.rows,
            moment,
            page,
            pages,
            offset
          })
        }); 
    });
  });

// ADD
  router.get('/add', function (req, res) {
    res.render('add', {});
  });

  router.post('/add', function (req, res) {
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

// EDIT
  router.get('/edit/:id', function (req, res) {
    db.query(
      'SELECT * FROM todos WHERE id = $1',
      [Number(req.params.id)],
      (err, data) => {
        if (err) return res.send(err);
        if (data.rows.length == 0) res.send('data not found');
        res.render('edit', { item: data.rows[0], moment });
      }
    );
  });

  router.post('/edit/:id', function (req, res) {
    const { string, integer, float, date, boolean } = req.body;
    db.query(
      'UPDATE todos SET string = $1 , integer = $2, float = $3, date = $4, boolean = $5 WHERE id = $6',
      [string, integer, float, date, boolean, Number(req.params.id)],
      (err) => {
        if (err) return res.send(err);
        res.redirect('/');
      }
    );
  });

// DELETE
  router.get('/delete/:id', function (req, res) {
    db.query(
      'DELETE FROM todos WHERE id = $1',
      [Number(req.params.id)],
      (err, data) => {
        if (err) return res.send(err);
        res.redirect('/');
      });
  });

  return router;
};
