const envApi = require('./apiServices/envApi');
const cmdApi = require('./apiServices/cmdApi');
const publicApi = require('./apiServices/publicApi');
const contactsApi = require('./apiServices/contactsApi');
const nodeApi = require('./apiServices/nodeApi');
const notificationApi = require('./apiServices/notificationApi');
const extraNodeInformationApi = require('./apiServices/extraNodeInformationApi');

module.exports = (app) => {
  // return env
  app.get('/v1/env/:id?', (req, res) => {
    envApi.getEnv(req, res);
  });
  app.get('/v2/env/:id?', (req, res) => {
    envApi.getEnvV2(req, res);
  });
  // currently unprotected
  app.post('/v1/env', (req, res) => {
    envApi.postEnv(req, res);
  });
  // return cmd
  app.get('/v1/cmd/:id?', (req, res) => {
    cmdApi.getCmd(req, res);
  });
  // currently unprotected
  app.post('/v1/cmd', (req, res) => {
    cmdApi.postCmd(req, res);
  });
  // return cmd
  app.get('/v1/contacts/:id?', (req, res) => {
    contactsApi.getContacts(req, res);
  });
  // currently unprotected
  app.post('/v1/contacts', (req, res) => {
    contactsApi.postContacts(req, res);
  });
  // return public
  app.get('/v1/public/:id?', (req, res) => {
    publicApi.getPublic(req, res);
  });
  // currently unprotected
  app.post('/v1/public', (req, res) => {
    publicApi.postPublic(req, res);
  });
  // return node info
  app.get('/v1/node/:id?', (req, res) => {
    nodeApi.getNode(req, res);
  });
  // currently unprotected
  app.post('/v1/node', (req, res) => {
    nodeApi.postNode(req, res);
  });
  // return notification info
  app.get('/v1/notification/:id?', (req, res) => {
    notificationApi.getNotificationInfo(req, res);
  });
  // currently unprotected
  app.post('/v1/notification', (req, res) => {
    notificationApi.postNotificationInfo(req, res);
  });
  // return extra node info
  app.get('/v1/extranodeinformation/:id?', (req, res) => {
    extraNodeInformationApi.getExtraNodeInfo(req, res);
  });
  // currently unprotected
  app.post('/v1/extranodeinformation', (req, res) => {
    extraNodeInformationApi.postExtraNodeInfo(req, res);
  });
  app.get('/test/ip', (request, response) => response.send(request.ip));
};
