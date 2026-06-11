## MyanMyanPay Node SDK

## 📋 Implementation Documentation
This documentation details the steps for integrating the mmpay-node-sdk into your application to securely send callbacks to the MyanMyanPay SDK server and to verify incoming callbacks from MyanMyanPay.

```typescript
// TypeScript OR Esm Module
import { MMPaySDK } from 'mmpay-node-sdk';
```

## ⬇️ 1. Installation
Install the package via npm:
```bash
npm install mmpay-node-sdk --save
```

---


## ⚙️ 2. Configuration
Before use, you must configure the shared Secret Key. This key is used for HMAC-SHA256 signature calculation and verification and must match the key configured on the MMPay platform.
It is CRITICAL that this key is loaded from an environment variable for security.


**Implementation**
```javascript
// Load the SDK and configuration
const { MMPaySDK } = require('mmpay-node-sdk');

const MMPay = new MMPaySdk({
  appId: "MMxxxxxxx",
  publishableKey: "pk_live_abcxxxxx",
  secretKey: "sk_live_abcxxxxx",
  apiBaseUrl: "https://xxxxxx"
})
```

---


## 💳 3. Make Payment

**Method Signature**
```typescript
pay(payload: PaymentRequest): Promise<PaymentResponse>
```

**Implementation**
```javascript
const amount = 1000;
const orderId = 'ORD-199399933';
const customMessage = 'myanmyanpay_is_the_best';
const callbackUrl = 'https://mycallback/webhooks/callback'

try {
    const { qr } = await MMPay.pay({ amount, orderId, customMessage, callbackUrl });
    console.log(qr) // this is your QR String [EMVCo String]
} catch (error) {
    console.log(error)
}
```


**Request Body** (`payload` structure)
The request body should be a JSON object containing the transaction details.

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **`orderId`**         | `string` | **Yes**    | Your generated order ID for the order or system initiating the payment. | `"ORD-3983833"` |
| **`amount`**          | `number` | **Yes**    | The total transaction amount. | `1500.50` |
| **`callbackUrl`**     | `string` | No         | The URL where the payment gateway will send transaction status updates. | `"https://yourserver.com/webhook"` |
| **`currency`**        | `string` | No         | The currency code (e.g., `'MMK'`). | `"MMK"` |
| **`customMessage`**   | `string` | No         | Your Customization String |
| **`items`**           | `Array<Object>` | No  | List of items included in the purchase. | `[{name: "Hat", amount: 1000, quantity: 1}]` |

**Item Object**


| Field | Type | Description |
| :--- | :--- | :--- |
| **`name`** | `string` | The name of the item. |
| **`amount`** | `number` | The unit price of the item. |
| **`quantity`** | `number` | The number of units purchased. |

**Response Body** Code (`201`)
The response body should be a JSON object containing the following information.

```json
{
  "orderId": "_trx_0012345",
  "status": "PENDING",
  "vendorQrRefId": "39233043003345",
  "transactionRefId": "39233043003345", // This is deprecated - transactionRefId will show only after payment is confirmed
  "amount": 2800,
  "currency": "MMK",
  "qr": "EMVco MMQR String => You_have_to_embed_as_qr_image_yourself"
}
```

---

## 🚀 4. Get Payment Information

**Method Signature**
```typescript
get({orderId: string}): Promise<PayGetResponse>
```

**Implementation**
```javascript
const response = await MMPay.get({orderId: 'ORD-111111111'});
console.log(response)
```

**Request Body** (`payload` structure)
The request body should be a JSON object containing the transaction details.

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **`orderId`**         | `string` | **Yes**    | Your generated order ID for the order or system initiating the payment. | `"ORD-3983833"` |

**Response Body** Code (`200`)
The response body should be a JSON object containing the following information.

```json
{
  "orderId": "ORD-111111111",
  "appId": "MMP3883483",
  "amount": 1000,
  "vendor": "KBZPay",
  "method": "QR",
  "customMessage": "",
  "callbackUrl": "",
  "callbackUrlAt": "JSDateObject",
  "callbackUrlStatus": "SUCCESS",
  "status": "SUCCESS", //  'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED';
  "disbursementId": "289348734939",
  "disStatus": "SUCCESS",
  "condition": "TOUCHED", // TOUCHED | 'PRISTINE' | 'DIRTY' | 'EXPIRED'
  "createdAt": "JSDateObject",
  "transactionRefId": "939583046594",
  "vendorQrRefId": "48309449034",
  "qr": "EMVCo QR String::MMQR Standard",
}
```

