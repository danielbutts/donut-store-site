
exports.up = function(knex, Promise) {
  return knex.schema.table('donut_order', function (table) {
    table.integer('quantity').notNullable().default(1);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('donut_order', function (table) {
    table.dropColumn('quantity');
  })
};
