
exports.up = function(knex, Promise) {
  return knex.schema.createTable('donuts', (table) => {
    table.increments();
    table.string('name').notNullable();
    table.boolean('isactive').notNullable().default(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('donuts');
};
