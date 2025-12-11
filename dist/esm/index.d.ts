export interface PaymentRequest {
    orderId: string;
    amount: number;
    currency?: string;
    callbackUrl?: string;
    items: Item[];
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
    appId: string;
    orderId: string;
    amount: number;
    currency: string;
    method?: string;
    vendor?: string;
    callbackUrl?: string;
    items: {
        name: string;
        amount: number;
        quantity: number;
    }[];
    merchantId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    createdAt: string;
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
export declare function MMPaySDK(options: SDKOptions): MMPaySdkClass;
/**
 * @MMPaySdkClass
 */
declare class MMPaySdkClass {
    #private;
    /**
     * Initializes the SDK with the merchant's keys and the API endpoint.
     * @param {string} appId
     * @param {string} publishableKey
     * @param {string} secretKey
     */
    constructor(options: SDKOptions);
    /**
     * Generates an HMAC SHA256 signature for the request integrity check.
     * @private
     * @param {string} bodyString
     * @param {string} nonce
     * @returns {string}
     */
    _generateSignature(bodyString: string, nonce: string): string;
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
    sandboxHandShake(payload: HandShakeRequest): Promise<HandShakeResponse>;
    /**
     * sandboxPay
     * @param {PaymentRequest} params
     * @param {string} params.orderId
     * @param {number} params.amount
     * @param {string} params.callbackUrl
     * @param {Item[]} params.items
     * @returns {Promise<PaymentResponse>}
     */
    sandboxPay(params: PaymentRequest): Promise<PaymentResponse>;
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
    handShake(payload: HandShakeRequest): Promise<HandShakeResponse>;
    /**
     * pay
     * @param {PaymentRequest} params - The data for the payment.
     * @param {string} params.orderId
     * @param {number} params.amount
     * @param {Item[]} params.items
     * @returns {Promise<PaymentResponse>}
     */
    pay(params: PaymentRequest): Promise<PaymentResponse>;
    /**
     * verifyCb
     * @param {string} payload
     * @param {string} nonce
     * @param {string} expectedSignature
     * @returns {Promise<boolean>}
     */
    verifyCb(payload: string, nonce: string, expectedSignature: string): Promise<boolean>;
}
export {};
