const express = require('express');
const knex = require('../db/connection');
const moment = require('moment');
const utils = require('../utils/utils.js');

const router = express.Router();

router.get('/', (req, res, next) => {
  const success = req.flash().success;
  const message = req.query.message;
  utils.getDonutOrDonuts()
  .then((results) => {
    const donuts = utils.objectifyDonuts(results);
    const donutsArray = [];
    Object.keys(donuts).forEach((d) => {
      donutsArray.push(donuts[d]);
    });
    donutsArray.sort(utils.compareCreatedAtDesc);
    res.render('donuts/donuts', { title: 'Donut Dynasty - All Donuts', donutsArray, message, success });
  })
  .catch((err) => {
    next(err);
  });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  knex('donuts').update({ is_active: false, updated_at: moment() }).where({ id }).returning('*')
  .then((result) => {
    const donut = result[0];
    res.json({ donut, message: `${donut.name} successfully deleted.` });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/new', (req, res, next) => {
  Promise.all([
    utils.getBases(),
    utils.getToppings(),
  ])
  .then((results) => {
    const [bases, toppings] = results;
    res.render('donuts/new-donut', {
      title: 'Donut Dynasty - Customize',
      bases,
      toppings,
    });
  })
  .catch((err) => {
    next(err);
  });
});

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id;
  Promise.all([
    utils.getBases(),
    utils.getToppings(),
    utils.getDonutOrDonuts(id),
  ])
  .then((results) => {
    const [bases, toppings] = results;
    const donuts = utils.objectifyDonuts(results[2]);
    const donut = donuts[id];
    // console.log(results);
    bases.forEach((base) => {
      const donutBase = base;
      if (donutBase.id === donut.base.id) {
        donutBase.selected = true;
      }
    });
    if (donut.toppings !== undefined) {
      toppings.forEach((topping) => {
        const donutTopping = topping;
        const matches = donut.toppings.filter(top => donutTopping.id === top.id);
        if (matches.length > 0) {
          donutTopping.checked = true;
        }
      });
    }
    // console.log(toppings);
    res.render('donuts/edit-donut', {
      title: 'Donut Dynasty - Edit Donut',
      donut,
      bases,
      toppings,
      isEdit: true,
    });
  })
  .catch((err) => {
    next(err);
  });
});

router.post('/', (req, res, next) => {
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
          toppingPairs.push({ donut_id: donut.id, topping_id: parseInt(topping, 10) });
        });
      } else {
        toppingPairs.push({ donut_id: donut.id, topping_id: parseInt(toppings, 10) });
      }
      return knex('donut_topping').insert(toppingPairs);
    }
    return null;
  })
  .then(() => {
    req.flash('success', `${name} successfully created.`);
    res.redirect('/donuts');
  })
  .catch((err) => {
    next(err);
  });
});

router.put('/', (req, res, next) => {
  const id = parseInt(req.body.id, 10);
  const name = req.body.name;
  const url = req.body.url;
  const base = req.body.base;
  const toppings = req.body.toppings;
  const toppingPairs = [];
  const queries = [];

  queries.push(knex('donuts').update({ name, image_url: url, base_id: base, updated_at: moment() }).where({ id }));
  queries.push(knex('donut_topping').delete().where({ donut_id: id }));
  if (toppings !== undefined) {
    if (Array.isArray(toppings)) {
      toppings.forEach((topping) => {
        toppingPairs.push({ donut_id: id, topping_id: parseInt(topping, 10) });
      });
    } else {
      toppingPairs.push({ donut_id: id, topping_id: parseInt(toppings, 10) });
    }
    queries.push(knex('donut_topping').insert(toppingPairs));
  }

  Promise.all(queries)
  .then(() => {
    res.redirect('/donuts');
  })
  .catch((err) => {
    next(err);
  });
});

module.exports = router;
