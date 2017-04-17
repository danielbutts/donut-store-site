
exports.up = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.string('image_url',1000);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('donuts', function (table) {
    table.dropColumn('image_url');
  })
};
