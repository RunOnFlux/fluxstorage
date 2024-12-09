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
    const notificationExist = await notificationService.getNotification(id);
    if (!notificationExist) {
      throw new Error(`notification ${id} does not exist`);
    }
    // no verification ATM
    // eslint-disable-next-line prefer-const
    let verified = true;
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
  let sshKey = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.fluxId) {
        throw new Error('fluxid not specified');
      }
      if (!processedBody.ping) {
        throw new Error('ping not specified');
      }
      if (!processedBody.webhookUrl) {
        throw new Error('web_hook_url not specified');
      }
      if (!processedBody.telegramAlert) {
        throw new Error('telegram_alert not specified');
      }
      if (!processedBody.telegramBotToken) {
        throw new Error('telegram_bot_token not specified');
      }
      if (!processedBody.telegramChatId) {
        throw new Error('telegram_chat_id not specified');
      }
      if (processedBody.sshKey) {
        sshKey = processedBody.sshKey;
      }

      const data = {
        fluxId: processedBody.fluxId,
        ping: processedBody.ping,
        web_hook_url: processedBody.webhookUrl,
        telegram_alert: processedBody.telegramAlert,
        telegram_bot_token: processedBody.telegramBotToken,
        telegram_chat_id: processedBody.telegramChatId,
        sshKey,
      };

      const postResult = await notificationService.postNotification(data);
      const result = serviceHelper.createDataMessage(postResult);
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
