module.exports = {
  sources: [
    {
      readStream: require('./businessDbReader'),
      writeStream: require('./businessEsWriter'),
    },
  ],

  alias: 'business',
  index: {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
    },

    mappings: {
      business: {
        dynamic: 'strict',
        properties: {
          business_id: { type: 'keyword' },
          name: { type: 'text' },
          neighborhood: { type: 'text' },
          city: { type: 'text' },
          state: { type: 'text' },
          postal_code: { type: 'keyword' },
          stars: { type: 'float' },
          is_open: { type: 'boolean' },
          categories: { type: 'text' },
        }
      },
    },
  }
};
