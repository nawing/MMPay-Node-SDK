# MyanMyanPay Node SDK

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

let options = {
  orderId: 'ORD-199399933',
  amount: 5000,
  items: [
    { name: "Pencil", amount: 5000, quantity: 1 }
  ]
}
// sync
MMPay.pay(options)
    .then((response) => {
        console.log(response)
    }).catch((error) => {
        console.log(error)
    })

// async
try {
    await MMPay.pay(options)
} catch (error) {
    console.log(error)
}
```

### Request Body (`payload` structure)

The request body should be a JSON object containing the transaction details. Based on your `IPTrx` interface, the required fields are:

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| **`orderId`**     | `string` | **Yes**    | Your generated order ID for the order or system initiating the payment. | `"ORD-3983833"` |
| **`amount`**      | `number` | **Yes**    | The total transaction amount. | `1500.50` |
| **`callbackUrl`** | `string` | No         | The URL where the payment gateway will send transaction status updates. | `"https://yourserver.com/webhook"` |
| **`currency`**    | `string` | No         | The currency code (e.g., `'MMK'`). | `"MMK"` |
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
  "status": "PENDING"
}
```



## 🚀 4. Requesting On Sandbox Environment
```javascript

let options = {
  orderId: 'ORD-199399933',
  amount: 5000,
  items: [
    { name: "Pencil", amount: 5000, quantity: 1 }
  ]
}
// sync
MMPay.sandboxPay(options)
    .then((response) => {
        console.log(response)
    }).catch((error) => {
        console.log(error)
    })

// async
try {
    await MMPay.sandboxPay(options)
} catch (error) {
    console.log(error)
}
```

## 🔐 4. Verifying Incoming Callbacks (Webhooks)
To secure your webhook endpoint that receives callbacks from the MMPay server, use the built-in Express middleware provided by the SDK. This middleware performs the mandatory Signature and Nonce verification.

