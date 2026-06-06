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
var _MMPaySdkClass_appId, _MMPaySdkClass_publishableKey, _MMPaySdkClass_secretKey, _MMPaySdkClass_apiBaseUrl, _MMPaySdkClass_isSandbox, _MMPaySdkClass_btoken;
import { createHmac } from 'node:crypto';
import { EventEmitter } from 'node:events';
export function MMPaySDK(options) {
    return new MMPaySdkClass({
        appId: options.appId,
        publishableKey: options.publishableKey,
        secretKey: options.secretKey,
        apiBaseUrl: options.apiBaseUrl,
    });
}
class MMPaySdkClass extends EventEmitter {
    constructor(options) {
        super();
        _MMPaySdkClass_appId.set(this, void 0);
        _MMPaySdkClass_publishableKey.set(this, void 0);
        _MMPaySdkClass_secretKey.set(this, void 0);
        _MMPaySdkClass_apiBaseUrl.set(this, void 0);
        _MMPaySdkClass_isSandbox.set(this, void 0);
        _MMPaySdkClass_btoken.set(this, void 0);
        __classPrivateFieldSet(this, _MMPaySdkClass_appId, options.appId, "f");
        __classPrivateFieldSet(this, _MMPaySdkClass_publishableKey, options.publishableKey, "f");
        __classPrivateFieldSet(this, _MMPaySdkClass_secretKey, options.secretKey, "f");
        __classPrivateFieldSet(this, _MMPaySdkClass_apiBaseUrl, options.apiBaseUrl, "f");
        __classPrivateFieldSet(this, _MMPaySdkClass_isSandbox, __classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f").includes('_test_') || __classPrivateFieldGet(this, _MMPaySdkClass_secretKey, "f").includes('_test_'), "f");
    }
    _generateSignature(bodyString, nonce) {
        const stringToSign = `${nonce}.${bodyString}`;
        return createHmac('sha256', __classPrivateFieldGet(this, _MMPaySdkClass_secretKey, "f"))
            .update(stringToSign)
            .digest('hex');
    }
    async listen(payload, nonce, expectedSignature) {
        try {
            const isValid = await this.verifyCb(payload, nonce, expectedSignature);
            if (!isValid) {
                this.emit('error', new Error('Signature verification failed'));
                return this;
            }
            const tx = JSON.parse(payload);
            switch (tx.status) {
                case 'PENDING':
                    this.emit('tx:create', tx);
                    break;
                case 'SUCCESS':
                    if (tx.condition === 'TOUCHED') {
                        this.emit('tx:heartbeat', tx);
                    }
                    else {
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
        }
        catch (err) {
            this.emit('error', err);
        }
        return this;
    }
    onTxCreate(cb) {
        this.on('tx:create', cb);
        return this;
    }
    onTxSuccess(cb) {
        this.on('tx:success', cb);
        return this;
    }
    onTxFail(cb) {
        this.on('tx:failed', cb);
        return this;
    }
    onTxRefund(cb) {
        this.on('tx:refunded', cb);
        return this;
    }
    onTxCancel(cb) {
        this.on('tx:cancel', cb);
        return this;
    }
    onTxExpire(cb) {
        this.on('tx:expire', cb);
        return this;
    }
    onHeartbeat(cb) {
        this.on('tx:heartbeat', cb);
        return this;
    }
    async handShake(payload) {
        const segment = __classPrivateFieldGet(this, _MMPaySdkClass_isSandbox, "f") ? 'sandbox-handshake' : 'handshake';
        const endpoint = `${__classPrivateFieldGet(this, _MMPaySdkClass_apiBaseUrl, "f")}/payments/${segment}`;
        const bodyString = JSON.stringify(payload);
        const nonce = Date.now().toString();
        const signature = this._generateSignature(bodyString, nonce);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: bodyString,
                headers: {
                    'Authorization': `Bearer ${__classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f")}`,
                    'X-Mmpay-Nonce': nonce,
                    'X-Mmpay-Signature': signature,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (!response.ok)
                throw data;
            __classPrivateFieldSet(this, _MMPaySdkClass_btoken, data.token, "f");
            return data;
        }
        catch (error) {
            return error;
        }
    }
    async pay(params) {
        const segment = __classPrivateFieldGet(this, _MMPaySdkClass_isSandbox, "f") ? 'sandbox-create' : 'create';
        const endpoint = `${__classPrivateFieldGet(this, _MMPaySdkClass_apiBaseUrl, "f")}/payments/${segment}`;
        const nonce = Date.now().toString();
        let _xpayload = {
            appId: __classPrivateFieldGet(this, _MMPaySdkClass_appId, "f"),
            nonce: nonce,
            amount: params.amount,
            orderId: params.orderId,
            callbackUrl: params.callbackUrl,
            customMessage: params.customMessage,
            items: params.items,
        };
        const bodyString = JSON.stringify(_xpayload);
        const signature = this._generateSignature(bodyString, nonce);
        await this.handShake({ orderId: _xpayload.orderId, nonce: _xpayload.nonce });
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: bodyString,
                headers: {
                    'Authorization': `Bearer ${__classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f")}`,
                    'X-Mmpay-Btoken': __classPrivateFieldGet(this, _MMPaySdkClass_btoken, "f"),
                    'X-Mmpay-Nonce': nonce,
                    'X-Mmpay-Signature': signature,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (!response.ok)
                throw data;
            return data;
        }
        catch (error) {
            return error;
        }
    }
    async get(params) {
        const segment = __classPrivateFieldGet(this, _MMPaySdkClass_isSandbox, "f") ? 'sandbox-get' : 'get';
        const endpoint = `${__classPrivateFieldGet(this, _MMPaySdkClass_apiBaseUrl, "f")}/payments/${segment}`;
        const nonce = Date.now().toString();
        let _xpayload = {
            orderId: params.orderId,
            nonce: nonce
        };
        const bodyString = JSON.stringify(_xpayload);
        const signature = this._generateSignature(bodyString, nonce);
        await this.handShake({ orderId: _xpayload.orderId, nonce: _xpayload.nonce });
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: bodyString,
                headers: {
                    'Authorization': `Bearer ${__classPrivateFieldGet(this, _MMPaySdkClass_publishableKey, "f")}`,
                    'X-Mmpay-Btoken': __classPrivateFieldGet(this, _MMPaySdkClass_btoken, "f"),
                    'X-Mmpay-Nonce': nonce,
                    'X-Mmpay-Signature': signature,
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (!response.ok)
                throw data;
            return data;
        }
        catch (error) {
            return error;
        }
    }
    async verifyCb(payload, nonce, expectedSignature) {
        if (!payload || !nonce || !expectedSignature) {
            throw new Error("Callback verification failed: Missing payload, nonce, or signature.");
        }
        const stringToSign = `${nonce}.${payload}`;
        const generatedSignature = createHmac('sha256', __classPrivateFieldGet(this, _MMPaySdkClass_secretKey, "f"))
            .update(stringToSign)
            .digest('hex');
        if (generatedSignature !== expectedSignature) {
            console.error('Signature mismatch:', { generatedSignature, expectedSignature });
        }
        return (generatedSignature === expectedSignature);
    }
}
_MMPaySdkClass_appId = new WeakMap(), _MMPaySdkClass_publishableKey = new WeakMap(), _MMPaySdkClass_secretKey = new WeakMap(), _MMPaySdkClass_apiBaseUrl = new WeakMap(), _MMPaySdkClass_isSandbox = new WeakMap(), _MMPaySdkClass_btoken = new WeakMap();
