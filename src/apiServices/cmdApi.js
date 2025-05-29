const { protection } = require('config');
const cmdService = require('../services/cmdService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getCmd(req, res) {
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
    const ip = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'];
    console.log('ip:', ip);
    const cmdExist = await cmdService.getCmd(id);
    if (!cmdExist) {
      throw new Error(`CMD of ${id} does not exist`);
    }
    let verified = !protection;
    if (!verified) {
      const fluxNodes = await serviceHelper.axiosGet('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
      const pubKeys = [];
      fluxNodes.data.data.forEach((node) => {
        if (node.ip.split(':')[0] === ip) {
          pubKeys.push(node.pubkey);
        }
      });
      pubKeys.forEach((pubKey) => {
        const nodeVerified = serviceHelper.verifyMessage(messageToVerify, pubKey, signature);
        if (nodeVerified) {
          verified = true;
        }
      });
    }
    if (verified) {
      res.json(cmdExist);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

function postCmd(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.cmd) {
        throw new Error('No cmd specified');
      }
      if (!processedBody.cmdid) {
        throw new Error('No cmdid specified');
      }

      const data = {
        cmd: processedBody.cmd,
        cmdid: processedBody.cmdid,
      };

      const cmdOK = await cmdService.postCmd(data);
      if (!cmdOK) {
        throw new Error('Failed to update cmd data');
      }
      const result = serviceHelper.createDataMessage(cmdOK);
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

module.exports = {
  getCmd,
  postCmd,
};
