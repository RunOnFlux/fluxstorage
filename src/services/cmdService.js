const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getCmd(id) {
  const db = serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const cmdCollection = config.collections.cmd;
  const query = { cmdid: id };
  const projection = {
    projection: {
      _id: 0,
      cmd: 1,
      cmdid: 1,
    },
  };
  const cmdRes = await serviceHelper.findOneInDatabase(database, cmdCollection, query, projection);
  if (cmdRes) {
    return cmdRes.cmd;
  }
  throw new Error(`CMD ${id} not found`);
}

// data is an object of cmdid, cmd
async function postCmd(data) {
  const db = serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const cmdCollection = config.collections.cmd;
  const query = { cmdid: data.cmdid };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  const projection = {
    projection: {
      _id: 0,
      cmd: 1,
      cmdid: 1,
    },
  };
  const cmdExists = await serviceHelper.findOneInDatabase(database, cmdCollection, query, projection);
  if (cmdExists) {
    throw new Error(`CMD of ${data.cmdid} already exists, can't be updated`);
  }
  // insert to database
  await serviceHelper.insertOneToDatabase(database, cmdCollection, data);
  return data; // all ok
}

module.exports = {
  getCmd,
  postCmd,
};
