// eslint-disable-next-line no-unused-vars
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
    const notificationExist = await notificationService.getNotificationFromWords(id);
    if (!notificationExist) {
      throw new Error('Notification does not exist for words identifier');
    }
    res.json(notificationExist);
  } catch (error) {
    log.error(error);
    const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
    res.json(errMessage);
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
      if (!processedBody.adminId) {
        throw new Error('No Flux/SSP ID not specified');
      }
      if (!processedBody.ping && !processedBody.webhookUrl && !processedBody.telegramAlert
         && !processedBody.telegramBotToken && !processedBody.telegramChatId && !processedBody.sshKey) {
        throw new Error('No information specified for the notifications');
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
        ping: processedBody.ping,
        web_hook_url: processedBody.webhookUrl,
        telegram_alert: processedBody.telegramAlert,
        telegram_bot_token: processedBody.telegramBotToken,
        telegram_chat_id: processedBody.telegramChatId,
        email: processedBody.email,
        sshKey: processedBody.sshKey,
        blockedPorts: processedBody.blockedPorts,
        blockedRepos: processedBody.blockedRepos,
        words: processedBody.words,
      };

      await notificationService.postNotification(data);
      const result = serviceHelper.createSuccessMessage('Notifications settings inserted/updated');
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
