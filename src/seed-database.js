

const fs   = require('fs');
const zlib = require('zlib');

const { chain } = require('stream-chain');
const { ClassicParser, parser } = require('stream-json');
const { streamValues } = require('stream-json/streamers/StreamValues');

const knex = require('./knex');
let records = [];
let total = 0;

const persistBusinesses = () => {
  const recordsToSave = [...records];
  records = [];

  total += recordsToSave.length;
  console.log(`persisting ${recordsToSave.length} businesses. Total ${total}.`)

  knex('businesses').insert(recordsToSave.map(record => {
    const { categories } = record.value;
    record.value.categories = categories ? categories.split(', ') : categories;
    return record.value;
  })).catch(e => console.error(e));
}

const persistReviews = () => {
  const recordsToSave = [...records];
  records = [];

  total += recordsToSave.length;
  console.log(`persisting ${recordsToSave.length} reviews. Total ${total}.`)

  knex('reviews').insert(recordsToSave.map(record => record.value))
    .catch(e => console.error(e));
}

const businesses = () => {
  return new Promise((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream('./data/yelp_academic_dataset_business.json'),
      parser({jsonStreaming: true}),
      streamValues(),
      data => {
        records.push(data);
        if (records.length >= 10000) {
          persistBusinesses();
        }
      },
    ]);

    let counter = 0;
    pipeline.on('data', x => ++counter)

    pipeline.on('close', () => console.log('close'))

    pipeline.on('error', (e) => {
      console.log('error')
      reject(e);
    });
    pipeline.on('finish', () => {
      persistBusinesses();
      console.log(`finish: ${counter}`);
      resolve();
    });
  });
}

const reviews = () => {
  return new Promise((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream('./data/yelp_academic_dataset_review.json'),
      parser({jsonStreaming: true}),
      streamValues(),
      data => {
        records.push(data);
        if (records.length >= 10000) {
          persistReviews();
        }
      },
    ]);

    let counter = 0;
    pipeline.on('data', x => ++counter)

    pipeline.on('close', () => console.log('close'))

    pipeline.on('error', (e) => {
      console.log('error')
      reject(e);
    });
    pipeline.on('finish', () => {
      persistReviews();
      console.log(`finish: ${counter}`);
      resolve();
    });
  });
}

const go = async () => {
  await businesses();
  await reviews();
};


go().then(() => {
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
})
