const express = require('express');
const knex = require('../db/connection');
const utils = require('../utils/utils.js');
const moment = require('moment');

const router = express.Router();

router.get('/', (req, res, next) => {
  knex('orders').select('*')
  .then((orders) => {
    if (orders.length > 0) {
      orders.forEach((o) => {
        const order = o;
        order.created_at = moment(order.created_at).format('MMMM Do YYYY @ h:mm:ss a');
      });
      res.render('orders/orders', { orders });
    } else {
      res.render('orders/orders', { message: 'No orders found.' });
    }
  })
  .catch((err) => {
    next(err);
  });
});

router.post('/', (req, res, next) => {
  const { name, email } = req.body;
  let { orders } = req.body;
  knex('orders').insert({ name, email }).returning(['id'])
  .then((orderIds) => {
    const orderId = orderIds[0].id;
    const queries = [];
    orders = JSON.parse(orders);
    Object.keys(orders).forEach((o) => {
      const quantity = orders[o].qty;
      const query = knex('donut_order').insert({ order_id: orderId, donut_id: o, quantity });
      queries.push(query);
    });
    // return Promise.all(queries)
    return Promise.all(queries)
    .then(() => {
      res.json({ messsage: 'Order successful', id: orderId });
    });
  })
  .catch((err) => {
    // console.error(err);
    next(err);
  });
});

router.get('/new', (req, res, next) => {
  utils.getDonutOrDonuts().then((results) => {
    const donuts = utils.objectifyDonuts(results);
    const donutsArray = [];
    Object.keys(donuts).forEach((d) => {
      donutsArray.push(donuts[d]);
    });
    donutsArray.sort(utils.compareCreatedAtDesc);
    // console.log(donutsArray);
    res.render('orders/new-order', { title: 'Donut Dynasty - New Order', donutsArray });
  })
  .catch((err) => {
    next(err);
  });
});

function roundTwoDec(num) {
  return Math.round(num * 100) / 100;
}

router.get('/:id', (req, res, next) => {
  const orderId = req.params.id;
  const query = knex.select('orders.name as order_name', 'orders.email', 'donuts.name as donut_name',
  'donuts.id as donut_id', 'donut_order.quantity', 'bases.price as base_price')
  .sum('toppings.price as topping_price')
  .from('orders')
  .innerJoin('donut_order', 'donut_order.order_id', 'orders.id')
  .innerJoin('donuts', 'donut_order.donut_id', 'donuts.id')
  .innerJoin('bases', 'donuts.base_id', 'bases.id')
  .innerJoin('donut_topping', 'donut_topping.donut_id', 'donuts.id')
  .innerJoin('toppings', 'donut_topping.topping_id', 'toppings.id')
  .groupBy('orders.name', 'orders.email', 'donuts.name', 'donuts.id', 'donut_order.quantity', 'bases.price')
  .where({ 'orders.id': orderId });

  query.then((donuts) => {
    const customer = { name: donuts[0].order_name, email: donuts[0].email };
    const donutArr = [];
    let total = 0;
    Object.keys(donuts).forEach((d) => {
      const price = roundTwoDec(parseFloat(donuts[d].base_price) +
      parseFloat(donuts[d].topping_price));
      const quantity = donuts[d].quantity;
      const subtotal = roundTwoDec(price * quantity);
      donutArr.push({
        name: donuts[d].donut_name,
        price,
        quantity,
        subtotal,
      });
      total += subtotal;
    });
    res.render('orders/order', { customer, donuts: donutArr, total: roundTwoDec(total) });
  })
  .catch((err) => {
    // console.log(err);
    next(err);
  });
});

module.exports = router;
