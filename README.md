# MyanMyanPay Node SDK

## 📋 Implementation Documentation
This documentation details the steps for integrating the mmpay-node-sdk into your application to securely send callbacks to the MyanMyanPay SDK server and to verify incoming callbacks from MyanMyanPay.

## 💡 Implementation IDEA
```javascript
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const { MMPaySDK } = require('mmpay-node-sdk');
const MMPay = new MMPaySDK({
  appId: "MMxxxxxxx",
  publishableKey: "pk_test_abcxxxxx",
  secretKey: "sk_test_abcxxxxx",
  apiBaseUrl: "https://xxxxxx"
})

app.post("/create-order", async (req, res) => {
  const { amount, items } = req.body;
  const orderId = ''; // GET YOUR ORDER ID FROM YOUR BIZ LOGIC
  const payload = {
      'orderId': orderId,
      amount,
      items,
    }
  let payResponse = await MMPay.pay(payload);
  res.status(200).json(payResponse);
});
// Validating Callback
app.post("/callback", async (req, res) => {
  const incomingSignature = req.headers('x-mmpay-signature');
  const incomingNonce = req.headers('x-mmpay-nonce');
  const { payloadString } = req.body;
  const cbResponse = await MMPay.verifyCb(payloadString, incomingNonce, incomingSignature );
  if (cbResponse) {
    const parsedPayload = JSON.parse(payloadString);
    if (parsedPayload.status === 'SUCCESS') {
      // SUCCESS LOGIC HERE
    }
    if (parsedPayload.status !== 'SUCCESS') {
      // NOT SUCCESS LOGIC HERE
    }
  }
  if (!cbResponse) {
    return res.status(500).json({ error: 'Callback Verification Fail' });
  }
  res.status(200).json({ message: "Success" });
});
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
```

```javascript
// TypeScript OR Esm Module
import { MMPaySDK } from 'mmpay-node-sdk';
```

## ⬇️ 1. Installation
Install the package via npm:
```bash
npm install mmpay-node-sdk --save
```

## ⚙️ 2. Configuration
Before use, you must configure the shared Secret Key. This key is used for HMAC-SHA256 signature calculation and verification and must match the key configured on the MMPay platform.
It is CRITICAL that this key is loaded from an environment variable for security.
```javascript
// Load the SDK and configuration
const { MMPaySDK } = require('mmpay-node-sdk');
const MMPay = new MMPaySdk({
  appId: "MMxxxxxxx",
  publishableKey: "pk_test_abcxxxxx",
  secretKey: "sk_test_abcxxxxx",
  apiBaseUrl: "https://xxxxxx"
})
```

## 💳 3. Make Payment

```javascript
MMPay
  .pay({
    orderId: options.orderId,
    method: options.method,
    vendor: options.vendor,
    amount: options.amount,
    items: options.items,
  }).then((response) => {
    console.log(response)
  }).catch((error) => {
    console.log(error)
  })
```

### Request Body (`payload` structure)

The request body should be a JSON object containing the transaction details. Based on your `IPTrx` interface, the required fields are:

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **`orderId`**     | `string` | **Yes**    | Your generated order ID for the order or system initiating the payment. | `"ORD-3983833"` |
| **`amount`**      | `number` | **Yes**    | The total transaction amount. | `1500.50` |
| **`callbackUrl`** | `string` | No         | The URL where the payment gateway will send transaction status updates. | `"https://yourserver.com/webhook"` |
| **`currency`**    | `string` | **Yes**    | The currency code (e.g., `'MMK'`). | `"MMK"` |
| **`items`**       | `Array<Object>` | No  | List of items included in the purchase. | `[{name: "Hat", amount: 1000, quantity: 1}]` |

#### `items` Object Structure

| Field | Type | Description |
| :--- | :--- | :--- |
| **`name`** | `string` | The name of the item. |
| **`amount`** | `number` | The unit price of the item. |
| **`quantity`** | `number` | The number of units purchased. |

### Response Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| **`201`** | Created | Transaction initiated successfully. Response contains QR code URL/details. |
| **`401`** | Unauthorized | Invalid or missing Publishable Key. |
| **`400`** | Bad Request | Missing required body fields (validated by schema, if implemented). |
| **`503`** | Service Unavailable | Upstream payment API failed or is unreachable. |
| **`500`** | Internal Server Error | General server error during payment initiation. |


### Successful Response (`201`) Example

```json
{
  "orderId": "_trx_0012345",
  "amount": 2800,
  "currency": "MMK",
  "qr": "base64:StringxxxIt_Is_A_QR_Code",
  "url": "https://api-redirect.myanmyanpay.com/redirect/",
  "status": "PENDING"
}
```



## 🚀 4. Requesting On Sandbox Environment
```javascript
MMPay
  .testPay({
    orderId: options.orderId,
    method: options.method,
    vendor: options.vendor,
    amount: options.amount,
    items: options.items,
  }).then((response) => {
    console.log(response)
  }).catch((error) => {
    console.log(error)
  })
```

## 🔐 4. Verifying Incoming Callbacks (Webhooks)
To secure your webhook endpoint that receives callbacks from the MMPay server, use the built-in Express middleware provided by the SDK. This middleware performs the mandatory Signature and Nonce verification.

```javascript
const { MMPaySdk } = require('mmpay-node-sdk');
const MMPay = new MMPaySdk({
  appId: "MMxxxxxxx",
  publishableKey: "pk_test_abcxxxxx",
  secretKey: "sk_test_abcxxxxx",
  apiBaseUrl: "https://xxxxxx"
})

app.post("/callback", async (req, res) => {
  const incomingSignature = req.headers('sppay-x-signature');
  const incomingNonce = req.headers('sppay-x-nonce');
  const { payloadString } = req.body;
  const cbResponse = await MMPay.verifyCb(payloadString, incomingNonce, incomingSignature );
  if (cbResponse) {
    const parsedPayload = JSON.parse(payloadString);
    if (parsedPayload.status === 'SUCCESS') {
      // SUCCESS LOGIC HERE
    }
    if (parsedPayload.status !== 'SUCCESS') {
      // NOT SUCCESS LOGIC HERE
    }
  }
  if (!cbResponse) {
    return res.status(500).json({ error: 'Callback Verification Fail' });
  }
  res.status(200).json({ message: "Success" });
});
```
