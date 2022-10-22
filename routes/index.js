var express = require('express');
var router = express.Router();
const moment = require('moment');

module.exports = function (db) {
  // HOME
  router.get('/', function (req, res) {
    // console.log(req.url);
    const url = req.url == '/' ? '/?page=1' : req.url
    console.log(url);

    // SEARCHING
    let params = [];
    let counter = 1;
    let values = []

    if(req.query.id && req.query.idCheck == 'on'){
      values.push(req.query.id)
      params.push(`id = $${values.length}`)
    }

    if(req.query.string && req.query.stringCheck == 'on'){
      values.push(req.query.string)
      params.push(`string ilike '%' || $${values.length} || '%'`)
    }

    if(req.query.integer && req.query.integerCheck == 'on'){
      values.push(req.query.integer)
      params.push(`integer = $${values.length}`)
    }

    if(req.query.float && req.query.floatCheck == 'on'){
      values.push(req.query.float)
      params.push(`float = $${values.length}`)
    }

    if(req.query.fromdate && req.query.todate){
      params.push(`date BETWEEN $${values.length + 1} AND $${values.length + 2}`)
      values.push(req.query.fromdate)
      values.push(req.query.todate)
    } else if(req.query.fromdate){
      values.push(req.query.fromdate)
      params.push(`date >= $${values.length}`)
    } else if(req.query.todate){
      values.push(req.query.todate)
      params.push(`date <= $${values.length}`)
    }

    if(req.query.boolean && req.query.booleanCheck == 'on'){
      values.push(req.query.boolean)
      params.push(`boolean = $${values.length}`)
    }

    let page = req.query.page || 1;
    page = Number(page);
    const limit = 3;
    const offset = page * limit - limit;

    let sql = 'SELECT COUNT(*) as total FROM todos'
    if(params.length > 0){
      sql += ` WHERE ${params.join(' AND ')}`
    }

    db.query(sql, values,(err, data) => {
      if (err) return res.send(err);
      const total = data.rows[0].total;
      const pages = Math.ceil(total / limit);

      sql = 'SELECT * FROM todos'
    if(params.length > 0){
      sql += ` WHERE ${params.join(' AND ')}`
    }
    sql += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`

    console.log('sql', sql);

      db.query(sql, [...values, limit, offset], (err, data) => {
          if (err) return res.send(err);
          res.render('list', {
            todos: data.rows,
            moment,
            page,
            pages,
            offset,
            query: req.query,
            url
          });
        }
      );
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
      }
    );
  });

  return router;
};
