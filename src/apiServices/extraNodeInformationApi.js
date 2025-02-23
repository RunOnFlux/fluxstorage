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
    const notificationData = await extraNodeInformation.getDataFromWords(id);
    if (!notificationData) {
      throw new Error('Extra Node Info does not exist for words identifier');
    }
    const result = serviceHelper.createDataMessage(notificationData);
    res.json(result);
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

      const {
        adminId = null,
        words = null,
        discordUserId = null,
        discordWebhookUrl = null,
        telegramAlert = null,
        telegramBotToken = null,
        telegramChatId = null,
        emailAddress = null,
        genericWebhookUrl = null,
        sshPubKey = null,
        blockedPorts = null,
        blockedRepositories = null,
      } = processedBody;

      if (!adminId) {
        throw new Error('No Flux/SSP ID not specified');
      }
      if (!words) {
        throw new Error('Words identifier is mandatory');
      }

      // eslint-disable-next-line global-require
      const nodeApi = require('./nodeApi');
      const nodeInfoCache = nodeApi.getNodeInfoCache();
      if (!nodeInfoCache.has(processedBody.words)) {
        throw new Error('Words identifier not present on node information API');
      }

      // only store the data that has been POSTed
      const data = {
        adminId,
        words,
        ...(discordUserId && { discordUserId }),
        ...(discordWebhookUrl && { discordWebhookUrl }),
        ...(telegramAlert && { telegramAlert }),
        ...(telegramBotToken && { telegramBotToken }),
        ...(telegramChatId && { telegramChatId }),
        ...(emailAddress && { emailAddress }),
        ...(sshPubKey && { sshPubKey }),
        ...(blockedPorts && { blockedPorts }),
        ...(blockedRepositories && { blockedRepositories }),
        ...(genericWebhookUrl && { genericWebhookUrl }),
      }

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
