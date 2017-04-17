
exports.up = function(knex, Promise) {
  return knex.schema.createTable('donut_order', (table) => {
    table.increments();
    table.integer('donut_id').notNullable();
    table.integer('order_id').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('donut_order');
};
