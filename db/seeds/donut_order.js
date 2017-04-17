
exports.seed = function(knex, Promise) {
  return knex.raw(
    "TRUNCATE donut_order RESTART IDENTITY;"
  )
  .then(() => {
    return knex('donut_order').insert([
      {donut_id: 1,order_id:1,quantity:3},
    ]);
  });
};
