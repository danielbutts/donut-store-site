
exports.up = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.integer('base_id').notNullable().default(1);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.dropColumn('base_id');
  })
};
