#### FastifyJS With Plugin Usage Full Example (Fast)


```typescript
// mmpayPlugin.ts
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
