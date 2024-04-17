const ping = require("ping");
require("dotenv").config();
const address = process.env.PING_ADDRESS;

async function promisePing() {
  return new Promise((resolve, reject) => {
    ping.sys.probe(address, (isAlive) => {
      resolve(isAlive);
    });
  });
}

// Sử dụng hàm checkPing trong một hàm async
async function checkPing() {
  const isOk = await promisePing();
  
  return isOk;
}

module.exports = checkPing;
