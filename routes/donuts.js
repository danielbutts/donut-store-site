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
  res.redirect('/donuts');
});

router.get('/new', function(req, res, next) {
  res.render('/donuts/new');
});

router.get('/edit/:id', function(req, res, next) {
  const id = req.params.id;
  const donut = {};
  res.render(`/donuts/${id}/edit`, donut);
});

router.put('/:id', function(req, res, next) {
  res.redirect('/donuts');
});

module.exports = router;
