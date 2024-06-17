const contactsService = require('./src/services/contactsService');

const e = '';

async function getContacts() {
  const env = await contactsService.getContacts(e);
  console.log(env);
}

getContacts();