---

## 🚀 5. Cancel Payment

```typescript
cancel({orderId: string}): Promise<PayCancelResponse>
```

**Implementation**
```javascript
const response = await MMPay.cancel({orderId: 'ORD-111111111')};
console.log(response)
```

**Request Body** (`payload` structure)
The request body should be a JSON object containing the transaction details.

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **`orderId`**         | `string` | **Yes**    | Your generated order ID for the order or system initiating the payment. | `"ORD-3983833"` |

**Response Body** Code (`200`)
The response body should be a JSON object containing the following information.

```json
{
  "amount": 1000,
  "orderId": "ORD-111111111",
  "status": "CANCELLED",
  "vendorQrRefId": "289348734939",
}
```

---

## 🔐 6. Handling Webhooks
To secure your webhook endpoint that receives callbacks from the MMPay server, use this event listener to handle the events.
The **listen** performs the mandatory Signature and Nonce verification and emits events

**Incoming Headers**

| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **Content-Type** | `string` | Yes | 'application/json' |
| **X-Mmpay-Signature** | `string` | Yes | '34834890vfgh9hnf94irfg_48932i4rt90349849' |
| **X-Mmpay-Nonce** | `string` | Yes | '94843943949349' |

**Incoming Body**

| Field Name    | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **orderId**           | `string` | Yes | Unique identifier for the specific order. |
| **amount**            | `number` | Yes | The transaction amount. |
| **currency**          | `string` | Yes | The 3-letter currency code (e.g., MMK, USD). |
| **vendor**            | `string` | Yes | Identifier for the vendor initiating the request. |
| **method**            | `'QR', 'PIN', 'PWA', 'CARD'`  | Yes | Identifier for the method. |
| **status**            | `'PENDING','SUCCESS','FAILED','REFUNDED', 'EXPIRED', 'CANCELLED'` | Yes | Current status of the transaction. |
| **condition**         | `'PRESTINE', 'TOUCHED', 'EXPIRED', 'DIRTY'`  | Yes | Used QR Code scan again or not |
| **transactionRefId**  | `string` | Yes | The reference ID generated by the payment provider after success payment |
| **vendorQrRefId**     | `string` | Yes | The MMQR reference ID generated by the payment provider. |
| **callbackUrl**       | `string` | No | Optional URL to receive webhooks or updates. |
| **customMessage**     | `string` | No | User provided custom message |


**Implementation With Express JS**

```javascript

interface MMPayIncomingCallbackScheme {
  orderId: string;
  amount: number;
  method: 'QR' | 'PIN' | 'PWA' | 'CARD';
  currency: 'MMK';
  vendor: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED';
  condition: 'PRISTINE' | 'TOUCHED' | 'EXPIRED';
  transactionRefId: string;
  callbackUrl?: string;
  customMessage?: string;
}

const MMPay = new MMPaySDK({
  appId: "MMxxxxxxx",
  publishableKey: "pk_live_abcxxxxx",
  secretKey: "sk_live_abcxxxxx",
  apiBaseUrl: "https://xxxxxx"
});

MMPay
  .onTxCreate((tx: MMPayIncomingCallbackScheme) => console.log('Created:', tx.orderId))
  .onTxSuccess((tx: MMPayIncomingCallbackScheme) => console.log('Success:', tx.orderId))
  .onTxFail((tx: MMPayIncomingCallbackScheme) => console.log('Failed:', tx.orderId))
  .onTxRefund((tx: MMPayIncomingCallbackScheme) => console.log('Refunded:', tx.orderId))
  .onTxCancel((tx: MMPayIncomingCallbackScheme) => console.log('Cancelled:', tx.orderId))
  .onTxExpire((tx: MMPayIncomingCallbackScheme) => console.log('Expired:', tx.orderId))
  .onHeartbeat((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId)) // This means already send event coming in again
  .on('error', (err) => console.error(err));

app.post('/webhooks/mmpay-callback', async (req: Request, res: Response) => {
  const payload = JSON.stringify(req.body);
  const nonce = req.headers['x-mmpay-nonce'] as string;
  const signature = req.headers['x-mmpay-signature'] as string;
  await MMPay.listen(payload, nonce, signature);
  res.json({ received: true }); // please respond with 200 status
});

```

---

## 7. Error Codes

 Api Key Layer Authentication [SERVER SDK]
