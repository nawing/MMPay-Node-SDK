#### ElysiaJS With Plugin Implementation Guide

```typescript
// server.ts
import {Elysia} from 'elysia';
import {mmpayPlugin} from './mmpayPlugin';

interface MMPayIncomingCallbackScheme {
  orderId: string;
  amount: number;
  method: 'QR' | 'PIN' | 'PWA' | 'CARD';
  currency: string;
  vendor: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED';
  condition: 'PRISTINE' | 'TOUCHED';
  transactionRefId: string;
  callbackUrl?: string;
  customMessage?: string;
}

const app = new Elysia()
  .use(
    mmpayPlugin(
      {
        sbxAppId: process.env.SBX_APP_ID!,
        sbxPubKey: process.env.SBX_PUB_KEY!,
        sbxSecKey: process.env.SBX_SEC_KEY!,
        sbxBaseUrl: process.env.SBX_BASE_URL!,
        pdxAppId: process.env.PDX_APP_ID!,
        pdxPubKey: process.env.PDX_PUB_KEY!,
        pdxSecKey: process.env.PDX_SEC_KEY!,
        pdxBaseUrl: process.env.PDX_BASE_URL!,
      },
      ({ sandbox, production }) => {
        production
          .onTxCreate((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxSuccess((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxFail((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxRefund((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxCancel((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxExpire((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onHeartbeat((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId)) // This means already send event coming in again
          .on('error', (err) => console.error(err));

        sandbox
          .onTxCreate((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxSuccess((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxFail((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxRefund((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxCancel((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onTxExpire((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
          .onHeartbeat((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId)) // This means already send event coming in again
          .on('error', (err) => console.error(err));
      }
    )
  )
  .post('/create-order', async ({ body, mmpay }) => {
    const { amount, orderId, items, customMessage } = body as any;
    return await mmpay.production.pay({ amount, orderId, items, customMessage });
  })
  .post('/create-order-sandbox', async ({ body, mmpay }) => {
    const { amount, orderId, items, customMessage } = body as any;
    return await mmpay.sandbox.pay({ amount, orderId, items, customMessage });
  })
  .post('/webhooks/mmpay-callback', async ({ body, headers, mmpay }) => {
    const incomingSignature = headers['x-mmpay-signature'] as string;
    const incomingNonce = headers['x-mmpay-nonce'] as string;
    const payloadString = JSON.stringify(body);

    await mmpay.production.listen(payloadString, incomingNonce, incomingSignature);

    return { message: 'Callback Processed' };
  })
  .post('/webhooks/mmpay-callback-sandbox', async ({ body, headers, mmpay }) => {
    const incomingSignature = headers['x-mmpay-signature'] as string;
    const incomingNonce = headers['x-mmpay-nonce'] as string;
    const payloadString = JSON.stringify(body);

    await mmpay.sandbox.listen(payloadString, incomingNonce, incomingSignature);

    return { message: 'Callback Processed' };
  })
  .listen(3000);

```
