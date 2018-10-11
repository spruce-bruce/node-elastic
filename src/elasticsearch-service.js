const elasticsearch = require('./elasticsearch');

class ElasticsearchService {
  async reindex(indexData) {
    const indexName = indexData.alias + Date.now();
    await this.createIndex(indexName, indexData);
    await this.seedIndex(indexName, indexData);
    await this.swapAlias(indexName, indexData.alias);
    await this.removeOldIndices(indexData.alias, indexName);
  }

  async reindexWithProvidedStreams(readableStream, writeableStream) {
    await this._seedSource(readableStream, writeableStream);
  }

  async clear() {
    let indices = await elasticsearch.cat.indices({h: 'i'});
    indices = indices.trim().split(/\s*\n\s*/);

    for (let i = 0; i < indices.length; i++) {
      const regex = new RegExp(`^\\.`)
      if (!regex.test(indices[i])) {
        console.log(`deleting ${indices[i]}`);
        await elasticsearch.indices.delete({index: indices[i]});
      }
    }
  }

  async createIndex(indexName, indexData) {
    console.log(`creating index ${indexName}`);
    return elasticsearch.indices.create({
      index: indexName,
      body: indexData.index
    });
  }

  async swapAlias(newIndexName, aliasName) {
    const alias = await elasticsearch.indices.getAlias({
      name: aliasName,
      ignore: [404],
    });

    if (alias.error) {
      console.log(`Creating new alias ${aliasName} with index ${newIndexName}`);
      return elasticsearch.indices.putAlias({
        name: aliasName,
        index: newIndexName,
      })
    } else {
      console.log(`updating alias ${aliasName} to point to index ${newIndexName}`);
      return elasticsearch.indices.updateAliases({
        body: {
          actions: [{
            remove: {
              index: Object.keys(alias)[0],
              alias: aliasName
            },
          }, {
            add: {
              index: newIndexName,
              alias: aliasName
            }
          }]
        }
      });
    }
  }

  _seedSource(readableStream, writableStream) {
    readableStream.pipe(writableStream);

    return new Promise((resolve, reject) => {
      writableStream.on('finish', () => {
        resolve();
      });
      writableStream.on('error', e => {
        reject(e);
      });
      readableStream.on('error', e => {
        reject(e);
      });
    });
  }

  async seedIndex(indexName, indexData) {

    if (indexData.sources) {
      // multiple streams
      for (let i = 0; i < indexData.sources.length; i++) {
        console.log(`seeding data in alias ${indexData.alias} for source ${i}`);
        const reader = indexData.sources[i].readStream;
        const writer = indexData.sources[i].writeStream;
        const readableStream = new reader();
        const writableStream = new writer(indexName);
        await this._seedSource(readableStream, writableStream);
      }
    } else {
      console.log(`seeding data in alias ${indexData.alias}`);
      const reader = indexData.readStream;
      const writer = indexData.writeStream;
      const readableStream = new reader();
      const writableStream = new writer(indexName);
      await this._seedSource(readableStream, writableStream);
    }
  }

  async removeOldIndices(alias, newIndex) {
    console.log(`removing old indices for alias ${alias}`);
    let indices = await elasticsearch.cat.indices({h: 'i'});
    indices = indices.trim().split(/\s*\n\s*/);

    for (let i = 0; i <= indices.length; i++) {
      const regex = new RegExp(`^${alias}`)
      if (regex.test(indices[i]) && indices[i] !== newIndex) {
        console.log(`deleting ${indices[i]}`);
        await elasticsearch.indices.delete({index: indices[i]});
      }
    }
  }
}

module.exports = new ElasticsearchService();
