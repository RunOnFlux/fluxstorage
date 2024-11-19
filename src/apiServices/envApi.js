const { protection } = require('config');
const { LRUCache } = require('lru-cache');
const axios = require('axios');
const envService = require('../services/envService');
const serviceHelper = require('../services/serviceHelper');
const presearchService = require('../services/presearchService');
const log = require('../lib/log');

const presearchKeysCacheInfo = {
  max: 100,
  ttl: 1000 * 60 * 60 * 2, // 2 hours
  maxAge: 1000 * 60 * 60 * 2, // 2 hours
};

const presearchKeysCache = new LRUCache(presearchKeysCacheInfo);

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

async function getGlobalAppSpec(appname) {
  try {
    const url = `https://api.runonflux.io/apps/appspecifications/${appname}`;
    const response = await axios.get(url);
    if (response.data.status === 'success') {
      return response.data.data;
    }
    return null;
  } catch (error) {
    log.error(error);
    return null;
  }
}

/**
 * To delay by a number of milliseconds.
 * @param {number} ms Number of milliseconds.
 * @returns {Promise} Promise object.
 */
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// function created to get presearch private keys
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
      let instances = 3;
      let envExist = null;
      let keysGenerated = '';
      const adjEnv = [];
      const appSpecs = getGlobalAppSpec(appName);
      if (appSpecs) {
        instances = appSpecs.instances || 3;
      }
      if (presearchKeysCache.has(appName)) {
        // if appName is on cache means it was executed already once in the last hour, the first execution is resaponsable for fill up the DB and update cache
        let keys = presearchKeysCache.get(appName);
        if (keys.split(',').length < instances) {
          await delay(10 * 1000); // 10 seconds delay should give enought time to get several keys and timeout on fluxOs is 20 seconds
          keys = presearchKeysCache.get(appName);
          if (keys.split(',').length === 0) {
            // if no key exist we delete it from cache so next call we generate again and store on DB
            presearchKeysCache.delete(appName);
            throw new Error('NO KEY FOUND ON CACHE');
          }
        }
        log.info(`Found in cache ${keys.split(',').length} pks for the presearch app ${appName}`);
        adjEnv.push(`PRIVATE_KEY=${keys}`);
      } else {
        presearchKeysCache.set(appName, ''); // we put it on cache so any other call that is done right after gets the info from cache
        envExist = await envService.getEnv(appName).catch(() => log.info(`Preserach ${appName} creation`));
        if (!envExist) {
          log.info(`Presearch app ${appName} not found in storage`);
          // does not exist in our DB.
          // create proper env for presearch - private key. appName is the key. Then store it in db
          // todo there might be env with 5 nodes, before we were generating just 5 keys
          let run = 0;
          while (keysGenerated.split(',').length <= instances && run < 30) {
            run += 1;
            // eslint-disable-next-line no-await-in-loop
            const keys = await presearchService.generatePrivateKeys(4); // generate 4 keys each time until we have more keys than the instances required
            if (keys.includes(',,')) {
              throw new Error('ERROR PRESEARCH GENERATION');
            }
            if (keysGenerated.length > 1) {
              keysGenerated += ',';
            }
            keysGenerated += keys;
            presearchKeysCache.set(appName, keysGenerated);
            keysGenerated = presearchKeysCache.get(appName); // we are doing this in case it's being called more than once at same time
          }
          presearchKeysCache.set(appName, keysGenerated);
          log.info(`Generated ${keysGenerated.split(',').length} pks for the presearch app ${appName}`);
          // we only store on db once all keys are generated
          const data = {
            env: [`PRIVATE_KEY=${keysGenerated}`],
            envid: appName,
          };
          await envService.postEnv(data).catch((error) => {
            log.error(error);
            log.error('Posting ENV fail, proceeding');
          });
          // load it again
          envExist = await envService.getEnv(appName);
          if (!envExist) {
            // something went wrong
            throw new Error(`Failed to obtain ENV of ${id} ${appName}.`);
          }
        } else if (envExist[0].split(',').length < instances) {
          log.info(`Presearch app ${appName} found in storage with ${envExist[0].split(',').length} pks but instances rented are ${instances}`);
          // so the app was for example updated and it's now running more instances, let's update the DB
          // eslint-disable-next-line prefer-destructuring
          keysGenerated = envExist[0].replace('PRIVATE_KEY=', '');
          let run = 0;
          while (keysGenerated.split(',').length <= instances && run < 30) {
            run += 1;
            // eslint-disable-next-line no-await-in-loop
            const keys = await presearchService.generatePrivateKeys(4); // generate 4 keys each time until we have more keys than the instances required
            if (keys.includes(',,')) {
              throw new Error('ERROR PRESEARCH GENERATION');
            }
            if (keysGenerated.length > 1) {
              keysGenerated += ',';
            }
            keysGenerated += keys;
            presearchKeysCache.set(appName, keysGenerated);
            keysGenerated = presearchKeysCache.get(appName); // we are doing this in case it's being called more than once at same time
          }
          presearchKeysCache.set(appName, keysGenerated);
          log.info(`Generated missing pks for the presearch app ${appName}, total ${keysGenerated.split(',').length}`);
          // we only store on db once all keys are generated
          const data = {
            env: [`PRIVATE_KEY=${keysGenerated}`],
            envid: appName,
          };
          await envService.postEnv(data).catch((error) => {
            log.error(error);
            log.error('Posting ENV fail, proceeding');
          });
          // load it again
          envExist = await envService.getEnv(appName);
          if (!envExist) {
            // something went wrong
            throw new Error(`Failed to obtain ENV of ${id} ${appName}.`);
          }
        } else {
          keysGenerated = envExist[0].replace('PRIVATE_KEY=', '');
          presearchKeysCache.set(appName, keysGenerated);
        }
        adjEnv.push(envExist[0]);
      }
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
