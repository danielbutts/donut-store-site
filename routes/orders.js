var express = require('express');
const knex = require('../db/connection');
const utils = require('../utils/utils.js');

var router = express.Router();

router.get('/', function(req, res, next) {
  knex('orders').select('*')
  .then((orders) => {
    res.render('orders/orders', orders);
  })

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
  utils.getDonutOrDonuts().then((results) => {
    const donuts = utils.objectifyDonuts(results);
    const donutsArray = [];
    for (const d in donuts) {
      donutsArray.push(donuts[d]);
    }
    donutsArray.sort(utils.compareCreatedAtDesc);
    console.log(donutsArray);
    res.render('orders/new-order', { title: 'Donut Dynasty - New Order', donutsArray });
  })
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
