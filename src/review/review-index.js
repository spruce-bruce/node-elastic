module.exports = {
  sources: [
    {
      readStream: require('./reviewDbReader'),
      writeStream: require('./reviewEsWriter'),
    },
  ],

  alias: 'review',
  index: {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
    },

    mappings: {
      review: {
        dynamic: 'strict',
        properties: {
          review_id: { type: 'keyword' },
          user_id: { type: 'keyword' },
          business_id: { type: 'keyword' },
          stars: { type: 'float' },
          date: { type: 'date' },
          text: { type: 'text' },
          useful: { type: 'float' },
          funny: { type: 'float' },
          cool: { type: 'float' },
        }
      },
    },
  }
};
