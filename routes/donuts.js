var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const donuts = {};
  res.render('donuts', donuts);
});

router.delete('/:id', function(req, res, next) {
  // de-activate donut
  res.redirect('/donuts');
});

router.post('/', function(req, res, next) {
  // create a new donut
  const id = 1;
  res.redirect('/donuts/1');
});

router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  const donut = {};
  res.render('donut', donut);
});

router.get('/new', function(req, res, next) {
  res.send('new donut form');
});

router.get('/edit/:id', function(req, res, next) {
  const id = req.params.id;
  const donut = {};
  res.render('edit', donut);
});

router.put('/:id', function(req, res, next) {
  const id = req.params.id;
  const donut = {};
  res.render('donut', donut);
});

module.exports = router;
