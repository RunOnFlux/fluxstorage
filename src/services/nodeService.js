const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getNode(id) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const nodeCollection = config.collections.nodes;
  const query = { _id: id };
  const projection = {
    projection: {
      _id: 0,
      nodes: 1,
    },
  };
  const nodeRes = await serviceHelper.findOneInDatabase(database, nodeCollection, query, projection);
  if (nodeRes) {
    return nodeRes.node;
  }
  throw new Error(`Node ${id} not found`);
}

async function postNode(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const nodeCollection = config.collections.nodes;
  const query = { _id: data.id };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  const projection = {
    projection: {
      _id: 0,
      nodes: 1,
    },
  };

  const nodeExists = await serviceHelper.findOneInDatabase(database, nodeCollection, query, projection);
  if (nodeExists) {
    // update
    return await serviceHelper.updateOneInDatabase(database, nodeCollection, query, { $set: data }, { upsert: true });
  } else {
    // insert to database
    return await serviceHelper.insertOneToDatabase(database, nodeCollection, data);
  }
}

module.exports = {
  getNode,
  postNode,
};
