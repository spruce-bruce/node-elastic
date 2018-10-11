var elasticsearch = require('elasticsearch');

module.exports = new elasticsearch.Client({
  apiVersion: '5.5',
  host: 'localhost:9200',
  httpAuth: 'elastic:changeme',
});
