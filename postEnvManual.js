const axios = require('axios');

async function postEnvToStore() {
  const data = {
    envid: 'mytestid',
    env: ['testEnv=Hello', 'testEnv2=World'],
  };
  const response = await axios.post('https://store.runonflux.io/v1/env', data);
  console.log(response.data);
}

postEnvToStore();
