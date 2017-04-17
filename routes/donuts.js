var express = require('express');
const knex = require('../db/connection');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  knex.select('donuts.name as donut_name', 'donuts.id', 'bases.name as base_name', 'bases.price as base_price', 'toppings.name as topping_name', 'toppings.price as topping_price')
  .from('donuts')
  .innerJoin('bases','donuts.base_id','bases.id')
  .innerJoin('donut_topping','donut_topping.donut_id','donuts.id')
  .innerJoin('toppings', 'donut_topping.topping_id', 'toppings.id')
  .then((results) => {

    const donuts = {};
    results.forEach((result) => {
      if (donuts[result.id] === undefined) {
        donuts[result.id] = {
          name: result.donut_name,
          id: result.id,
          base: result.base_name,
          price: result.base_price + result.topping_price,
          toppings: [{ name: result.topping_name, price: result.topping_price}]
        };
      } else {
        donuts[result.id].toppings.push({ name: result.topping_name, price: result.topping_price });
        donuts[result.id].price = donuts[result.id].price + result.topping_price;
      }
    });
    res.render('donuts/donuts', { donuts });
  })
  const donuts = {};

});

function getToppingsForDonut(id) {
  return knex('toppings').select('name','price').where({ donut_id: id});
}

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
