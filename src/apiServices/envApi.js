const { protection } = require('config');
const envService = require('../services/envService');
const serviceHelper = require('../services/serviceHelper');
const presearchService = require('../services/presearchService');
const log = require('../lib/log');

async function getEnv(req, res) {
  try {
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }
    // get IP
    // get deterministic node list todo daemon/viewdeterministcizelnodelist, use cache and constant refreshing of it
    // from ip get nodes that are fine, array of pub keys, do verification
    const signature = req.headers['flux-signature'];
    const messageToVerify = req.headers['flux-message'];
    const ip = req.headers['x-forwarded-for'];
    const envExist = await envService.getEnv(id);
    if (!envExist) {
      throw new Error(`ENV of ${id} does not exist`);
    }
    let verified = !protection;
    if (!verified) {
      const fluxNodes = await serviceHelper.axiosGet('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
      const pubKeys = [];
      fluxNodes.data.data.forEach((node) => {
        if (node.ip.split(':')[0] === ip) {
          pubKeys.push(node.pubkey);
        }
      });
      pubKeys.forEach((pubKey) => {
        const nodeVerified = serviceHelper.verifyMessage(messageToVerify, pubKey, signature);
        if (nodeVerified) {
          verified = true;
        }
      });
    }
    if (verified) {
      res.json(envExist);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

function postEnv(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      const processedBody = serviceHelper.ensureObject(body);
      if (!processedBody.env) {
        throw new Error('No env specified');
      }
      if (!processedBody.envid) {
        throw new Error('No envid specified');
      }

      const data = {
        env: processedBody.env,
        envid: processedBody.envid,
      };

      const envOK = await envService.postEnv(data);
      if (!envOK) {
        throw new Error('Failed to update env data');
      }
      const result = serviceHelper.createDataMessage(envOK);
      res.json(result);
    } catch (error) {
      log.error(error);
      const errMessage = serviceHelper.createErrorMessage(error.message, error.name, error.code);
      res.json(errMessage);
    }
  });
}

async function getEnvV2(req, res) {
  try {
    let { id } = req.params;
    id = id || req.query.id;
    if (!id) {
      res.sendStatus(400);
      return;
    }
    // get IP
    // get deterministic node list todo daemon/viewdeterministcizelnodelist, use cache and constant refreshing of it
    // from ip get nodes that are fine, array of pub keys, do verification
    const signature = req.headers['flux-signature'];
    const messageToVerify = req.headers['flux-message'];
    const ip = req.headers['x-forwarded-for'];
    const appName = req.headers['flux-app'];
    if (!appName) {
      throw new Error('Flux App header not supplied');
    }
    if (id !== 'presearch') {
      throw new Error(`ENV of ${id} not recognized`);
    }
    let verified = !protection;
    if (!verified) {
      const fluxNodes = await serviceHelper.axiosGet('https://api.runonflux.io/daemon/viewdeterministiczelnodelist');
      const pubKeys = [];
      fluxNodes.data.data.forEach((node) => {
        if (node.ip.split(':')[0] === ip) {
          pubKeys.push(node.pubkey);
        }
      });
      pubKeys.forEach((pubKey) => {
        const nodeVerified = serviceHelper.verifyMessage(messageToVerify, pubKey, signature);
        if (nodeVerified) {
          verified = true;
        }
      });
    }
    if (verified) {
      let envExist = await envService.getEnv(appName).catch(() => log.info(`Preserach ${appName} creation`));
      if (!envExist) {
        // does not exist in our DB.
        if (id === 'presearch') {
          // create proper env for presearch - private key. appName is the key. Then store it in db
          // todo there might be env with 5 nodes, before we were generating just 5 keys
          const keys = await presearchService.generatePrivateKeys(5); // generate 5 presearch keys that are comman separated
          const data = {
            env: [`PRIVATE_KEY=${keys}`],
            envid: appName,
          };
          await envService.postEnv(data);
          // load it again
          envExist = await envService.getEnv(appName);
          if (!envExist) {
            // something went wrong
            throw new Error(`Failed to obtain ENV of ${id} ${appName}.`);
          }
        }
      }
      const adjEnv = [];
      envExist.forEach((env) => {
        // eslint-disable-next-line no-param-reassign
        const newEnv = env.replace(/KEY-----/g, 'KEY-----\n');
        // eslint-disable-next-line no-param-reassign
        const newEnvB = newEnv.replace(/-----END/g, '\n-----END');
        adjEnv.push(newEnvB);
      });
      res.json(adjEnv);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    log.error(error);
    res.sendStatus(404);
  }
}

module.exports = {
  getEnv,
  getEnvV2,
  postEnv,
};