| Code | Description |
| :--- | :--- |
| **`KA0001`** | Bearer Token Not Included In Your Request |
| **`KA0002`** | API Key Not 'LIVE' |
| **`KA0003`** | Signature mismatch |
| **`KA0004`** | Internal Server Error ( Talk to our support immediately fot this ) |
| **`KA0005`** | IP Not whitelisted |
| **`429`** | Ratelimit hit only 1000 request / minute allowed |


 JWT Layer Authentication [SERVER SDK]
| Code | Description |
| :--- | :--- |
| **`BA001`** | `Btoken` is nonce one time token is not included |
| **`BA002`** | `Btoken` one time nonce mismatch |
| **`BA000`** | Internal Server Error ( Talk to our support immediately fot this ) |
| **`429`**   | Ratelimit hit only 1000 request / minute allowed |


### Response Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| **`201`** | Created | Transaction initiated successfully. Response contains QR code URL/details. |
| **`401`** | Unauthorized | Invalid or missing Publishable Key. |
| **`400`** | Bad Request | Missing required body fields (validated by schema, if implemented). |
| **`503`** | Service Unavailable | Upstream payment API failed or is unreachable. |
| **`500`** | Internal Server Error | General server error during payment initiation. |

---


### Implementing with Browser Plugin `showPaymentModal()`

Verifying Source of Truth

This is critical for those, using browser plugins with no source of truth. Cancel your order instantly if the amount is not the same as your source of truth.

```javascript
MMPay
  .onTxCreate((tx: MMPayIncomingCallbackScheme) => {
    const { amount } = await DB.getOrderId(tx.orderId)
    if (tx.amount !== amount ) {
      await MMPay.cancel(tx.orderId)
    }
  })
```


## 💡 Putting All Together

Express JS Framwork Usage Full Example

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

interface MMPayIncomingCallbackScheme {
  orderId: string;
  amount: number;
  method: 'QR' | 'PIN' | 'PWA' | 'CARD';
  currency: 'MMK';
  vendor: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED';
  condition: 'PRISTINE' | 'TOUCHED';
  transactionRefId: string;
  callbackUrl?: string;
  customMessage?: string;
}

const { MMPaySDK } = require('mmpay-node-sdk');

// Sandbox Environment

const MMPaySandbox = new MMPaySDK({
  appId: "MMxxxxxxx",
  publishableKey: "pk_test_abcxxxxx",
  secretKey: "sk_test_abcxxxxx",
  apiBaseUrl: "https://xxxxxx"
});

MMPaySandbox
  .onTxCreate((tx: MMPayIncomingCallbackScheme) => console.log('Created:', tx.orderId))
  .onTxSuccess((tx: MMPayIncomingCallbackScheme) => console.log('Success:', tx.orderId))
  .onTxFail((tx: MMPayIncomingCallbackScheme) => console.log('Failed:', tx.orderId))
  .onTxRefund((tx: MMPayIncomingCallbackScheme) => console.log('Refunded:', tx.orderId))
  .onTxCancel((tx: MMPayIncomingCallbackScheme) => console.log('Cancelled:', tx.orderId))
  .onTxExpire((tx: MMPayIncomingCallbackScheme) => console.log('Expired:', tx.orderId))
  .onHeartbeat((tx: MMPayIncomingCallbackScheme) => console.log('Heartbeat:', tx.orderId))
  .on('error', (err) => console.error(err));

// Create Order
app.post("/create-order-sandbox", async (req: Request, res: Response) => {
  const { amount, items } = req.body;
  const orderId = ''; // GET YOUR ORDER ID FROM YOUR BIZ LOGIC
  const payload = {
    orderId: 'ORD-199399933',
    amount: 5000,
    items: [{ name: "Pencil", amount: 5000, quantity: 1 }],
    customMessage: '', // max 150 char  string
    callbackUrl: 'https://abcdef/callback' // [optional] overrides default callbackURL
  }
  let payResponse = await MMPaySandbox.pay(payload);
  res.status(200).json(payResponse);
});

// Listening Callback
app.post('/webhooks/mmpay-callback-sandbox', async (req: Request, res: Response) => {
  const payload = JSON.stringify(req.body);
  const nonce = req.headers['x-mmpay-nonce'] as string;
  const signature = req.headers['x-mmpay-signature'] as string;
  await MMPaySandbox.listen(payload, nonce, signature);
  res.json({ received: true }); // please respond with 200 status
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

```


## License

MIT
