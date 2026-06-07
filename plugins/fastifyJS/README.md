#### FastifyJS With Plugin Usage Full Example (Fast) Implementation Guide


```typescript
// server.ts
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { mmpayPlugin } from './mmpayPlugin';

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
        .onTxCreate((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxSuccess((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxFail((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxRefund((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxCancel((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxExpire((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onHeartbeat((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx)) // This means already send event coming in again
        .on('error', (err) => fastify.log.error(err));

    fastify.mmpay.sandbox
        .onTxCreate((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxSuccess((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxFail((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxRefund((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxCancel((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onTxExpire((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx))
        .onHeartbeat((tx: MMPayIncomingCallbackScheme) => fastify.log.info(tx)) // This means already send event coming in again
        .on('error', (err) => fastify.log.error(err));

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
