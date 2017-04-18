
exports.seed = function(knex, Promise) {
  return knex.raw(
    "TRUNCATE bases RESTART IDENTITY;"
  )
  .then(() => {
    return knex('bases').insert([
      {name: 'Cake based', price: 1.84},
      {name: 'Yeast-raised', price: 1.87},
      {name: 'Gluten free', price: 2.43},
    ]);
  });
};
