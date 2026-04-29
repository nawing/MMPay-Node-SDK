import CryptoJS from 'crypto-js';

export interface PayGetRequest {
  orderId: string;
  nonce: string;
}

export interface PayGetResponse {
  appId: string;
  orderId: string;
  amount: number;
  vendor?: string;
  method: 'QR' | 'PIN' | 'PWA' | 'CARD';
  customMessage?: string;
  callbackUrl?: string;
  callbackUrlStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  callbackAt?: Date;
  disbursementId?: string;
  disStatus?: 'NONE' | 'REQUESTED' | 'SUCCESS' | 'FAILED';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  condition: 'PRISTINE' | 'TOUCHED' | 'EXPIRED';
  createdAt: Date;
  transactionRefId?: string;
  qr?: string;
  url?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  callbackUrl?: string;
  customMessage?: string;
  items?: Item[];
}

export interface XPaymentRequest extends PaymentRequest {
  appId?: string;
  nonce?: string;
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
  url: string;
}

export interface CallbackIncomingData {
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

export interface HandShakeRequest {
  orderId: string;
  nonce: string;
}

export interface HandShakeResponse {
  token: string;
}

export interface SDKOptions {
  appId: string;
  publishableKey: string;
  secretKey: string;
  apiBaseUrl: string;
}

export function MMPaySDK(options: SDKOptions): MMPaySdkClass {
  return new MMPaySdkClass({
    appId: options.appId,
    publishableKey: options.publishableKey,
    secretKey: options.secretKey,
    apiBaseUrl: options.apiBaseUrl,
  });
}

class MMPaySdkClass {
  readonly #appId: string;
  readonly #publishableKey: string;
  readonly #secretKey: string;
  readonly #apiBaseUrl: string;

  #btoken!: string;

  constructor(options: SDKOptions) {
    this.#appId = options.appId;
    this.#publishableKey = options.publishableKey;
    this.#secretKey = options.secretKey;
    this.#apiBaseUrl = options.apiBaseUrl;
  }

  _generateSignature(bodyString: string, nonce: string): string {
    const stringToSign = `${nonce}.${bodyString}`;
    return CryptoJS.HmacSHA256(stringToSign, this.#secretKey).toString(CryptoJS.enc.Hex);
  }


  /**
   * SANDBOX
   */

  /**
   * sandboxHandShake
   * @param {HandShakeRequest} payload
   * @returns {Promise<HandShakeResponse>}
   */
  async sandboxHandShake(payload: HandShakeRequest): Promise<HandShakeResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/sandbox-handshake`;
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
  /**
   * sandboxPay
   * @param {PaymentRequest} params
   * @returns {Promise<PaymentResponse>}
   */
  async sandboxPay(params: PaymentRequest): Promise<PaymentResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/sandbox-create`;
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
    await this.sandboxHandShake({orderId: _xpayload.orderId as string, nonce: _xpayload.nonce as string});
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
  /**
   * sandboxGet
   * @param {PayGetRequest} params
   * @returns {Promise<PayGetResponse> }
   */
  async sandboxGet(params: PayGetRequest): Promise<PayGetResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/sandbox-get`;
    const nonce = Date.now().toString();
    let _xpayload: PayGetRequest = {
      orderId: params.orderId,
      nonce: nonce
    };
    const bodyString = JSON.stringify(_xpayload);
    const signature = this._generateSignature(bodyString, nonce);
    await this.sandboxHandShake({orderId: _xpayload.orderId, nonce: _xpayload.nonce});
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




  /**
   * PRODUCTION
   */

  /**
   * handShake
   * @param {HandShakeRequest} payload
   * @returns {Promise<HandShakeResponse>}
   */
  async handShake(payload: HandShakeRequest): Promise<HandShakeResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/handshake`;
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
  /**
   * pay
   * @param {PaymentRequest} params
   * @returns {Promise<PaymentResponse>}
   */
  async pay(params: PaymentRequest): Promise<PaymentResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/create`;
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
  /**
   * get
   * @param {PayGetRequest} params
   * @returns {Promise<PayGetResponse> }
   */
  async get(params: PayGetRequest): Promise<PayGetResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/get`;
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
  /**
   * verifyCb
   * @param {string} payload
   * @param {string} nonce
   * @param {string} expectedSignature
   * @returns {Promise<boolean>}
   */
  async verifyCb(
    payload: string,
    nonce: string,
    expectedSignature: string
  ): Promise<boolean> {
    if (!payload || !nonce || !expectedSignature) {
      throw new Error("Callback verification failed: Missing payload, nonce, or signature.");
    }
    const stringToSign = `${nonce}.${payload}`;
    const generatedSignature = CryptoJS.HmacSHA256(stringToSign, this.#secretKey).toString(CryptoJS.enc.Hex);
    if (generatedSignature !== expectedSignature) {
      console.error('Signature mismatch:', {generatedSignature, expectedSignature});
    }
    return (generatedSignature === expectedSignature);
  }
}
