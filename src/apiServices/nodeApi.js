// eslint-disable-next-line no-unused-vars
const UNG = require('unique-names-generator');
const { LRUCache } = require('lru-cache');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

const { adjectives, animals, uniqueNamesGenerator } = UNG;
const UNGconfig = {
  dictionaries: [adjectives, animals],
  separator: '-',
};

const nodeInfoCacheOptions = {
  max: 20000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
};

const nodeInfoCache = new LRUCache(nodeInfoCacheOptions);

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
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.adminId) {
        throw new Error('No Flux ID specified');
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
      // find in nodeInfoCache id if all the parameters are the same, return existing id key
      // eslint-disable-next-line max-len
      const existingId = nodeInfoCache.find((node) => node.adminId === processedBody.adminId && node.nodeKey === processedBody.nodeKey && node.transactionOutput === processedBody.transactionOutput && node.transactionIndex === processedBody.transactionIndex && node.nodeName === processedBody.nodeName);
      if (existingId) {
        // return existing id key
        const result = serviceHelper.createDataMessage(existingId.id);
        res.json(result);
        return;
      }

      let id = uniqueNamesGenerator(UNGconfig);
      // generate a unique id for the node if id already exists
      while (nodeInfoCache.has(id)) {
        id = uniqueNamesGenerator(UNGconfig);
      }

      const data = {
        adminId: processedBody.adminId,
        nodeKey: processedBody.nodeKey,
        transactionOutput: processedBody.transactionOutput,
        transactionIndex: processedBody.transactionIndex,
        nodeName: processedBody.nodeName,
        id,
      };
      nodeInfoCache.set(id, data);

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
