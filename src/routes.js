const apicache = require('apicache');

const envApi = require('./apiServices/envApi');
const cmdApi = require('./apiServices/cmdApi');
const contactsApi = require('./apiServices/contactsApi');

const cache = apicache.middleware;

module.exports = (app) => {
  // return env
  app.get('/v1/env/:id?', cache('5 minutes'), (req, res) => {
    envApi.getEnv(req, res);
  });
  // currently unprotected
  app.post('/v1/env', (req, res) => {
    envApi.postEnv(req, res);
  });
  // return cmd
  app.get('/v1/cmd/:id?', cache('5 minutes'), (req, res) => {
    cmdApi.getCmd(req, res);
  });
  // currently unprotected
  app.post('/v1/cmd', (req, res) => {
    cmdApi.postCmd(req, res);
  });
  // return cmd
  app.get('/v1/contacts/:id?', cache('5 minutes'), (req, res) => {
    contactsApi.getContacts(req, res);
  });
  // currently unprotected
  app.post('/v1/contacts', (req, res) => {
    contactsApi.postContacts(req, res);
  });
};
