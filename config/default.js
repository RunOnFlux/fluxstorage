const secrets = require('./secrets');

module.exports = {
  server: {
    port: 9876,
  },
  protection: true, // if flux storage requires fluxos authentication
  isAuth: true,
  contactsApiKey: secrets.contactsApiKey,
  database: {
    url: '127.0.0.1',
    port: 27017,
    database: secrets.dbname,
    username: secrets.dbusername,
    password: secrets.dbpassword,
  },
  collections: {
    env: 'env',
    cmd: 'cmd',
    public: 'public',
    contacts: 'contacts',
  },
};
