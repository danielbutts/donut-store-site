
exports.up = function(knex, Promise) {
  return knex.schema.createTable('toppings', (table) => {
    table.increments();
    table.string('name').notNullable();
    table.float('price').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('toppings');
};
