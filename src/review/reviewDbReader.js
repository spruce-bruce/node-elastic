const { Readable } = require('stream');
const knex = require('../knex');

const BATCH_SIZE = 10000;
class ItemDbReader extends Readable {
  constructor(options) {
    super({...options, objectMode: true});

    this._lastId = false;
    this._records = [];
  }

  _read() {
    if (!this._records.length) {
      console.log(`Fetching ${BATCH_SIZE} more reviews...`);
      let query = knex.select('*').from('reviews')
        .orderBy('review_id', 'asc');

      if (this._lastId) query = query.where('review_id', '>', '0005v4K5iZM3QAfImf_Ugw');

      query
        .limit(BATCH_SIZE)
        .then(records => {
          console.log(`Pushing ${BATCH_SIZE} reviews`);
          this._lastId = records.length ? records[records.length - 1].review_id : false;
          this._records = records;
          this._pushRecords(records.length === 0);
        })
        .catch(e => this.emit('error', e));
    } else {
      this._pushRecords();
    }
  }

  _pushRecords(done) {
    if (done) {
      this.push(null);
    } else if (this._records.length) {
      this.push({...this._records.shift()});
    }
  }
}

module.exports = ItemDbReader;
