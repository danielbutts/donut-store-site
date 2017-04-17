
exports.seed = function(knex, Promise) {
  return knex.raw(
    "TRUNCATE donuts RESTART IDENTITY;"
  )
  .then(() => {
    return knex('donuts').insert([
      {name: 'Chocolate Monster', base_id: 1, image_url: '/images/donut_7.png'},
    ]);
  });
};
