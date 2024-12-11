const config = require('config');

const serviceHelper = require('./serviceHelper');
const log = require('../lib/log');

async function doEnvIndexes() {
  try {
    log.info('env collection indexes');
    const db = await serviceHelper.databaseConnection();
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
    const db = await serviceHelper.databaseConnection();
    const database = db.db(config.database.database);

    await database.collection(config.collections.cmd).createIndex({ cmdid: 1 }); // for querying paritcular cmd

    log.info('cmd collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

async function doPublicIndexes() {
  try {
    log.info('public collection indexes');
    const db = await serviceHelper.databaseConnection();
    const database = db.db(config.database.database);

    await database.collection(config.collections.public).createIndex({ publicid: 1 }); // for querying paritcular public

    log.info('public collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

async function doContactsIndexes() {
  try {
    log.info('contacts collection indexes');
    const db = await serviceHelper.databaseConnection();
    const database = db.db(config.database.database);

    await database.collection(config.collections.contacts).createIndex({ contactsid: 1 }); // for querying paritcular contact

    log.info('contacts collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

async function doNotificationsIndexes() {
  try {
    log.info('notification collection indexes');
    const db = await serviceHelper.databaseConnection();
    const database = db.db(config.database.database);

    await database.collection(config.collections.notifications).createIndex({ adminId: 1 }); // for querying paritcular notification
    await database.collection(config.collections.notifications).createIndex({ words: 1 }); // for querying paritcular notification

    log.info('notification collection indexes created.');
  } catch (error) {
    log.error(error); // failiure is ok, continue
  }
}

module.exports = {
  doEnvIndexes,
  doCmdIndexes,
  doPublicIndexes,
  doContactsIndexes,
  doNotificationsIndexes,
};
