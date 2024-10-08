const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getNotification(id) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { envid: id };
  const projection = {
    projection: {
      _id: 0,
      notification: 1,
      notificationid: 1,
    },
  };
  const notificationRes = await serviceHelper.findOneInDatabase(database, notificationCollection, query, projection);
  if (notificationRes) {
    return notificationRes.notification;
  }
  throw new Error(`notification ${id} not found`);
}

async function postNotification(data) {
  const db = await serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const notificationCollection = config.collections.notifications;
  const query = { notificationid: data.notificationid };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  const projection = {
    projection: {
      _id: 0,
      notification: 1,
      notificationid: 1,
    },
  };

  const notificationExists = await serviceHelper.findOneInDatabase(database, notificationCollection, query, projection);
  if (notificationExists) {
    // update
    await serviceHelper.updateOneInDatabase(database, notificationCollection, query, { $set: data }, { upsert: true });
  } else {
    // insert to database
    await serviceHelper.insertOneToDatabase(database, notificationCollection, data);
  }
  return data; // all ok
}

module.exports = {
  getnotification,
  postnotification,
};
