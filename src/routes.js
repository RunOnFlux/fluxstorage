const apicache = require('apicache');

const envApi = require('./apiServices/envApi,js');

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
};
