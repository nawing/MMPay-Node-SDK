import axios from 'axios';
import CryptoJS from 'crypto-js';

export interface PayGetRequest {
  orderId: string;
  nonce: string;
}

export interface PayGetResponse {
  appId: string;
  orderId: string;
  amount: number;
  vendor?: string;    // KBZPay | AYA Pay | uab pay | Wave Pay
  method: 'QR' | 'PIN' | 'PWA' | 'CARD';
  customMessage?: string;
  callbackUrl?: string;
  callbackUrlStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'; // CALLBACK STATUS
  callbackAt?: Date;
  disbursementId?: string;
  disStatus?: 'NONE' | 'REQUESTED' | 'SUCCESS' | 'FAILED'; // DISBURSEMENT SETTLED OR NOT
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';   // CUSTOMER REALLY PAID OR NOT
  condition: 'PRISTINE' | 'TOUCHED' | 'EXPIRED'; // QR IS SCANNED OR NOT
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

/**
 * @SDKOptions
 * @SDKOptions
 * @SDKOptions
 */
export interface SDKOptions {
  appId: string;
  publishableKey: string;
  secretKey: string;
  apiBaseUrl: string;
}

/**
 * MMPaySDK
 * @param {string} appId
 * @param {string} publishableKey
 * @param {string} secretKey
 * @returns {MMPayNodeSdkClass}
 */
export function MMPaySDK(options: SDKOptions): MMPaySdkClass {
  return new MMPaySdkClass({
    appId: options.appId,
    publishableKey: options.publishableKey,
    secretKey: options.secretKey,
    apiBaseUrl: options.apiBaseUrl,
  });
}
/**
 * @MMPaySdkClass
 */
class MMPaySdkClass {
  readonly #appId: string;
  readonly #publishableKey: string;
  readonly #secretKey: string;
  readonly #apiBaseUrl: string;


  #btoken: string;
  /**
   * Initializes the SDK with the merchant's keys and the API endpoint.
   * @param {string} appId
   * @param {string} publishableKey
   * @param {string} secretKey
   */
  constructor(options: SDKOptions) {
    this.#appId = options.appId;
    this.#publishableKey = options.publishableKey;
    this.#secretKey = options.secretKey;
    this.#apiBaseUrl = options.apiBaseUrl;
  }
  /**
   * Generates an HMAC SHA256 signature for the request integrity check.
   * @private
   * @param {string} bodyString
   * @param {string} nonce
   * @returns {string}
   */
  _generateSignature(bodyString: string, nonce: string): string {
    const stringToSign = `${nonce}.${bodyString}`;
    return CryptoJS.HmacSHA256(stringToSign, this.#secretKey).toString(CryptoJS.enc.Hex);
  }

  /**
   * @Sandbox_Environment
   * @Sandbox_Environment
   * @Sandbox_Environment
   */
  /**
   * sandboxHandShake
   * @param {HandShakeRequest} payload
   * @param {string} payload.orderId
   * @param {string} payload.nonce
   * @returns {Promise<HandShakeResponse>}
   */
  async sandboxHandShake(payload: HandShakeRequest): Promise<HandShakeResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/sandbox-handshake`;
    const bodyString = JSON.stringify(payload);
    const nonce = Date.now().toString();
    const signature = this._generateSignature(bodyString, nonce);
    try {
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      this.#btoken = response.data.token;
      return response.data as HandShakeResponse;
    } catch (error) {
      return error
    }
  }
  /**
   * sandboxPay
   * @param {PaymentRequest} params
   * @param {string} params.orderId
   * @param {number} params.amount
   * @param {string} params.callbackUrl
   * @param {Item[]} params.items
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
    await this.sandboxHandShake({orderId: _xpayload.orderId, nonce: _xpayload.nonce});
    try {
      const response = await axios.post(endpoint, _xpayload, {
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Btoken': this.#btoken,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      return response.data as PaymentResponse;
    } catch (error) {
      return error
    }
  }
  /**
   * sandboxGet
   * @param {PayGetRequest} params
   * @param {string} params.orderId
   * @returns {Promise<PayGetResponse>}
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
      const response = await axios.post(endpoint, _xpayload, {
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Btoken': this.#btoken,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      return response.data as PayGetResponse;
    } catch (error) {
      return error
    }
  }



  /**
   * @Production_Environment
   * @Production_Environment
   * @Production_Environment
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
      const response = await axios.post(endpoint, payload, {
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      this.#btoken = response.data.token;
      return response.data as HandShakeResponse;
    } catch (error) {
      return error
    }
  }
  /**
   * pay
   * @param {PaymentRequest} params - The data for the payment.
   * @param {string} params.orderId
   * @param {number} params.amount
   * @param {Item[]} params.items
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
    await this.handShake({orderId: _xpayload.orderId, nonce: _xpayload.nonce});
    try {
      const response = await axios.post(endpoint, _xpayload, {
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Btoken': this.#btoken,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      return response.data as PaymentResponse;
    } catch (error) {
      return error
    }
  }
  /**
   * get
   * @param {PayGetRequest} params
   * @param {string} params.orderId
   * @returns {Promise<PayGetResponse>}
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
      const response = await axios.post(endpoint, _xpayload, {
        headers: {
          'Authorization': `Bearer ${this.#publishableKey}`,
          'X-Mmpay-Btoken': this.#btoken,
          'X-Mmpay-Nonce': nonce,
          'X-Mmpay-Signature': signature,
          'Content-Type': 'application/json',
        }
      });
      return response.data as PayGetResponse;
    } catch (error) {
      return error
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
