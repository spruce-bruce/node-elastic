# Managing elasticsearch indices in node

Repo with example code showing how to manage elasticsearch indices, especially for user facing search applications. Goals will be:

1. Create indices with node
1. Store mappings in javascript
1. Create a process for reindexing data when mappings change
1. Codify best practices into our code so we don't have to think about it

## Setup
```



docker-compose up
npm i

# Download yelp data from kaggle
# This command uses the kaggle api: https://github.com/Kaggle/kaggle-api
# You can also just download the businesses and reviews dataset from https://www.kaggle.com/yelp-dataset/yelp-dataset
# This is about 3GB so it takes a minute
cd data
kaggle datasets download -d yelp-dataset/yelp-dataset -f yelp_academic_dataset_business.json
kaggle datasets download -d yelp-dataset/yelp-dataset -f yelp_academic_dataset_review.json

# unzip those files
# I'd stream the unzip in code but node is trash with .zip files

# Creates the postgres tables
npm run create-tables

# Seeds yelp data into the postgres db
# This takes a while. There are close to 190,000 businesses and 6 million reviews
npm run seed
```
