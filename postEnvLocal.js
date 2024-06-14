const envService = require('./src/services/envService');

const e = 'testenv';
const p = ['a=b'];

async function postEnv() {
  const data = {
    envid: e,
    env: p,
  };
  const env = await envService.postEnv(data, true);
  console.log(env);
}

postEnv();