```javascript

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



## 💡 Implementation IDEA


---

We Love Typescript, so here are our favourite framework plugins implementations

=== "Express Plugin Usage"

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


=== "FastifyJS Plugin (Fast)"

    ```typescript
    //usage example

    import {mmpayPlugin} from './plugins/mmpayPlugin';

    const fastify: FastifyInstance = Fastify({ logger: true });

    await fastify.register(mmpayPlugin, {
        appId: process.env.MMPAY_APP_ID!,
        uatPubKey: process.env.MMPAY_UAT_PUBKEY!,
        uatSecKey: process.env.MMPAY_UAT_SECKEY!,
        prdPubKey: process.env.MMPAY_PRD_PUBKEY!,
        prdSecKey: process.env.MMPAY_PRD_SECKEY!,
    });

    fastify.post('/create-order', async (request: FastifyRequest, reply: FastifyReply) => {
        const { amount, orderId, items } = body;
        const payResponse = await fastify.mmpay.createProductionPayment({ amount, orderId, items });
    })

    fastify.post('/webhooks/mmpay', async (request: FastifyRequest<{Body: any}>, reply: FastifyReply) => {
        const incomingSignature = request.headers['x-mmpay-signature'] as string;
        const incomingNonce = request.headers['x-mmpay-nonce'] as string;
        const payload = request.body as MMPayIncomingCallbackScheme;
        const payloadString = JSON.stringify(payload);

        const cbResult = await fastify.mmpay.verifyProductionCallBack({
            payloadString: payloadString,
            nonce: incomingNonce,
            signature: incomingSignature
        });

        if (cbResult) {
            if (payload.status === "SUCCESS") {

            }
            if (payload.status === 'FAILED') {


            };
            reply.code(200).send({message: "Callback Processed Successfully"});
        }

        if (!cbResult) {
            reply.code(200).send({message: "Callback Verification Failed"});
        }
    });
    ```

    ```typescript
    //mmpayPlugin.ts
    //src/plugins/mmpayPlugin.ts

    /**
     * MMpay FastifyJS Plugin
     * @author          [NawIng]
     * @organization    [MyanMyanPay]
     */

    import {FastifyInstance, FastifyPluginAsync} from 'fastify';
    import fastifyPlugin from 'fastify-plugin';
    import {MMPaySDK} from 'mmpay-node-sdk';
    /**
     * @IOrderedItem
     */
    interface IOrderedItem {
        name: string;
        quantity: number;
        amount: number;
    }
    /**
     * @CreateSandboxPaymentRequest
     */
    export interface CreateSandboxPaymentRequest {
        amount: number;
        orderId: string;
        items: IOrderedItem[];
    }
    /**
     * @CreateProductionPaymentRequest
     */
    export interface CreateProductionPaymentRequest {
        amount: number;
        orderId: string;
        items: IOrderedItem[];
    }
    /**
     * @PaymentCreateResponse
     */
    export interface PaymentCreateResponse {
        orderId: string;
        amount: number;
        currency?: string;
        transactionRefId?: string;
        qr: string;
    }
    /**
     * @Callback
     */
    export interface CallbackEncoded {
        payloadString: string;
        nonce: string;
        signature: string;
    }
    /**
     * @fastify
     */
    declare module 'fastify' {
        interface FastifyInstance {
            mmpay: {
                createSandboxPayment: (request: CreateSandboxPaymentRequest) => Promise<PaymentCreateResponse>;
                verifySandboxCallBack: (request: CallbackEncoded) => Promise<boolean>;
                createProductionPayment: (request: CreateProductionPaymentRequest) => Promise<PaymentCreateResponse>;
                verifyProductionCallBack: (request: CallbackEncoded) => Promise<boolean>;
            };
        }
    }
    /**
     * @MMPayPluginOptions
     */
    interface MMPayPluginOptions {
        appId: string;
        uatPubKey: string;
        uatSecKey: string;
        prdPubKey: string;
        prdSecKey: string;
    }
    const mmpayPlugin: FastifyPluginAsync<MMPayPluginOptions> = fastifyPlugin(async (fastify: FastifyInstance, options: MMPayPluginOptions) => {
        const SandBoxMMPay = MMPaySDK({
            appId: options.appId,
            publishableKey: options.uatPubKey,
            secretKey: options.uatSecKey,
            apiBaseUrl: 'https://xxx.myanmyanpay.com' // Ask Our Team
        });
        const ProductionMMPay = MMPaySDK({
            appId: options.appId,
            publishableKey: options.prdPubKey,
            secretKey: options.prdSecKey,
            apiBaseUrl: 'https://xxx.myanmyanpay.com' // Ask Our Team
        });
        /**
         * createSandboxPayment
         * @param {CreateSandboxPaymentRequest} params
         * @returns {Promise<PaymentCreateResponse>}
         */
        const createSandboxPayment = async (params: CreateSandboxPaymentRequest): Promise<PaymentCreateResponse> => {
            let options = {
                orderId: params.orderId,
                currency: 'MMK',
                amount: params.amount,
                items: params.items
            }
            return await SandBoxMMPay.sandboxPay(options);
        }
        /**
         * verifySandboxCallBack
         * @param {CallbackEncoded} params
         * @param {string} params.nonce
         * @param {string} params.signature
         * @returns {Promise<boolean>}
         */
        const verifySandboxCallBack = async (params: CallbackEncoded): Promise<boolean> => {
            return await SandBoxMMPay.verifyCb(params.payloadString, params.nonce, params.signature);
        };
        /**
         * createProductionPayment
         * @param {CreateProductionPaymentRequest} params
         * @returns {Promise<PaymentCreateResponse>}
         */
        const createProductionPayment = async (params: CreateProductionPaymentRequest): Promise<PaymentCreateResponse> => {
            let options = {
                orderId: params.orderId,
                currency: 'MMK',
                amount: params.amount,
                items: params.items
            }
            return await ProductionMMPay.pay(options);
        };
        /**
         * verifyProductionCallBack
         * @param {CallbackEncoded} params
         * @param {string} params.nonce
         * @param {string} params.signature
         * @returns {Promise<boolean>}
         */
        const verifyProductionCallBack = async (params: CallbackEncoded): Promise<boolean> => {
            return await ProductionMMPay.verifyCb(params.payloadString, params.nonce, params.signature);
        };
        /**
         * @mmpay
         */
        fastify.decorate('mmpay', {
            createSandboxPayment,
            verifySandboxCallBack,
            createProductionPayment,
            verifyProductionCallBack
        });
    });
    export {mmpayPlugin};
    ```

=== "ElysiaJS Plugin Bun Native (Extremely Fast)"

    ```typescript
    //usage example
    import {Elysia} from 'elysia';
    import {mmpayPlugin} from './plugins/mmpayPlugin';

    interface MMPayIncomingCallbackScheme {
        orderId: string;
        amount: number;
        currency: string;
        vendor: string;
        status: 'PENDING' | 'SUCCESS' | 'FAILED';
        transactionRefId: string;
        callbackUrl?: string;
    }

    const app = new Elysia()
        .use(mmpayPlugin)
        .post('/create-order', async ({body, mmpay}) => {
            const { amount, orderId, items } = body;
            await mmpay.createProductionPayment(amount, orderid, items)
        })
        .post('/create-order-sandbox', async ({body, mmpay}) => {
            const { amount, orderId, items } = body;
            await mmpay.createSandboxPayment(amount, orderid, items)
        })
        .post('/webhooks/mmpay', async ({body, headers, mmpay}) => {
            const incomingSignature = headers['x-mmpay-signature'] as string;
            const incomingNonce = headers['x-mmpay-nonce'] as string;
            const payload = body as MMPayIncomingCallbackScheme;
            const payloadString = JSON.stringify(payload);
            const cbResult = await mmpay.verifyProductionCallback({
                payloadString: payloadString,
                nonce: incomingNonce,
                signature: incomingSignature
            });
            if (cbResult) {
                if (payload.status === 'SUCCESS') {
                    // Do Success
                }
                if (payload.status === 'FAILED') {
                    // Do Fail
                }
            }
        })
        .post('/webhooks/mmpay-sandbox', async ({body, headers, mmpay}) => {
            const incomingSignature = headers['x-mmpay-signature'] as string;
            const incomingNonce = headers['x-mmpay-nonce'] as string;
            const payload = body as MMPayIncomingCallbackScheme;
            const payloadString = JSON.stringify(payload);
            const cbResult = await mmpay.verifySandboxCallback({
                payloadString: payloadString,
                nonce: incomingNonce,
                signature: incomingSignature
            });
            if (cbResult) {
                if (payload.status === 'SUCCESS') {
                    // Do Success
                }
                if (payload.status === 'FAILED') {
                    // Do Fail
                }
            }
        })
    ```

    ```typescript
    //
    //mmpayPlugin.ts
    //src/plugins/mmpayPlugin.ts

    /**
     * MMpay ElysiaJS Plugin
     * @author          [NawIng]
     * @organization    [MyanMyanPay]
     */

    import {Elysia} from 'elysia';
    import {MMPaySDK} from 'mmpay-node-sdk';

    const SandboxMMPay = MMPaySDK({
        appId: process.env.SBX_MMPAY_APP_ID!,
        publishableKey: process.env.SBX_MMPAY_PUB_KEY!,
        secretKey: process.env.SBX_MMPAY_SEC_KEY!,
        apiBaseUrl: 'https://xxx.myanmyanpay.com', // Ask Our Team
    });

    const ProductionMMPay = MMPaySDK({
        appId: process.env.PDX_MMPAY_APP_ID!,
        publishableKey: process.env.PDX_MMPAY_PUB_KEY!,
        secretKey: process.env.PDX_MMPAY_SEC_KEY!,
        apiBaseUrl: 'https://xxx.myanmyanpay.com', // Ask Our Team
    });

    /**
     * @Callback
     */
    export interface CallbackEncoded {
        payloadString: string;
        nonce: string;
        signature: string;
    }
    /**
     * @mmpayPlugin
     */
    export const mmpayPlugin = new Elysia({name: 'plugin.mmpay'})
        .decorate('mmpay', {
            /**
             * createSandboxPayment
             * @param {string} orderId
             * @param {number} amount
             * @returns
             */
            async createSandboxPayment(orderId: string, amount: number, items: any) {
                return await SandboxMMPay.sandboxPay({
                    amount,
                    orderId,
                    items: items,
                    currency: 'MMK'
                });
            },
            /**
             * verifySandboxCallback
             * @param orderId
             * @param amount
             * @returns
             */
            async verifySandboxCallback(params: CallbackEncoded) {
                return await SandboxMMPay.verifyCb(params.payloadString, params.nonce, params.signature);
            },
            /**
             * createProductionPayment
             * @param {string} orderId
             * @param {number} amount
             * @returns
             */
            async createProductionPayment(orderId: string, amount: number, items: any) {
                return await ProductionMMPay.pay({
                    amount,
                    orderId,
                    items: items,
                    currency: 'MMK'
                });
            },
            /**
             * verifyProductionCallback
             * @param {CallbackEncoded} params
             * @param {string} params.nonce
             * @param {string} params.signature
             * @returns {Promise<boolean>}
             */
            async verifyProductionCallback(params: CallbackEncoded) {
                return await ProductionMMPay.verifyCb(params.payloadString, params.nonce, params.signature);
            }
        });

    ```
