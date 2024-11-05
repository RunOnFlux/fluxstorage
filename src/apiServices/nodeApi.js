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
    const nodeExist = await nodeService.getNode(id);
    if (!nodeExist) {
      throw new Error(`Node ${id} does not exist`);
    }
    // no verification ATM
    let verified = true;
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
      const nodeid = null;
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
      if (processedBody.nodeid) {
        nodeid = processedBody.nodeid;
      }

      const data = {
        nodeid: nodeid,
        adminid: processedBody.adminid,
        nodeKey: processedBody.nodeKey,
        transactionOutput: processedBody.transactionOutput,
        transactionIndex: processedBody.transactionIndex,
        nodeNname: processedBody.nodeName,
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
