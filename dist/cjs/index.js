"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _MMPaySdkClass_appId, _MMPaySdkClass_publishableKey, _MMPaySdkClass_secretKey, _MMPaySdkClass_apiBaseUrl, _MMPaySdkClass_btoken;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MMPaySDK = MMPaySDK;
const axios_1 = __importDefault(require("axios"));
const crypto_js_1 = __importDefault(require("crypto-js"));
/**
 * MMPaySDK
 * @param {string} appId
 * @param {string} publishableKey
 * @param {string} secretKey
 * @returns {MMPayNodeSdkClass}
 */
function MMPaySDK(options) {
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
    /**
     * Initializes the SDK with the merchant's keys and the API endpoint.
     * @param {string} appId
     * @param {string} publishableKey
     * @param {string} secretKey
     */
    constructor(options) {
        _MMPaySdkClass_appId.set(this, void 0);
        _MMPaySdkClass_publishableKey.set(this, void 0);
        _MMPaySdkClass_secretKey.set(this, void 0);
        _MMPaySdkClass_apiBaseUrl.set(this, void 0);
        _MMPaySdkClass_btoken.set(this, void 0);
        __classPrivateFieldSet(this, _MMPaySdkClass_appId, options.appId, "f");
        __classPrivateFieldSet(this, _MMPaySdkClass_publishableKey, options.publishableKey, "f");
        __classPrivateFieldSet(this, _MMPaySdkClass_secretKey, options.secretKey, "f");
        __classPrivateFieldSet(this, _MMPaySdkClass_apiBaseUrl, options.apiBaseUrl, "f");
    }
    /**
     * Generates an HMAC SHA256 signature for the request integrity check.
     * @private
     * @param {string} bodyString
     * @param {string} nonce
     * @returns {string}
     */
    _generateSignature(bodyString, nonce) {
        const stringToSign = `${nonce}.${bodyString}`;
        return crypto_js_1.default.HmacSHA256(stringToSign, __classPrivateFieldGet(this, _MMPaySdkClass_secretKey, "f")).toString(crypto_js_1.default.enc.Hex);
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
    async sandboxHandShake(payload) {
        const endpoint = `${__classPrivateFieldGet(this, _MMPaySdkClass_apiBaseUrl, "f")}/payments/sandbox-handshake`;
        const bodyString = JSON.stringify(payload);
        const nonce = Date.now().toString();
        const signature = this._generateSignature(bodyString, nonce);
        try {
            const response = await axios_1.default.post(endpoint, payload, {
                headers: {
                    'Authorization': `Bearer ${__classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f")}`,
                    'X-Mmpay-Nonce': nonce,
                    'X-Mmpay-Signature': signature,
                    'Content-Type': 'application/json',
                }
            });
            __classPrivateFieldSet(this, _MMPaySdkClass_btoken, response.data.token, "f");
            return response.data;
        }
        catch (error) {
            return error;
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
    async sandboxPay(params) {
        const endpoint = `${__classPrivateFieldGet(this, _MMPaySdkClass_apiBaseUrl, "f")}/payments/sandbox-create`;
        const nonce = Date.now().toString();
        let _xpayload = {
            appId: __classPrivateFieldGet(this, _MMPaySdkClass_appId, "f"),
            nonce: nonce,
            amount: params.amount,
            orderId: params.orderId,
            callbackUrl: params.callbackUrl,
            items: params.items,
        };
        const bodyString = JSON.stringify(_xpayload);
        const signature = this._generateSignature(bodyString, nonce);
        await this.sandboxHandShake({ orderId: _xpayload.orderId, nonce: nonce });
        try {
            const response = await axios_1.default.post(endpoint, _xpayload, {
                headers: {
                    'Authorization': `Bearer ${__classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f")}`,
                    'X-Mmpay-Btoken': __classPrivateFieldGet(this, _MMPaySdkClass_btoken, "f"),
                    'X-Mmpay-Nonce': nonce,
                    'X-Mmpay-Signature': signature,
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        }
        catch (error) {
            return error;
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
    async handShake(payload) {
        const endpoint = `${__classPrivateFieldGet(this, _MMPaySdkClass_apiBaseUrl, "f")}/payments/handshake`;
        const bodyString = JSON.stringify(payload);
        const nonce = Date.now().toString();
        const signature = this._generateSignature(bodyString, nonce);
        try {
            const response = await axios_1.default.post(endpoint, payload, {
                headers: {
                    'Authorization': `Bearer ${__classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f")}`,
                    'X-Mmpay-Nonce': nonce,
                    'X-Mmpay-Signature': signature,
                    'Content-Type': 'application/json',
                }
            });
            __classPrivateFieldSet(this, _MMPaySdkClass_btoken, response.data.token, "f");
            return response.data;
        }
        catch (error) {
            return error;
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
    async pay(params) {
        const endpoint = `${__classPrivateFieldGet(this, _MMPaySdkClass_apiBaseUrl, "f")}/payments/create`;
        const nonce = Date.now().toString();
        let _xpayload = {
            appId: __classPrivateFieldGet(this, _MMPaySdkClass_appId, "f"),
            nonce: nonce,
            amount: params.amount,
            orderId: params.orderId,
            callbackUrl: params.callbackUrl,
            items: params.items,
        };
        const bodyString = JSON.stringify(_xpayload);
        const signature = this._generateSignature(bodyString, nonce);
        await this.handShake({ orderId: _xpayload.orderId, nonce: _xpayload.nonce });
        try {
            const response = await axios_1.default.post(endpoint, _xpayload, {
                headers: {
                    'Authorization': `Bearer ${__classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f")}`,
                    'X-Mmpay-Btoken': __classPrivateFieldGet(this, _MMPaySdkClass_btoken, "f"),
                    'X-Mmpay-Nonce': nonce,
                    'X-Mmpay-Signature': signature,
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        }
        catch (error) {
            return error;
        }
    }
    /**
     * verifyCb
     * @param {string} payload
     * @param {string} nonce
     * @param {string} expectedSignature
     * @returns {Promise<boolean>}
     */
    async verifyCb(payload, nonce, expectedSignature) {
        if (!payload || !nonce || !expectedSignature) {
            throw new Error("Callback verification failed: Missing payload, nonce, or signature.");
        }
        const stringToSign = `${nonce}.${payload}`;
        const generatedSignature = crypto_js_1.default.HmacSHA256(stringToSign, __classPrivateFieldGet(this, _MMPaySdkClass_secretKey, "f")).toString(crypto_js_1.default.enc.Hex);
        if (generatedSignature !== expectedSignature) {
            console.error('Signature mismatch:', { generatedSignature, expectedSignature });
        }
        return (generatedSignature === expectedSignature);
    }
}
_MMPaySdkClass_appId = new WeakMap(), _MMPaySdkClass_publishableKey = new WeakMap(), _MMPaySdkClass_secretKey = new WeakMap(), _MMPaySdkClass_apiBaseUrl = new WeakMap(), _MMPaySdkClass_btoken = new WeakMap();
