// index.js
// Require the high-resolution performance timer from Node.js built-in module
const { performance } = require('perf_hooks');
const { MMPaySDK } = require("../dist/cjs/index");
const dotenv = require("dotenv");
dotenv.config()

/**
 * generateSecureRandomString
 * @param {number} length The desired length of the final string.
 * @returns {Promise<string>} A Promise that resolves to the random hexadecimal string.
 */
async function generateSecureRandomString(length) {
  const base = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return base.substring(0, length);
}

/**
 * start
 * Executes the payment call and measures network latency.
 */
async function start() {
  const MMPay = MMPaySDK({
    appId: process.env.APP_ID,
    publishableKey: process.env.PRD_PUB_KEY,
    secretKey: process.env.PRD_SEC_KEY,
    apiBaseUrl: process.env.BASEURL
  });
  // const orderId = await generateSecureRandomString(6);
  const orderId = "changeThisOrderIDHere"
  const startTime = performance.now();
  try {
    const payload = {
      orderId: orderId,
      amount: 1500,
      customMessage: "MyanMyanPay Is The Best",
      items: [{ name: "Items", amount: 1500, quantity: 1 }]
    };
    const response = await MMPay.pay(payload);
    const endTime = performance.now();
    const latencyMs = (endTime - startTime).toFixed(3);

    console.log(`\n--- Transaction Request Successful ---`);
    console.log(`Order ID: ${orderId}`);
    console.log(`**Network Latency: ${latencyMs} ms**`);
    console.log(`Response:`, response);
    console.log(`------------------------------\n`);


  } catch (error) {
    const endTime = performance.now();
    const latencyMs = (endTime - startTime).toFixed(3);
    console.error(`\n--- Transaction Request Failed ---`);
    console.error(`Order ID: ${orderId}`);
    console.error(`**Network Latency: ${latencyMs} ms**`);
    console.error(`Error Message: ${error.message}`);
    console.error(`--------------------------\n`);
  }
}

// Execute the main function
start();
