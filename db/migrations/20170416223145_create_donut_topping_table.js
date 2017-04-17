
exports.up = function(knex, Promise) {
  return knex.schema.createTable('donut_topping', (table) => {
    table.increments();
    table.integer('donut_id').notNullable();
    table.integer('topping_id').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('donut_topping');
};
