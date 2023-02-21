module.exports = {
  server: {
    port: 9876,
  },
  protection: true, // if flux storage requires fluxos authentication
  database: {
    url: '127.0.0.1',
    port: 27017,
    database: 'dbname',
    username: 'dbusername',
    password: 'dbpassword',
  },
  collections: {
    env: 'env',
    cmd: 'cmd',
  },
};
