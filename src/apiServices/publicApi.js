const publicService = require('../services/publicService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getpublic(req, res) {
  try {
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }
    const publicExist = await publicService.getpublic(id);
    if (!publicExist) {
      throw new Error(`public of ${id} does not exist`);
    }
    res.json(publicExist);
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

function postpublic(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.public) {
        throw new Error('No public specified');
      }
      if (!processedBody.publicid) {
        throw new Error('No publicid specified');
      }

      const data = {
        public: processedBody.public,
        publicid: processedBody.publicid,
      };

      const publicOK = await publicService.postpublic(data);
      if (!publicOK) {
        throw new Error('Failed to update public data');
      }
      const result = serviceHelper.createDataMessage(publicOK);
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

module.exports = {
  getpublic,
  postpublic,
};
