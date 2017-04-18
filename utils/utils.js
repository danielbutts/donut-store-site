const knex = require('../db/connection');

function getDonutOrDonuts(id) {
  let query = knex.select('donuts.name as donut_name', 'donuts.id as donut_id', 'donuts.image_url', 'donuts.created_at', 'bases.name as base_name', 'bases.price as base_price', 'bases.id as base_id', 'toppings.name as topping_name', 'toppings.price as topping_price', 'toppings.id as topping_id')
  .from('donuts')
  .innerJoin('bases','donuts.base_id','bases.id')
  .leftOuterJoin('donut_topping','donut_topping.donut_id','donuts.id')
  .leftOuterJoin('toppings', 'donut_topping.topping_id', 'toppings.id')
  if (id !== undefined) {
    query = query.where({ 'donuts.id': id, 'is_active': true });
  } else {
    query = query.where({ 'is_active': true });
  }
  return query;
}

function buildDescription(donut) {
  description = `${donut.base.name} donut`;
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

function compareCreatedAtDesc(a, b) {
  if (a.created_at < b.created_at) {
    return -1;
  } else {
    return 1;
  }
}

module.exports = {
  getDonutOrDonuts,
  buildDescription,
  objectifyDonuts,
  getBases,
  getToppings,
  compareCreatedAtDesc
}
