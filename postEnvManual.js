const axios = require('axios');

async function postEnvToStorage() {
  const data = {
    envid: 'mytestidb',
    env: ['testEnv=Hello', 'testEnv2=World'],
  };
  const response = await axios.post('https://storage.runonflux.io/v1/env', data);
  console.log(response.data);
}

postEnvToStorage();
