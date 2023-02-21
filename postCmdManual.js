const axios = require('axios');

async function postCmdToStorage() {
  const data = {
    cmdid: 'mytestidb',
    cmd: ['ls', '-la'],
  };
  const response = await axios.post('https://storage.runonflux.io/v1/cmd', data);
  console.log(response.data);
}

postCmdToStorage();
