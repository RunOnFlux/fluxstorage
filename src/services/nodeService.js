const config = require('config');
const { ObjectId } = require('mongodb');

const serviceHelper = require('./serviceHelper');

async function getNode(id) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const nodeCollection = config.collections.nodes;
  const query = { _id: new ObjectId(id) };
  const nodeRes = await serviceHelper.findOneInDatabase(database, nodeCollection, query, {});
  if (nodeRes) {
    return nodeRes;
  }
  throw new Error(`Node ${id} not found`);
}

async function postNode(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const nodeCollection = config.collections.nodes;
  const query = { _id: new ObjectId(data.id) };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  // eslint-disable-next-line no-param-reassign
  delete data.id;
  const nodeExists = await serviceHelper.findOneInDatabase(database, nodeCollection, query, {});
  if (nodeExists) {
    // update
    // eslint-disable-next-line no-return-await
    return await serviceHelper.updateOneInDatabase(database, nodeCollection, query, { $set: data }, { upsert: true });
  // eslint-disable-next-line no-else-return
  } else {
    // insert to database
    // eslint-disable-next-line no-return-await
    return await serviceHelper.insertOneToDatabase(database, nodeCollection, data);
  }
}

module.exports = {
  getNode,
  postNode,
};
