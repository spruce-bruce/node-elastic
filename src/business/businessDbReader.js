const { Readable } = require('stream');
const knex = require('../knex');

const BATCH_SIZE = 10000;
class ItemDbReader extends Readable {
  constructor(options) {
    super({...options, objectMode: true});

    this._cursor = 0;
    this._records = [];
  }

  _read() {
    if (!this._records.length) {
      knex.select('*').from('businesses')
        .orderBy('business_id', 'asc')
        .limit(BATCH_SIZE)
        .offset(this._cursor)
        .then(records => {
          console.log(`pushing ${records.length} businesses`)
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
      this._cursor++;
      this.push({...this._records.shift()});
    }
  }
}

module.exports = ItemDbReader;
