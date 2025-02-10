/* eslint-disable no-return-await */
const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getData(adminFluxId) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { adminId: adminFluxId };
  const notificationRes = await serviceHelper.findOneInDatabase(database, notificationCollection, query, {});
  return notificationRes;
}

async function getDataFromWords(words) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { words };
  const notificationRes = await serviceHelper.findOneInDatabase(database, notificationCollection, query, {});
  return notificationRes;
}

async function postData(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { adminId: data.adminId };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  await serviceHelper.updateOneInDatabase(database, notificationCollection, query, { $set: data }, { upsert: true });
}

module.exports = {
  getData,
  postData,
  getDataFromWords,
};
