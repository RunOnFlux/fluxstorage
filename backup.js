const cmd = require('node-cmd');
const util = require('util');

const dbName = 'dbname';
const ip = '';
const ipB = '';

const cmdAsync = util.promisify(cmd.run);
// create dump of db

async function makeBackup() {
  try {
    const date = new Date().getTime();
    await cmdAsync('rm -rf dumpOld.tar.gz');
    await cmdAsync(`mongodump --db ${dbName}`);
    await cmdAsync(`tar -czvf fluxStorageMongoDump${date}.tar.gz dump`);
    await cmdAsync('rm -rf dump');
    await cmdAsync(`rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress fluxStorageMongoDump${date}.tar.gz ${ip}:/root/fluxStorageBackupDumps/`);
    await cmdAsync(`rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress fluxStorageMongoDump${date}.tar.gz ${ipB}:/root/fluxStorageBackupDumps/`);
    await cmdAsync(`mv fluxStorageMongoDump${date}.tar.gz dumpOld.tar.gz`);
  } catch (error) {
    console.log(error);
  }
}

makeBackup();
setInterval(async () => {
  makeBackup();
}, 60 * 60 * 1000);
