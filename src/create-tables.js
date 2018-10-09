const knex = require('./knex');

const createBusinessTable = async () => {
  console.log('Creating table: businesses...')
  await knex.schema.createTable('businesses', t => {
    t.string('business_id').primary();
    t.string('name');
    t.string('neighborhood');
    t.string('address');
    t.string('city');
    t.string('state');
    t.string('postal_code');
    t.float('latitude');
    t.float('longitude');
    t.float('stars');
    t.integer('review_count');
    t.bool('is_open');
    t.json('attributes');
    t.specificType('categories', 'varchar[]');
    t.json('hours');
  });
  console.log('Done!');
}

const createReviewsTable = async () => {
  console.log('Creating table: reviews...');
  await knex.schema.createTable('reviews', t => {
    t.string('review_id').primary();
    t.string('user_id');
    t.string('business_id');
    t.float('stars');
    t.date('date');
    t.text('text');
    t.float('useful');
    t.float('funny');
    t.float('cool');
  });
  console.log('Done!');
}

const go = async () => {
  await createBusinessTable();
  await createReviewsTable();
}

go().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1)
});
