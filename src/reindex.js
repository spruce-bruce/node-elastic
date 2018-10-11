#! /usr/bin/env node
const service = require('./elasticsearch-service');
const businessIndex = require('./business/business-index');
const reviewIndex = require('./review/review-index');

const go = async () => {
  await service.reindex(businessIndex);
  // await service.reindex(reviewIndex);
}

go().then(() => {
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
})
