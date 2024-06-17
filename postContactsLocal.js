const contactsService = require('./src/services/contactsService');

const contactsid = 'testc';
const contacts = ['abc@gmail.com'];

async function postContacts() {
  const data = {
    contactsid,
    contacts,
  };
  const env = await contactsService.postContacts(data, true);
  console.log(env);
}

postContacts();
