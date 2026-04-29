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
export declare function MMPaySDK(options: SDKOptions): MMPaySdkClass;
declare class MMPaySdkClass {
    #private;
    constructor(options: SDKOptions);
    _generateSignature(bodyString: string, nonce: string): string;
    /**
     * SANDBOX
     */
    /**
     * sandboxHandShake
     * @param {HandShakeRequest} payload
     * @returns {Promise<HandShakeResponse>}
     */
    sandboxHandShake(payload: HandShakeRequest): Promise<HandShakeResponse>;
    /**
     * sandboxPay
     * @param {PaymentRequest} params
     * @returns {Promise<PaymentResponse>}
     */
    sandboxPay(params: PaymentRequest): Promise<PaymentResponse>;
    /**
     * sandboxGet
     * @param {PayGetRequest} params
     * @returns {Promise<PayGetResponse> }
     */
    sandboxGet(params: PayGetRequest): Promise<PayGetResponse>;
    /**
     * PRODUCTION
     */
    /**
     * handShake
     * @param {HandShakeRequest} payload
     * @returns {Promise<HandShakeResponse>}
     */
    handShake(payload: HandShakeRequest): Promise<HandShakeResponse>;
    /**
     * pay
     * @param {PaymentRequest} params
     * @returns {Promise<PaymentResponse>}
     */
    pay(params: PaymentRequest): Promise<PaymentResponse>;
    /**
     * get
     * @param {PayGetRequest} params
     * @returns {Promise<PayGetResponse> }
     */
    get(params: PayGetRequest): Promise<PayGetResponse>;
    /**
     * verifyCb
     * @param payload
     * @param nonce
     * @param expectedSignature
     * @returns {Promise<boolean>}
     */
    verifyCb(payload: string, nonce: string, expectedSignature: string): Promise<boolean>;
}
export {};
