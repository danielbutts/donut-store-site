
exports.seed = function(knex, Promise) {
  return knex.raw(
    "TRUNCATE toppings RESTART IDENTITY;"
  )
  .then(() => {
    return knex('toppings').insert([
      {name: 'Old Fashioned', price: 0},
      {name: 'Chocolate Icing', price: .23},
      {name: 'Sprinkles', price: .32},
      {name: 'Maple Icing', price: .25},
      {name: 'Bacon', price: .99},
    ]);
  });
};
