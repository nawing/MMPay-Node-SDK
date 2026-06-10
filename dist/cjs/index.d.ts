import { EventEmitter } from 'node:events';
import { CallbackIncomingData, HandShakeRequest, HandShakeResponse, PayCancelRequest, PayCancelResponse, PayGetRequest, PayGetResponse, PaymentRequest, PaymentResponse, SDKOptions } from './types';
export declare function MMPaySDK(options: SDKOptions): MMPaySdkClass;
declare class MMPaySdkClass extends EventEmitter {
    #private;
    constructor(options: SDKOptions);
    _generateSignature(bodyString: string, nonce: string): string;
    listen(payload: string, nonce: string, expectedSignature: string): Promise<this>;
    onTxCreate(cb: (tx: CallbackIncomingData) => void): this;
    onTxSuccess(cb: (tx: CallbackIncomingData) => void): this;
    onTxFail(cb: (tx: CallbackIncomingData) => void): this;
    onTxRefund(cb: (tx: CallbackIncomingData) => void): this;
    onTxCancel(cb: (tx: CallbackIncomingData) => void): this;
    onTxExpire(cb: (tx: CallbackIncomingData) => void): this;
    onHeartbeat(cb: (tx: CallbackIncomingData) => void): this;
    handShake(payload: HandShakeRequest): Promise<HandShakeResponse>;
    pay(params: PaymentRequest): Promise<PaymentResponse>;
    get(params: PayGetRequest): Promise<PayGetResponse>;
    cancel(params: PayCancelRequest): Promise<PayCancelResponse>;
    verifyCb(payload: string, nonce: string, expectedSignature: string): Promise<boolean>;
}
export {};
