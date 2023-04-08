const util = require('util');
const nodecmd = require('node-cmd');
const cmdAsync = util.promisify(nodecmd.run);

async function genPrivateKey() {
  const command = '(mkfifo key key.pub && ((cat key ; rm key && rm key.pub)&) && ((rm key.pub)&) && (echo y | ssh-keygen -m PEM -t rsa -b 2048 -q -N "" -f key > /dev/null)) | sed \'s/$/\\n/\' | tr -d \'\n\'';
  const privateKey = await cmdAsync(command);
  return privateKey;
}

async function generatePrivateKeys(number) {
  let string = '';
  for (let i = 0; i < number; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const privateKey = await genPrivateKey();
    string += privateKey;
    if (i !== number - 1) {
      string += ',';
    }
  }
  return string;
}

module.exports = {
  generatePrivateKeys,
};
