const { protection, contactsApiKey } = require('config');
const contactsService = require('../services/contactsService');
const serviceHelper = require('../services/serviceHelper');
const log = require('../lib/log');

async function getContacts(req, res) {
  try {
    // TODO magic
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }
    const apiKey = req.headers['x-api-key'];
    const contactsExist = await contactsService.getContacts(id);
    if (!contactsExist) {
      throw new Error(`CONTACTS of ${id} does not exist`);
    }
    let verified = !protection;
    if (apiKey === contactsApiKey) {
      verified = true;
    }
    if (verified) {
      res.json(contactsExist);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

function postContacts(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.contacts) {
        throw new Error('No contacts specified');
      }
      if (!processedBody.contactsid) {
        throw new Error('No contactsid specified');
      }

      const data = {
        contacts: processedBody.contacts,
        contactsid: processedBody.contactsid,
      };

      const contactsOK = await contactsService.postContacts(data);
      if (!contactsOK) {
        throw new Error('Failed to update contacts data');
      }
      const result = serviceHelper.createDataMessage(contactsOK);
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

module.exports = {
  getContacts,
  postContacts,
};
