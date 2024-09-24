const { protection } = require('config');
const nodeService = require('../services/nodeService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getNode(req, res) {
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
    const nodeExist = await nodeService.getNode(id);
    if (!nodeExist) {
      throw new Error(`Node ${id} does not exist`);
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
      res.json(nodeExist);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

function postNode(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.node) {
        throw new Error('No node specified');
      }
      if (!processedBody.nodeid) {
        throw new Error('No nodeid specified');
      }

      const data = {
        node: processedBody.node,
        nodeid: processedBody.node,
      };

      const nodeOK = await nodeService.postNode(data);
      if (!nodeOK) {
        throw new Error('Failed to update node data');
      }
      const result = serviceHelper.createDataMessage(nodeOK);
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

module.exports = {
  getNode,
  postNode,
};
