const axios = require('axios');

async function postPublicToStorage() {
  const data = {
    publicid: 'mypublicid',
    public: 'anydata',
  };
  const response = await axios.post('https://storage.runonflux.io/v1/public', data);
  console.log(response.data);
}

postPublicToStorage();
