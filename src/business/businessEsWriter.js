const { Writable } = require('stream');
const compact = require('lodash/compact');
const elasticsearch = require('../elasticsearch');

const BATCH_SIZE = 10000;
class ItemEsWriter extends Writable {
  constructor(index, options) {
    super({...options, objectMode: true});
    this._index = index || 'business';

    this._records = [];
  }

  _write(chunk, enc, next) {
    this._records.push(chunk);

    if (this._records.length >= BATCH_SIZE) {
      this._persist(next);
    } else {
      next();
    }
  }

  _final(end) {
    this._persist(end);
  }

  _persist(next) {
    if (this._records.length) {
      console.log(`writing ${this._records.length} businesses to business index`);
      return elasticsearch.bulk({
        index: this._index,
        type: 'business',
        body: this._records.reduce((acc, record) => {
          acc.push({
            index: {
              _id: record.id,
            }
          });

          const {
            business_id,
            name,
            neighborhood,
            city,
            state,
            postal_code,
            stars,
            is_open,
            categories,
          } = record;

          const doc = {
            business_id,
            name,
            neighborhood,
            city,
            state,
            postal_code,
            stars,
            is_open,
            categories,
          };

          acc.push(doc);
          return acc;
        }, [])
      })
        .then(result => {
          if (result.errors) {
            const errors = result.items.map(item => item.index.error ? item : null);
            next(new Error(JSON.stringify(compact(errors), null, 2)))
          } else {
            this._records = [];
            next();
          }
        })
        .catch(e => {
          next(e);
        });
    } else {
      next();
    }
  }
}

module.exports = ItemEsWriter;
