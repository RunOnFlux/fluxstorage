const { protection } = require('config');
const notificationService = require('../services/notificationService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getNotificationInfo(req, res) {
  try {
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }

    const signature = req.headers['flux-signature'];
    const messageToVerify = req.headers['flux-message'];
    const ip = req.headers['x-forwarded-for'];
    const notificationExist = await notificationService.getNotification(id);
    if (!notificationExist) {
      throw new Error(`notification ${id} does not exist`);
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
      res.json(notificationExist);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

function postNotificationInfo(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      const notificationid = null;
      if (!processedBody.adminid) {
        throw new Error('No adminid specified');
      }
      if (!processedBody.nodeKey) {
        throw new Error('No nodeKey specified');
      }
      if (!processedBody.transactionOutput) {
        throw new Error('No transaction output specified');
      }
      if (!processedBody.transactionIndex) {
        throw new Error('No transaction index specified');
      }
      if (!processedBody.nodeNname) {
        throw new Error('No node name specified');
      }
      if (processedBody.notificationid) {
        notificationid = processedBody.notificationid;
      }

      const data = {
        notificationid: notificationid,
        adminid: processedBody.adminid,
        notificationKey: processedBody.notificationKey,
        transactionOutput: processedBody.transactionOutput,
        transactionIndex: processedBody.transactionIndex,
        notificationNname: processedBody.notificationName,
      };

      const notificationOK = await notificationService.postnotification(data);
      if (!notificationOK) {
        throw new Error('Failed to update notification data');
      }
      const result = serviceHelper.createDataMessage(notificationOK);
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

module.exports = {
  getNotificationInfo,
  postNotificationInfo,
};
