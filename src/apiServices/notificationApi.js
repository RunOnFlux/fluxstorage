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
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      const notificationid = null;
      if (!processedBody.fluxid) {
        throw new Error('fluxid not specified');
      }
      if (!processedBody.ping) {
        throw new Error('ping not specified');
      }
      if (!processedBody.web_hook_url) {
        throw new Error('web_hook_url not specified');
      }
      if (!processedBody.telegram_alert) {
        throw new Error('telegram_alert not specified');
      }
      if (!processedBody.telegram_bot_token) {
        throw new Error('telegram_bot_token not specified');
      }
      if (!processedBody.telegram_chat_id) {
        throw new Error('telegram_chat_id not specified');
      }
      if (processedBody.notificationid) {
        notificationid = processedBody.notificationid;
      }

      const data = {
        notificationid: notificationid,
        fluxid: processedBody.fluxid,
        ping: processedBody.ping,
        web_hook_url: processedBody.web_hook_url,
        telegram_alert: processedBody.telegram_alert,
        telegram_bot_token: processedBody.telegram_bot_token,
        telegram_chat_id: processedBody.telegram_chat_id,
      };

      const notificationOK = await notificationService.postNotification(data);
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
