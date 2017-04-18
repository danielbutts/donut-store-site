const express = require('express');
const knex = require('../db/connection');
const moment = require('moment');
const utils = require('../utils/utils.js');

var router = express.Router();

router.get('/', function(req, res, next) {
  const success = req.flash().success;
  const message = req.query.message;
  utils.getDonutOrDonuts()
  .then((results) => {
    const donuts = utils.objectifyDonuts(results);
    const donutsArray = [];
    for (const d in donuts) {
      donutsArray.push(donuts[d]);
    }
    donutsArray.sort(utils.compareCreatedAtDesc);
    res.render('donuts/donuts', { title: 'Donut Dynasty - All Donuts', donutsArray, message, success });
  })
  .catch((err) => {
    next(err);
  })
});

router.delete('/:id', function(req, res, next) {
  const id = req.params.id;
  knex('donuts').update({ is_active: false, updated_at: moment() }).where({ id }).returning('*')
  .then((result) => {
    const donut = result[0];
    res.json({ donut, message: `${donut.name} successfully deleted.` });
  })
  .catch((err) => {
    next(err);
  })
});

router.get('/new', function(req, res, next) {
  const id = req.params.id;
  Promise.all([
    utils.getBases(),
    utils.getToppings(),
  ])
  .then((results) => {
    const [bases, toppings] = results;
    res.render(`donuts/new-donut`, {
      title: 'Donut Dynasty - Customize',
      bases,
      toppings
    });
  })
  .catch((err) => {
    next(err);
  })
});

router.get('/:id/edit', function(req, res, next) {
  const id = req.params.id;
  Promise.all([
    utils.getBases(),
    utils.getToppings(),
    utils.getDonutOrDonuts(id)
  ])
  .then((results) => {
    const [bases, toppings] = results;
    const donuts = utils.objectifyDonuts(results[2]);
    const donut = donuts[id];
    // console.log(results);
    bases.forEach((base) => {
      if (base.id === donut.base.id) {
        base.selected = true;
      }
    })
    if (donut.toppings !== undefined) {
      toppings.forEach((topping) => {
        let matches = donut.toppings.filter((top) => {
          return topping.id === top.id;
        })
        if (matches.length > 0) {
          topping.checked = true;
        }
      })
    }
    // console.log(toppings);
    res.render(`donuts/edit-donut`, {
      title: 'Donut Dynasty - Edit Donut',
      donut,
      bases,
      toppings,
      isEdit: true
    });
  })
  .catch((err) => {
    next(err);
  })
});

router.post('/', function(req, res, next) {
  const name = req.body.name;
  const url = req.body.url;
  const base = req.body.base;
  const toppings = req.body.toppings;
  const toppingPairs = [];

  knex('donuts').insert({ name, image_url: url, base_id: base }).returning('*')
  .then((result) => {
    const donut = result[0];
    if (toppings !== undefined) {
      if (Array.isArray(toppings)) {
        toppings.forEach((topping) => {
          toppingPairs.push({ donut_id: donut.id, topping_id: parseInt(topping) });
        });
      } else {
        toppingPairs.push({ donut_id: donut.id, topping_id: parseInt(toppings) })
      }
      return knex('donut_topping').insert(toppingPairs);
    }
  })
  .then(() => {
    req.flash('success', `${name} successfully created.`);
    res.redirect('/donuts');
  })
  .catch((err) => {
    next(err);
  })
});

router.put('/', function(req, res, next) {
  const id = parseInt(req.body.id);
  const name = req.body.name;
  const url = req.body.url;
  const base = req.body.base;
  const toppings = req.body.toppings;
  const toppingPairs = [];
  const queries = [];

  queries.push(knex('donuts').update({ name, image_url: url, base_id: base, updated_at: moment() }).where({ id }));
  queries.push(knex('donut_topping').delete().where({ donut_id: id}));
  if (toppings !== undefined) {
    if (Array.isArray(toppings)) {
      toppings.forEach((topping) => {
        toppingPairs.push({ donut_id: id, topping_id: parseInt(topping) });
      });
    } else {
      toppingPairs.push({ donut_id: id, topping_id: parseInt(toppings) })
    }
    queries.push(knex('donut_topping').insert(toppingPairs));
  }

  Promise.all(queries)
  .then(() => {
    res.redirect('/donuts');
  })
  .catch((err) => {
    next(err);
  })
});

module.exports = router;
