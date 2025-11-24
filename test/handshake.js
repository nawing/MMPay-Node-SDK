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
  const sign = await generateSecureRandomString(6);
  const startTime = performance.now();
  try {
    const payload = {
      handshakeSignature: sign,
    };
    const response = await MMPay.sandboxHandShake(payload);
    const endTime = performance.now();
    const latencyMs = (endTime - startTime).toFixed(3);

    console.log(`\n--- HandShake Successful ---`);
    console.log(`**Network Latency: ${latencyMs} ms**`);
    console.log(`Response:`, response);
    console.log(`------------------------------\n`);


  } catch (error) {
    const endTime = performance.now();
    const latencyMs = (endTime - startTime).toFixed(3);
    console.error(`\n--- HandShake Failed ---`);
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
