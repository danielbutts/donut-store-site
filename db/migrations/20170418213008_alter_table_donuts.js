exports.up = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.float('total_price').notNullable().default(0);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.dropColumn('total_price');
  })
};
