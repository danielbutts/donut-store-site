const express = require('express');
const knex = require('../db/connection');
const moment = require('moment');

var router = express.Router();

function getDonutOrDonuts(id) {
  let query = knex.select('donuts.name as donut_name', 'donuts.id as donut_id', 'donuts.image_url', 'bases.name as base_name', 'bases.price as base_price', 'bases.id as base_id', 'toppings.name as topping_name', 'toppings.price as topping_price', 'toppings.id as topping_id')
  .from('donuts')
  .innerJoin('bases','donuts.base_id','bases.id')
  .leftOuterJoin('donut_topping','donut_topping.donut_id','donuts.id')
  .leftOuterJoin('toppings', 'donut_topping.topping_id', 'toppings.id');
  if (id !== undefined) {
    query = query.where({ 'donuts.id': id });
  }
  // console.log(query.toSQL());
  return query;
}

function buildDescription(donut) {
  description = `${donut.base.name} donut`;
  console.log(donut.toppings);
  if (donut.toppings !== undefined && donut.toppings.length > 0) {
    description += ' topped with ';
    donut.toppings.forEach((topping, i) => {
      description += topping.name.toLowerCase();
      switch (true) {
        case (i < donut.toppings.length - 2):
          description += ', ';
        break;
        case (i < donut.toppings.length - 1):
          description += ' and ';
        break;
      }
    })
  }
  description += '.'
  return description;
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
      };
      if (result.topping_name !== null) {
        donuts[result.donut_id].toppings= [{ name: result.topping_name, price: result.topping_price, id: result.topping_id}]
      }
    } else {
      donuts[result.donut_id].toppings.push({ name: result.topping_name, price: result.topping_price, id: result.topping_id });
      donuts[result.donut_id].price = donuts[result.donut_id].price + result.topping_price;
    }
  });
  for (const d in donuts) {
    donuts[d].description = buildDescription(donuts[d]);
    donuts[d].price = Math.round(donuts[d].price * 100, 0)/100;
  }
  return donuts;
}

function getBases() {
  return knex('bases').select('*');
}

function getToppings() {
  return knex('toppings').select('*');
}

router.get('/', function(req, res, next) {
  getDonutOrDonuts()
  .then((results) => {
    const donuts = objectifyDonuts(results);
    res.render('donuts/donuts', { title: 'Donut Dynasty - All Donuts', donuts });
  })
});

router.delete('/:id', function(req, res, next) {
  // de-activate donut
  res.redirect('/donuts');
});

router.get('/new', function(req, res, next) {
  const id = req.params.id;
  Promise.all([
    getBases(),
    getToppings(),
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
    getBases(),
    getToppings(),
    getDonutOrDonuts(id)
  ])
  .then((results) => {
    const [bases, toppings] = results;
    const donuts = objectifyDonuts(results[2]);
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
    console.log('donut', donut);
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
