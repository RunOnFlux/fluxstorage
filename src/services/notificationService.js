/* eslint-disable no-return-await */
const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getNotification(notificationFluxId) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { fluxId: notificationFluxId };
  const notificationRes = await serviceHelper.findOneInDatabase(database, notificationCollection, query, {});
  return notificationRes;
}

async function getNotificationFromWords(words) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { words };
  const notificationRes = await serviceHelper.findOneInDatabase(database, notificationCollection, query, {});
  return notificationRes;
}

async function postNotification(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { fluxId: data.fluxId };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  await serviceHelper.updateOneInDatabase(database, notificationCollection, query, { $set: data }, { upsert: true });
}

module.exports = {
  getNotification,
  postNotification,
  getNotificationFromWords,
};
