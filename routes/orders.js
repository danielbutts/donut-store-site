var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const orders = {};
  res.render('orders', orders);
});

router.delete('/:id', function(req, res, next) {
  // de-activate an order
  res.redirect('/orders');
});

router.post('/', function(req, res, next) {
  // create a new order
  res.redirect('/orders');
});

router.get('/new', function(req, res, next) {
  res.render('/orders/new');
});

router.get('/edit/:id', function(req, res, next) {
  const id = req.params.id;
  const donut = {};
  res.render(`/orders/${id}/edit`, donut);
});

router.put('/:id', function(req, res, next) {
  res.redirect('/orders');
});

module.exports = router;
