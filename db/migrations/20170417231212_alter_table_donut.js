exports.up = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.dropColumn('isactive');
    table.boolean('is_active').notNullable().default(true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.dropColumn('is_active');
    table.boolean('isactive').notNullable().default(true);
  })
};
