import {createHmac} from 'node:crypto';
import {EventEmitter} from 'node:events';
import {
  CallbackIncomingData,
  HandShakeRequest,
  HandShakeResponse,
  PayGetRequest,
  PayGetResponse,
  PaymentRequest,
  PaymentResponse,
  SDKOptions,
  XPaymentRequest
} from './types';

export function MMPaySDK(options: SDKOptions): MMPaySdkClass {
  return new MMPaySdkClass({
    appId: options.appId,
    publishableKey: options.publishableKey,
    secretKey: options.secretKey,
    apiBaseUrl: options.apiBaseUrl,
  });
}

class MMPaySdkClass extends EventEmitter {
  readonly #appId: string;
  readonly #publishableKey: string;
  readonly #secretKey: string;
  readonly #apiBaseUrl: string;
  readonly #isSandbox: boolean;

  #btoken!: string;

  constructor(options: SDKOptions) {
    super();
    this.#appId = options.appId;
    this.#publishableKey = options.publishableKey;
    this.#secretKey = options.secretKey;
    this.#apiBaseUrl = options.apiBaseUrl;
    this.#isSandbox = this.#publishableKey.includes('_test_') || this.#secretKey.includes('_test_');
  }

  _generateSignature(bodyString: string, nonce: string): string {
    const stringToSign = `${nonce}.${bodyString}`;
    return createHmac('sha256', this.#secretKey)
      .update(stringToSign)
      .digest('hex');
  }

  async listen(payload: string, nonce: string, expectedSignature: string): Promise<this> {
    try {
      const isValid = await this.verifyCb(payload, nonce, expectedSignature);

      if (!isValid) {
        this.emit('error', new Error('Signature verification failed'));
        return this;
      }

      const tx: CallbackIncomingData = JSON.parse(payload);

      switch (tx.status) {
        case 'PENDING':
          this.emit('tx:create', tx);
          break;
        case 'SUCCESS':
          if (tx.condition === 'TOUCHED') {
            this.emit('tx:heartbeat', tx);
          } else {
            this.emit('tx:success', tx);
          }
          break;
        case 'FAILED':
          this.emit('tx:failed', tx);
          break;
        case 'REFUNDED':
          this.emit('tx:refunded', tx);
          break;
        case 'CANCELLED':
          this.emit('tx:cancel', tx);
          break;
        case 'EXPIRED':
          this.emit('tx:expire', tx);
          break;
        default:
          this.emit('tx:unknown', tx);
      }
    } catch (err) {
      this.emit('error', err);
    }

    return this;
  }

  onTxCreate(cb: (tx: CallbackIncomingData) => void): this {
    this.on('tx:create', cb);
    return this;
  }

  onTxSuccess(cb: (tx: CallbackIncomingData) => void): this {
    this.on('tx:success', cb);
    return this;
  }

  onTxFail(cb: (tx: CallbackIncomingData) => void): this {
    this.on('tx:failed', cb);
    return this;
  }

  onTxRefund(cb: (tx: CallbackIncomingData) => void): this {
    this.on('tx:refunded', cb);
    return this;
  }

  onTxCancel(cb: (tx: CallbackIncomingData) => void): this {
    this.on('tx:cancel', cb);
    return this;
  }

  onTxExpire(cb: (tx: CallbackIncomingData) => void): this {
    this.on('tx:expire', cb);
    return this;
  }

  onHeartbeat(cb: (tx: CallbackIncomingData) => void): this {
    this.on('tx:heartbeat', cb);
    return this;
  }

  async handShake(payload: HandShakeRequest): Promise<HandShakeResponse> {
    const segment = this.#isSandbox ? 'sandbox-handshake' : 'handshake';
    const endpoint = `${this.#apiBaseUrl}/payments/${segment}`;
    const bodyString = JSON.stringify(payload);
    const nonce = Date.now().toString();
    const signature = this._generateSignature(bodyString, nonce);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: bodyString,
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (!response.ok) throw data;
      this.#btoken = data.token;
      return data as HandShakeResponse;
    } catch (error) {
      return error as any;
    }
  }

  async pay(params: PaymentRequest): Promise<PaymentResponse> {
    const segment = this.#isSandbox ? 'sandbox-create' : 'create';
    const endpoint = `${this.#apiBaseUrl}/payments/${segment}`;
    const nonce = Date.now().toString();
    let _xpayload: XPaymentRequest = {
      appId: this.#appId,
      nonce: nonce,
      amount: params.amount,
      orderId: params.orderId,
      callbackUrl: params.callbackUrl,
      customMessage: params.customMessage,
      items: params.items,
    };
    const bodyString = JSON.stringify(_xpayload);
    const signature = this._generateSignature(bodyString, nonce);
    await this.handShake({orderId: _xpayload.orderId as string, nonce: _xpayload.nonce as string});
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: bodyString,
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Btoken': this.#btoken,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data as PaymentResponse;
    } catch (error) {
      return error as any;
    }
  }

  async get(params: PayGetRequest): Promise<PayGetResponse> {
    const segment = this.#isSandbox ? 'sandbox-get' : 'get';
    const endpoint = `${this.#apiBaseUrl}/payments/${segment}`;
    const nonce = Date.now().toString();
    let _xpayload: PayGetRequest = {
      orderId: params.orderId,
      nonce: nonce
    };
    const bodyString = JSON.stringify(_xpayload);
    const signature = this._generateSignature(bodyString, nonce);
    await this.handShake({orderId: _xpayload.orderId, nonce: _xpayload.nonce});
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: bodyString,
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Btoken': this.#btoken,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (!response.ok) throw data;
      return data as PayGetResponse;
    } catch (error) {
      return error as any;
    }
  }

  async verifyCb(
    payload: string,
    nonce: string,
    expectedSignature: string
  ): Promise<boolean> {
    if (!payload || !nonce || !expectedSignature) {
      throw new Error("Callback verification failed: Missing payload, nonce, or signature.");
    }
    const stringToSign = `${nonce}.${payload}`;

    const generatedSignature = createHmac('sha256', this.#secretKey)
      .update(stringToSign)
      .digest('hex');

    if (generatedSignature !== expectedSignature) {
      console.error('Signature mismatch:', {generatedSignature, expectedSignature});
    }
    return (generatedSignature === expectedSignature);
  }
}
