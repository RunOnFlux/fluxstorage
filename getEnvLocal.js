const envService = require('./src/services/envService');

const e = '';

async function getEnv() {
  const env = await envService.getEnv(e);
  console.log(env);
}

getEnv();
