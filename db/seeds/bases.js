
exports.seed = function(knex, Promise) {
  return knex('bases').del()
    .then(function () {
      return knex('bases').insert([
        {name: 'Cake Base', price: 1.93},
        {name: 'Yeast-Raised Base', price: 1.87},
        {name: 'Gluten Free', price: 2.43},
      ]);
    });
};
