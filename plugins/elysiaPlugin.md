#### ElysiaJS With Plugin Usage Full Example (Bun Native - Extremely Fast)

```typescript
// server.ts
//usage example
import {Elysia} from 'elysia';
import {mmpayPlugin} from './plugins/mmpayPlugin';

interface MMPayIncomingCallbackScheme {
    orderId: string;
    amount: number;
    method: string;
    currency: string;
    vendor: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    condition: 'PRISTINE' | 'TOUCHED' | 'EXPIRED';
    transactionRefId: string;
    callbackUrl?: string;
    customMessage?: string;
}

const app = new Elysia()
    .use(mmpayPlugin({
      sbxAppId: process.env.SBX_APP_ID!,
      sbxPubKey: process.env.SBX_PUB_KEY!,
      sbxSecKey: process.env.SBX_SEC_KEY!,
      sbxBaseUrl: process.env.SBX_BASE_URL!,
      pdxAppId: process.env.PDX_APP_ID!,
      pdxPubKey: process.env.PDX_PUB_KEY!,
      pdxSecKey: process.env.PDX_SEC_KEY!,
      pdxBaseUrl: process.env.PDX_BASE_URL!,
    }))
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
          if (payload.status === "SUCCESS" && payload.condition === "PRISTINE") {

          }
          if (payload.status === 'FAILED' && payload.condition === "PRISTINE") {

          };
          if (payload.status === 'REFUNDED' && payload.condition === "PRISTINE") {

          };
          reply.code(200).send({message: "Callback Processed Successfully"});
        }

        if (!cbResult) {
          reply.code(200).send({message: "Callback Verification Failed"});
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
          if (payload.status === "SUCCESS" && payload.condition === "PRISTINE") {

          }
          if (payload.status === 'FAILED' && payload.condition === "PRISTINE") {

          };
          if (payload.status === 'REFUNDED' && payload.condition === "PRISTINE") {

          };
          reply.code(200).send({message: "Callback Processed Successfully"});
        }

        if (!cbResult) {
          reply.code(200).send({message: "Callback Verification Failed"});
        }
    })
```
---

```typescript
// plguins/mmpayPlugin.ts

import {Elysia} from 'elysia';
import {MMPaySDK} from 'mmpay-node-sdk';

/**
 * @CallbackParams
 */
export interface CallbackParams {
  payloadString: string;
  nonce: string;
  signature: string;
}

export interface Item {
  name: string;
  amount: number;
  quantity: number;
}

export interface PaymentResponse {
  orderId: string;
  amount: number;
  currency?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  qr: string;
}

export interface MMPayConfig {
  sbxAppId: string;
  sbxPubKey: string;
  sbxSecKey: string;
  sbxBaseUrl: string;

  pdxAppId: string;
  pdxPubKey: string;
  pdxSecKey: string;
  pdxBaseUrl: string;
}

/**
 * @mmpayPlugin
 */
export const mmpayPlugin = (config: MMPayConfig) => {

  const SandboxMMPay = MMPaySDK({
    appId: config.sbxAppId!,
    publishableKey: config.sbxPubKey!,
    secretKey: config.sbxSecKey!,
    apiBaseUrl: config.sbxBaseUrl,
  });

  const ProductionMMPay = MMPaySDK({
    appId: config.pdxAppId!,
    publishableKey: config.pdxPubKey!,
    secretKey: config.pdxSecKey!,
    apiBaseUrl: config.pdxBaseUrl,
  });

  return new Elysia({name: 'plugin.mmpay'})
    .decorate('mmpay', {
      /**
       * createSandboxPayment
       * @param {string} orderId
       * @param {number} amount
       * @param {string} customMessage
       * @param {any[]} items
       * @returns
       */
      async createSandboxPayment(orderId: string, amount: number,  customMessage: string, items: any ): Promise <PaymentCreateResponse> {
        return await SandboxMMPay.sandboxPay({
          amount,
          orderId,
          customMessage,
          items,
        });
      },
      /**
       * verifySandboxCallback
       * @param orderId
       * @param amount
       * @returns
       */
      async verifySandboxCallback(params: CallbackEncoded): Promise<boolean> {
        return await SandboxMMPay.verifyCb(params.payloadString, params.nonce, params.signature);
      },
      /**
       * createProductionPayment
       * @param {string} orderId
       * @param {number} amount
       * @param {any[]} items
       * @returns
       */
      async createProductionPayment(orderId: string, amount: number, customMessage: string, items: any): Promise <PaymentCreateResponse>  {
        return await ProductionMMPay.pay({
          amount,
          orderId,
          customMessage,
          items,
        });
      },
      /**
       * verifyProductionCallback
       * @param {CallbackEncoded} params
       * @param {string} params.nonce
       * @param {string} params.signature
       * @returns {Promise<boolean>}
       */
      async verifyProductionCallback(params: CallbackEncoded): Promise<boolean> {
        return await ProductionMMPay.verifyCb(params.payloadString, params.nonce, params.signature);
      }
    });
```
