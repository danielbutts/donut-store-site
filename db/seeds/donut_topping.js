
exports.seed = function(knex, Promise) {
  return knex.raw(
    "TRUNCATE donut_topping RESTART IDENTITY;"
  )
  .then(() => {
    return knex('donut_topping').insert([
      {donut_id: 1,topping_id:2},
      {donut_id: 1,topping_id:3},
      {donut_id: 1,topping_id:1},
    ]);
  });
};
