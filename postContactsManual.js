const axios = require('axios');

async function postContactsToStorage() {
  const data = {
    contactsid: 'mytestcontactss',
    contacts: ['tadeas@runonflux.io', 'tadeas@zelcore.io'],
  };
  const response = await axios.post('https://storage.runonflux.io/v1/contacts', data);
  console.log(response.data);
}

postContactsToStorage();
