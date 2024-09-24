const secrets = require('./secrets');

module.exports = {
  server: {
    port: 9876,
  },
  protection: true, // if flux storage requires fluxos authentication
  contactsApiKey: secrets.contactsApiKey,
  database: {
    url: '127.0.0.1',
    port: 27017,
    isAuth: secrets.isAuth,
    database: secrets.dbname,
    username: secrets.dbusername,
    password: secrets.dbpassword,
  },
  collections: {
    env: 'env',
    cmd: 'cmd',
    public: 'public',
    contacts: 'contacts',
    nodes: 'nodes',
  },
};
