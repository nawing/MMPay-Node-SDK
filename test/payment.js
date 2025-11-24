// index.js
// Require the high-resolution performance timer from Node.js built-in module
const { performance } = require('perf_hooks');
const { MMPaySDK } = require("../dist/cjs/index");

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
    appId: "MMxxxxxxx",
    publishableKey: "pk_test_abcxxxxx",
    secretKey: "sk_test_abcxxxxx",
    apiBaseUrl: "https://xxxxxx"
  });
  const orderId = await generateSecureRandomString(6);
  const startTime = performance.now();
  try {
    const payload = {
      orderId: orderId,
      amount: 30000,
      currency: "MMK",
      items: [{ name: "Items", amount: 3000, quantity: 10 }],
      callbackUrl: "https://"  // This is already set by default
    };
    const response = await MMPay.testPay(payload);
    const endTime = performance.now();
    const latencyMs = (endTime - startTime).toFixed(3);

    console.log(`\n--- Transaction Successful ---`);
    console.log(`Order ID: ${orderId}`);
    console.log(`**Network Latency: ${latencyMs} ms**`);
    console.log(`Response:`, response);
    console.log(`------------------------------\n`);


  } catch (error) {
    const endTime = performance.now();
    const latencyMs = (endTime - startTime).toFixed(3);
    console.error(`\n--- Transaction Failed ---`);
    console.error(`Order ID: ${orderId}`);
    console.error(`**Network Latency: ${latencyMs} ms**`);

    // Check if the error is a standard Error object for message access
    if (error && typeof error.message !== 'undefined') {
      console.error(`Error Message: ${error.message}`);
    } else {
      console.error(`Full Error Object:`, error);
    }
    console.error(`--------------------------\n`);
  }
}

// Execute the main function
start();
