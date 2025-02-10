// eslint-disable-next-line no-unused-vars
const { protection } = require('config');
const extraNodeInformation = require('../services/extraNodeInformationService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getExtraNodeInfo(req, res) {
  try {
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }
    const notificationExist = await extraNodeInformation.getDataFromWords(id);
    if (!notificationExist) {
      throw new Error('Extra Node Info does not exist for words identifier');
    }
    res.json(notificationExist);
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
  }
}

function postExtraNodeInfo(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.adminId) {
        throw new Error('No Flux/SSP ID not specified');
      }
      if (!processedBody.words) {
        throw new Error('Words identifier is mandatory');
      }
      // eslint-disable-next-line global-require
      const nodeApi = require('./nodeApi');
      const nodeInfoCache = nodeApi.getNodeInfoCache();
      if (!nodeInfoCache.has(processedBody.words)) {
        throw new Error('Words identifier not present on node information API');
      }

      const data = {
        adminId: processedBody.adminId,
        discordUserId: processedBody.discordUserId,
        discordWebHookUrl: processedBody.discordWebHookUrl,
        telegramAlert: processedBody.telegramAlert,
        telegramBotToken: processedBody.telegramBotToken,
        telegramChatId: processedBody.telegramChatId,
        email: processedBody.email,
        sshKey: processedBody.sshKey,
        blockedPorts: processedBody.blockedPorts,
        blockedRepos: processedBody.blockedRepos,
        genericWebHookUrl: processedBody.genericWebHookUrl,
        words: processedBody.words,
      };

      await extraNodeInformation.postData(data);
      const result = serviceHelper.createSuccessMessage('Extra Node Info settings inserted/updated');
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

module.exports = {
  getExtraNodeInfo,
  postExtraNodeInfo,
};
