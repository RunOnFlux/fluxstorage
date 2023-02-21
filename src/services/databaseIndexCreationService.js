const config = require('config');

const serviceHelper = require('./serviceHelper');
const log = require('../lib/log');

async function doEnvIndexes() {
  try {
    log.info('env collection indexes');
    const db = serviceHelper.databaseConnection();
    const database = db.db(config.database.database);

    await database.collection(config.collections.env).createIndex({ envid: 1 }); // for querying paritcular env

    log.info('env collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

async function doCmdIndexes() {
  try {
    log.info('cmd collection indexes');
    const db = serviceHelper.databaseConnection();
    const database = db.db(config.database.database);

    await database.collection(config.collections.cmd).createIndex({ cmdid: 1 }); // for querying paritcular cmd

    log.info('cmd collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

module.exports = {
  doEnvIndexes,
  doCmdIndexes,
};
