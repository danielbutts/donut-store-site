
exports.seed = function(knex, Promise) {
  return knex.raw(
    "TRUNCATE orders RESTART IDENTITY;"
  )
  .then(() => {
    return knex('orders').insert([
      {name: 'Daniel Butts', email: 'daniel.butts@gmail.com'},
    ]);
  });
};
