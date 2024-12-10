// eslint-disable-next-line no-unused-vars
const { protection } = require('config');
const notificationService = require('../services/notificationService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getNotificationInfo(req, res) {
  try {
    let { fluxId } = req.params;
    fluxId = fluxId || req.query.fluxId;
    if (!fluxId) {
      res.sendStatus(400);
      return;
    }
    const signature = req.headers['flux-signature'];
    const messageToVerify = req.headers['flux-message'];
    const nodeVerified = serviceHelper.verifyMessage(messageToVerify, fluxId, signature);
    if (!nodeVerified) {
      throw new Error('Message signature failed for the Flux/SSP ID');
    }
    const notificationExist = await notificationService.getNotification(fluxId);
    if (!notificationExist) {
      throw new Error('Notifications does not exist for the Flux/SSP ID');
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
      const signature = req.headers['flux-signature'];
      const messageToVerify = req.headers['flux-message'];
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.fluxId) {
        throw new Error('No Flux/SSP ID not specified');
      }
      const nodeVerified = serviceHelper.verifyMessage(messageToVerify, processedBody.fluxId, signature);
      if (!nodeVerified) {
        throw new Error('Message signature failed for the Flux/SSP ID');
      }
      if (!processedBody.ping && !processedBody.webhookUrl && !processedBody.telegramAlert
         && !processedBody.telegramBotToken && !processedBody.telegramChatId && !processedBody.sshKey) {
        throw new Error('No information specified for the notifications');
      }

      const data = {
        fluxId: processedBody.fluxId,
        ping: processedBody.ping,
        web_hook_url: processedBody.webhookUrl,
        telegram_alert: processedBody.telegramAlert,
        telegram_bot_token: processedBody.telegramBotToken,
        telegram_chat_id: processedBody.telegramChatId,
        sshKey: processedBody.sshKey,
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
