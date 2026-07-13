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
    if (!verified && apiKey === contactsApiKey) {
      verified = true;
    }
    // Additionally allow reads authenticated by a Flux node signature (same scheme as env/cmd),
    // so a FluxOS node can resolve F_S_CONTACTS on behalf of the app owner. The shared api-key
    // path above is kept for existing callers (e.g. fluxmonitor).
    if (!verified) {
      const signature = req.headers['flux-signature'];
      const messageToVerify = req.headers['flux-message'];
      const xForwardedFor = req.headers['x-forwarded-for'];
      const ip = req.headers['cf-connecting-ip'] || req.headers['x-real-ip']
        || (xForwardedFor ? xForwardedFor.split(',')[0] : undefined);
      if (signature && messageToVerify && ip) {
        const fluxNodes = await serviceHelper.axiosGet('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
        fluxNodes.data.data.forEach((node) => {
          if (node.ip.split(':')[0] === ip && serviceHelper.verifyMessage(messageToVerify, node.pubkey, signature)) {
            verified = true;
          }
        });
      }
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
