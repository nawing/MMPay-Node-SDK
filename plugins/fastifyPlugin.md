#### FastifyJS With Plugin Usage Full Example (Fast)

```typescript
// server.ts
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

const fastify: FastifyInstance = Fastify({ logger: true });

await fastify.register(mmpayPlugin, {
    appId: process.env.MMPAY_APP_ID!,
    uatPubKey: process.env.MMPAY_UAT_PUBKEY!,
    uatSecKey: process.env.MMPAY_UAT_SECKEY!,
    prdPubKey: process.env.MMPAY_PRD_PUBKEY!,
    prdSecKey: process.env.MMPAY_PRD_SECKEY!,
});

fastify.post('/create-order', async (request: FastifyRequest, reply: FastifyReply) => {
    const { amount, orderId, items, customMessage } = body;
    const payResponse = await fastify.mmpay.createProductionPayment({ amount, orderId, items, customMessage });
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
});
```
---

```typescript
// plguins/mmpayPlugin.ts
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
 * @CreatePaymentRequest
 */
export interface CreatePaymentRequest {
    amount: number;
    orderId: string;
    items?: IOrderedItem[];
    customMessage?: string;
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
            createSandboxPayment: (request: CreatePaymentRequest) => Promise<PaymentCreateResponse>;
            verifySandboxCallBack: (request: CallbackEncoded) => Promise<boolean>;
            createProductionPayment: (request: CreatePaymentRequest) => Promise<PaymentCreateResponse>;
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
     * @param {CreatePaymentRequest} params
     * @returns {Promise<PaymentCreateResponse>}
     */
    const createSandboxPayment = async (params: CreatePaymentRequest): Promise<PaymentCreateResponse> => {
        let options = {
            orderId: params.orderId,
            currency: 'MMK',
            amount: params.amount,
            items: params.items,
            customMessage: params.customMessage,
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
     * @param {CreatePaymentRequest} params
     * @returns {Promise<PaymentCreateResponse>}
     */
    const createProductionPayment = async (params: CreatePaymentRequest): Promise<PaymentCreateResponse> => {
        let options = {
            orderId: params.orderId,
            currency: 'MMK',
            amount: params.amount,
            items: params.items,
            customMessage: params.customMessage,
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
