// eslint-disable-next-line no-unused-vars
const { protection } = require('config');
const { LRUCache } = require('lru-cache');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

const nodeInfoCacheOptions = {
  max: 20000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
};

const nodeTxCacheOptions = {
  max: 20000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
};

const nodeInfoCache = new LRUCache(nodeInfoCacheOptions);
const nodeTxsCache = new LRUCache(nodeTxCacheOptions);

async function getNode(req, res) {
  try {
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }
    if (nodeInfoCache.has(id)) {
      const result = serviceHelper.createDataMessage(nodeInfoCache.get(id));
      nodeInfoCache.delete(id);
      res.json(result);
    } else {
      throw new Error('Node Identifier not found.');
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
      const signature = req.headers['flux-signature'];
      const messageToVerify = req.headers['flux-message'];
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.adminId) {
        throw new Error('No Flux/SSP ID specified');
      }
      const nodeVerified = serviceHelper.verifyMessage(messageToVerify, processedBody.adminId, signature);
      if (!nodeVerified) {
        throw new Error('Message signature failed for the node administrador id');
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
      if (!processedBody.nodeName) {
        throw new Error('No node name specified');
      }
      let id = null;
      if (nodeTxsCache.has(processedBody.transactionOutput + processedBody.transactionIndex)) {
        id = nodeTxsCache.get(processedBody.transactionOutput + processedBody.transactionIndex);
      } else {
        id = Math.random().toString(36).slice(2);
        let run = 0;
        while (nodeInfoCache.has(id)) {
          run += 1;
          if (run === 10) {
            throw new Error('Failed to generate a valid identifier for the node information');
          }
          id = Math.random().toString(36).slice(2);
        }
      }
      const data = {
        adminId: processedBody.adminId,
        nodeKey: processedBody.nodeKey,
        transactionOutput: processedBody.transactionOutput,
        transactionIndex: processedBody.transactionIndex,
        nodeName: processedBody.nodeName,
      };
      nodeInfoCache.set(id, data);
      nodeTxsCache.set(processedBody.transactionOutput + processedBody.transactionIndex, id);
      const result = serviceHelper.createDataMessage(id);
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
