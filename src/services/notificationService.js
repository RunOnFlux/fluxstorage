/* eslint-disable no-return-await */
const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getNotification(notificationFluxId) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { fluxId: notificationFluxId };

  const notificationRes = await serviceHelper.findOneInDatabase(database, notificationCollection, query, {});
  if (notificationRes) {
    return notificationRes;
  }
  throw new Error(`notification for ${notificationFluxId} not found`);
}

async function postNotification(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { fluxId: data.fluxId };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  const notificationExists = await serviceHelper.findOneInDatabase(database, notificationCollection, query, {});
  if (notificationExists) {
    // update
    return await serviceHelper.updateOneInDatabase(database, notificationCollection, query, { $set: data }, { upsert: true });
  // eslint-disable-next-line no-else-return
  } else {
    // insert to database
    return await serviceHelper.insertOneToDatabase(database, notificationCollection, data);
  }
}

module.exports = {
  getNotification,
  postNotification,
};
