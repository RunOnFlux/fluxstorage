const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getPublic(id) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const publicCollection = config.collections.public;
  const query = { publicid: id };
  const projection = {
    projection: {
      _id: 0,
      public: 1,
      publicid: 1,
    },
  };
  const publicRes = await serviceHelper.findOneInDatabase(database, publicCollection, query, projection);
  if (publicRes) {
    return publicRes.public;
  }
  throw new Error(`PUBLIC ${id} not found`);
}

// data is an object of publicid, public
async function postPublic(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const publicCollection = config.collections.public;
  const query = { publicid: data.publicid };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  // eslint-disable-next-line no-param-reassign
  data.createdAt = new Date(timestamp);
  // insert to database
  await serviceHelper.updateOneInDatabase(database, publicCollection, query, { $set: data }, { upsert: true });
  return data; // all ok
}

module.exports = {
  getPublic,
  postPublic,
};
