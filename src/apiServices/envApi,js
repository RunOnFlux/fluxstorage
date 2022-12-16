const envService = require('../services/envService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getEnv(req, res) {
  try {
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }
    // get IP
    // get deterministic node list todo daemon/viewdeterministcizelnodelist, use cache and constant refreshing of it
    // from ip get nodes that are fine, array of pub keys, do verification
    const signature = req.headers['flux-signature'];
    const messageToVerify = req.headers['flux-message'];
    const ip = req.headers['x-forwarded-for'];
    const envExist = await envService.getEnv(id);
    if (!envExist) {
      throw new Error(`ENV of ${id} does not exist`);
    }
    const fluxNodes = await serviceHelper.axiosGet('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
    const pubKeys = [];
    fluxNodes.data.data.forEach((node) => {
      if (node.ip.split(':')[0] === ip) {
        pubKeys.push(node.pubkey);
      }
    });
    let verified = false;
    pubKeys.forEach((pubKey) => {
      const nodeVerified = serviceHelper.verifyMessage(messageToVerify, pubKey, signature);
      if (nodeVerified) {
        verified = true;
      }
    });
    if (verified) {
      res.json(envExist);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

function postEnv(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.env) {
        throw new Error('No env specified');
      }
      if (!processedBody.envid) {
        throw new Error('No envid specified');
      }

      const data = {
        env: processedBody.env,
        envid: processedBody.envid,
      };

      const envOK = await envService.postEnv(data);
      if (!envOK) {
        throw new Error('Failed to update env data');
      }
      const result = serviceHelper.createDataMessage(envOK);
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

module.exports = {
  getEnv,
  postEnv,
};
