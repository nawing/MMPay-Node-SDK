#### FastifyJS With Plugin Usage Full Example (Fast)


```typescript
// plguins/mmpayPlugin.ts
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { MMPaySDK } from 'mmpay-node-sdk';

interface IOrderedItem {
    name: string;
    quantity: number;
    amount: number;
}

export interface CreatePaymentRequest {
    amount: number;
    orderId: string;
    items?: IOrderedItem[];
    customMessage?: string;
}

export interface PaymentCreateResponse {
    orderId: string;
    amount: number;
    currency?: string;
    transactionRefId?: string;
    qr: string;
}

declare module 'fastify' {
    interface FastifyInstance {
        mmpay: {
            sandbox: ReturnType<typeof MMPaySDK>;
            production: ReturnType<typeof MMPaySDK>;
        };
    }
}

interface MMPayPluginOptions {
    appId: string;
    uatPubKey: string;
    uatSecKey: string;
    prdPubKey: string;
    prdSecKey: string;
}

const mmpayPlugin: FastifyPluginAsync<MMPayPluginOptions> = fastifyPlugin(async (fastify: FastifyInstance, options: MMPayPluginOptions) => {
    const sandbox = MMPaySDK({
        appId: options.appId,
        publishableKey: options.uatPubKey,
        secretKey: options.uatSecKey,
        apiBaseUrl: 'https://sandbox.myanmyanpay.com'
    });

    const production = MMPaySDK({
        appId: options.appId,
        publishableKey: options.prdPubKey,
        secretKey: options.prdSecKey,
        apiBaseUrl: 'https://api.myanmyanpay.com'
    });

    fastify.decorate('mmpay', {
        sandbox,
        production
    });
});

export { mmpayPlugin };

```

---
---
---


```typescript
// server.ts
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { mmpayPlugin } from './plugins/mmpayPlugin';

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

const fastify: FastifyInstance = Fastify({ logger: true });

fastify.register(mmpayPlugin, {
    appId: process.env.MMPAY_APP_ID!,
    uatPubKey: process.env.MMPAY_UAT_PUBKEY!,
    uatSecKey: process.env.MMPAY_UAT_SECKEY!,
    prdPubKey: process.env.MMPAY_PRD_PUBKEY!,
    prdSecKey: process.env.MMPAY_PRD_SECKEY!,
});

fastify.ready(() => {
    fastify.mmpay.production
        .onTxCreate((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxSuccess((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxFail((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxRefund((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxCancel((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxExpire((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onHeartbeat((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId)) // This means already send event coming in again
        .on('error', (err) => console.error(err));

    fastify.mmpay.sandbox
        .onTxCreate((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxSuccess((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxFail((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxRefund((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxCancel((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onTxExpire((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId))
        .onHeartbeat((tx: MMPayIncomingCallbackScheme) => console.log(tx.orderId)) // This means already send event coming in again
        .on('error', (err) => console.error(err));
});

fastify.post('/create-order', async (request: FastifyRequest, reply: FastifyReply) => {
    const { amount, orderId, items, customMessage } = request.body as any;
    const payResponse = await fastify.mmpay.production.pay({
        amount,
        orderId,
        items,
        customMessage
    });
    reply.send(payResponse);
});

fastify.post('/webhooks/mmpay-callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const incomingSignature = request.headers['x-mmpay-signature'] as string;
    const incomingNonce = request.headers['x-mmpay-nonce'] as string;
    const payloadString = JSON.stringify(request.body);
    await fastify.mmpay.production.listen(
        payloadString,
        incomingNonce,
        incomingSignature
    );
    reply.code(200).send({ message: "Callback Processed" });
});

fastify.post('/create-order-sandbox', async (request: FastifyRequest, reply: FastifyReply) => {
    const { amount, orderId, items, customMessage } = request.body as any;
    const payResponse = await fastify.mmpay.sandbox.sandboxPay({
        amount,
        orderId,
        items,
        customMessage
    });
    reply.send(payResponse);
});

fastify.post('/webhooks/mmpay-callback-sandbox', async (request: FastifyRequest, reply: FastifyReply) => {
    const incomingSignature = request.headers['x-mmpay-signature'] as string;
    const incomingNonce = request.headers['x-mmpay-nonce'] as string;
    const payloadString = JSON.stringify(request.body);
    await fastify.mmpay.sandbox.listen(
        payloadString,
        incomingNonce,
        incomingSignature
    );
    reply.code(200).send({ message: "Callback Processed" });
});

fastify.listen({ port: 3000 });
```
---
