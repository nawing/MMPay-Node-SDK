#### ElysiaJS With Plugin Usage Full Example (Bun Native - Extremely Fast)

---

```typescript
// mmpayPlugin.ts
import { Elysia } from 'elysia';
import { MMPaySDK } from 'mmpay-node-sdk';

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

export const mmpayPlugin = (
  config: MMPayConfig,
  setup?: (instances: { sandbox: ReturnType<typeof MMPaySDK>; production: ReturnType<typeof MMPaySDK> }) => void
) => {
  const sandbox = MMPaySDK({
    appId: config.sbxAppId,
    publishableKey: config.sbxPubKey,
    secretKey: config.sbxSecKey,
    apiBaseUrl: config.sbxBaseUrl,
  });

  const production = MMPaySDK({
    appId: config.pdxAppId,
    publishableKey: config.pdxPubKey,
    secretKey: config.pdxSecKey,
    apiBaseUrl: config.pdxBaseUrl,
  });

  if (setup) {
    setup({ sandbox, production });
  }

  return new Elysia({ name: 'plugin.mmpay' }).decorate('mmpay', {
    sandbox,
    production,
  });
};
```
