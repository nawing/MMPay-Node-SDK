import axios from 'axios';
import CryptoJS from 'crypto-js';

export interface PaymentRequest {
  appId?: string;
  orderId: string;
  amount: number;
  currency?: string;
  callbackUrl?: string;
  items: Item[]
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
  appId: string;
  orderId: string;
  amount: number;
  currency: string;
  method?: string;
  vendor?: string;
  callbackUrl?: string;
  items: {name: string, amount: number, quantity: number}[];
  merchantId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}


export interface HandShakeRequest {
  handshakeSignature: string;
}
export interface HandShakeResponse {
  handshakeSignature: string;
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
   * @returns {Promise<HandShakeResponse>}
   */
  async sandboxHandShake(payload: HandShakeRequest): Promise<HandShakeResponse> {
    const endpoint = `${this.#apiBaseUrl}/payments/sandbox-handshake`;
    const bodyString = JSON.stringify(payload);
    const nonce = Date.now().toString();
    const signature = this._generateSignature(bodyString, nonce);
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${this.#publishableKey}`,
        'X-Mmpay-Nonce': nonce,
        'X-Mmpay-Signature': signature,
        'Content-Type': 'application/json',
      }
    });
    return response.data as HandShakeResponse;
  }
  /**
   * sandboxPay
   * @param {PaymentRequest} payload
   * @param {string} payload.orderId
   * @param {number} payload.amount
   * @param {string} payload.callbackUrl
   * @param {Item[]} payload.items
   * @returns {Promise<PaymentResponse>}
   */
  async sandboxPay(payload: PaymentRequest): Promise<PaymentResponse> {
    payload.appId = this.#appId as string;
    const endpoint = `${this.#apiBaseUrl}/payments/sandbox-create`;
    const bodyString = JSON.stringify(payload);
    const nonce = Date.now().toString();
    const signature = this._generateSignature(bodyString, nonce);
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${this.#publishableKey}`,
        'X-Mmpay-Nonce': nonce,
        'X-Mmpay-Signature': signature,
        'Content-Type': 'application/json',
      }
    });
    return response.data as PaymentResponse;
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
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${this.#publishableKey}`,
        'X-Mmpay-Nonce': nonce,
        'X-Mmpay-Signature': signature,
        'Content-Type': 'application/json',
      }
    });
    return response.data as HandShakeResponse;
  }
  /**
   * pay
   * @param {PaymentRequest} payload - The data for the payment.
   * @param {string} payload.orderId
   * @param {number} payload.amount
   * @param {Item[]} payload.items
   * @returns {Promise<PaymentResponse>}
   */
  async pay(payload: PaymentRequest): Promise<PaymentResponse> {
    payload.appId = this.#appId as string;
    const endpoint = `${this.#apiBaseUrl}/payments/create`;
    const bodyString = JSON.stringify(payload);
    const nonce = Date.now().toString(); // Simple timestamp nonce
    const signature = this._generateSignature(bodyString, nonce);
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${this.#publishableKey}`,
        'X-Mmpay-Nonce': nonce,
        'X-Mmpay-Signature': signature,
        'Content-Type': 'application/json',
      }
    });
    return response.data as PaymentResponse;
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
