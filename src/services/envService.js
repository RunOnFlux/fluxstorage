const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getEnv(id) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const envCollection = config.collections.env;
  const query = { envid: id };
  const projection = {
    projection: {
      _id: 0,
      env: 1,
      envid: 1,
    },
  };
  const envRes = await serviceHelper.findOneInDatabase(database, envCollection, query, projection);
  if (envRes) {
    return envRes.env;
  }
  throw new Error(`ENV ${id} not found`);
}

// data is an object of envid, env
async function postEnv(data, update = false) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const envCollection = config.collections.env;
  const query = { envid: data.envid };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  const projection = {
    projection: {
      _id: 0,
      env: 1,
      envid: 1,
    },
  };
  if (!update) {
    const envExists = await serviceHelper.findOneInDatabase(database, envCollection, query, projection);
    if (envExists) {
      throw new Error(`ENV of ${data.envid} already exists, can't be updated`);
    }
    // insert to database
    await serviceHelper.insertOneToDatabase(database, envCollection, data);
    return data; // all ok
  }
  // update
  await serviceHelper.updateOneInDatabase(database, envCollection, query, { $set: data }, { upsert: true });
  return data; // all ok
}

module.exports = {
  getEnv,
  postEnv,
};
