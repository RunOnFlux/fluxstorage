const config = require('config');

const serviceHelper = require('./serviceHelper');

async function getContacts(id) {
  const db = serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const contactsCollection = config.collections.contacts;
  const query = { contactsid: id };
  const projection = {
    projection: {
      _id: 0,
      contacts: 1,
      contactsid: 1,
    },
  };
  const contactsRes = await serviceHelper.findOneInDatabase(database, contactsCollection, query, projection);
  if (contactsRes) {
    return contactsRes.contacts;
  }
  throw new Error(`CONTACTS ${id} not found`);
}

// data is an object of contactsid, contacts
async function postContacts(data) {
  const db = serviceHelper.databaseConnection();
  const database = db.db(config.database.database);
  const contactsCollection = config.collections.contacts;
  const query = { contactsid: data.contactsid };
  const timestamp = new Date().getTime();
  // eslint-disable-next-line no-param-reassign
  data.timestamp = timestamp;
  const projection = {
    projection: {
      _id: 0,
      contacts: 1,
      contactsid: 1,
    },
  };
  const contactsExists = await serviceHelper.findOneInDatabase(database, contactsCollection, query, projection);
  if (contactsExists) {
    throw new Error(`CONTACTS of ${data.contactsid} already exists, can't be updated`);
  }
  // insert to database
  await serviceHelper.insertOneToDatabase(database, contactsCollection, data);
  return data; // all ok
}

module.exports = {
  getContacts,
  postContacts,
};
