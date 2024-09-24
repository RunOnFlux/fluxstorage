const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getNode(id) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const nodeCollection = config.collections.nodes;
  const query = { envid: id };
  const projection = {
    projection: {
      _id: 0,
      node: 1,
      nodeid: 1,
    },
  };
  const nodeRes = await serviceHelper.findOneInDatabase(database, nodeCollection, query, projection);
  if (nodeRes) {
    return nodeRes.node;
  }
  throw new Error(`Node ${id} not found`);
}

// data is an object of envid, env
async function postNode(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const nodeCollection = config.collections.nodes;
  const query = { nodeid: data.nodeid };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  const projection = {
    projection: {
      _id: 0,
      node: 1,
      nodeid: 1,
    },
  };

  const nodeExists = await serviceHelper.findOneInDatabase(database, nodeCollection, query, projection);
  if (nodeExists) {
    // update
    await serviceHelper.updateOneInDatabase(database, nodeCollection, query, { $set: data }, { upsert: true });
  } else {
    // insert to database
    await serviceHelper.insertOneToDatabase(database, nodeCollection, data);
  }
  return data; // all ok
}

module.exports = {
  getNode,
  postNode,
};
