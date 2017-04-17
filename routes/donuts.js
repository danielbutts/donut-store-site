var express = require('express');
const knex = require('../db/connection');

var router = express.Router();

function getDonutOrDonuts(id) {
  let query = knex.select('donuts.name as donut_name', 'donuts.id as donut_id', 'donuts.image_url', 'bases.name as base_name', 'bases.price as base_price', 'bases.id as base_id', 'toppings.name as topping_name', 'toppings.price as topping_price', 'toppings.id as topping_id')
  .from('donuts')
  .innerJoin('bases','donuts.base_id','bases.id')
  .innerJoin('donut_topping','donut_topping.donut_id','donuts.id')
  .innerJoin('toppings', 'donut_topping.topping_id', 'toppings.id');
  if (id !== undefined) {
    query = query.where({ donut_id: id });
  }
  return query;
}

function objectifyDonuts(results) {
  const donuts = {};
  // console.log(results);
  results.forEach((result) => {
    if (donuts[result.donut_id] === undefined) {
      donuts[result.donut_id] = {
        name: result.donut_name,
        id: result.donut_id,
        base: { name: result.base_name, price: result.base_price, id: result.base_id},
        price: result.base_price + result.topping_price,
        url: result.image_url,
        toppings: [{ name: result.topping_name, price: result.topping_price, id: result.topping_id}]
      };
    } else {
      donuts[result.donut_id].toppings.push({ name: result.topping_name, price: result.topping_price, id: result.topping_id });
      donuts[result.donut_id].price = donuts[result.donut_id].price + result.topping_price;
    }
  });
  return donuts;
}

router.get('/', function(req, res, next) {
  getDonutOrDonuts()
  .then((results) => {
    const donuts = objectifyDonuts(results);
    res.render('donuts/donuts', { donuts });
  })
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

function getBases() {
  return knex('bases').select('*');
}

function getToppings() {
  return knex('toppings').select('*');
}

router.get('/:id/edit', function(req, res, next) {
  const id = req.params.id;
  Promise.all([
    getBases(),
    getToppings(),
    getDonutOrDonuts(id)
  ])
  .then((results) => {
    const [bases, toppings] = results;
    const donuts = objectifyDonuts(results[2]);
    const donut = donuts[id];
    bases.forEach((base) => {
      if (base.id === donut.base.id) {
        base.selected = true;
      }
    })
    toppings.forEach((topping) => {
      let matches = donut.toppings.filter((top) => {
        return topping.id === top.id;
      })
      if (matches.length > 0) {
        topping.checked = true;
      }
    })
    console.log(toppings);
    res.render(`donuts/edit-donut`, {
      title: 'Donut Dynasty - Edit Donut',
      donut,
      bases,
      toppings
    });
  })
  .catch((err) => {
    next(err);
  })
});

router.put('/', function(req, res, next) {
  const id = req.params.id;
  const name = req.body.name;

  res.redirect('/donuts');
});

module.exports = router;
