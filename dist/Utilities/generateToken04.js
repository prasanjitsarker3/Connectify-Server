"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken04 = void 0;
const crypto_1 = require("crypto");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["success"] = 0] = "success";
    ErrorCode[ErrorCode["appIDInvalid"] = 1] = "appIDInvalid";
    ErrorCode[ErrorCode["userIDInvalid"] = 3] = "userIDInvalid";
    ErrorCode[ErrorCode["secretInvalid"] = 5] = "secretInvalid";
    ErrorCode[ErrorCode["effectiveTimeInSecondsInvalid"] = 6] = "effectiveTimeInSecondsInvalid";
})(ErrorCode || (ErrorCode = {}));
function RndNum(a, b) {
    return Math.ceil((a + (b - a)) * Math.random());
}
function makeRandomIv() {
    const str = "0123456789abcdefghijklmnopqrstuvwxyz";
    const result = [];
    for (let i = 0; i < 16; i++) {
        const r = Math.floor(Math.random() * str.length);
        result.push(str.charAt(r));
    }
    return result.join("");
}
function getAlgorithmAndKey(keyBase64) {
    const key = Buffer.from(keyBase64);
    let algorithm;
    if (key.length === 16) {
        algorithm = "aes-128-cbc";
    }
    else if (key.length === 24) {
        algorithm = "aes-192-cbc";
    }
    else if (key.length === 32) {
        algorithm = "aes-256-cbc";
    }
    else if (key.length < 32) {
        // Pad the key to 32 bytes for AES-256
        const paddedKey = Buffer.concat([key, Buffer.alloc(32 - key.length, 0)]);
        algorithm = "aes-256-cbc";
        return { algorithm, key: paddedKey };
    }
    else {
        // Trim the key to 32 bytes for AES-256
        const trimmedKey = key.slice(0, 32);
        algorithm = "aes-256-cbc";
        return { algorithm, key: trimmedKey };
    }
    return { algorithm, key };
}
function aesEncrypt(plainText, key, iv) {
    const { algorithm, key: fixedKey } = getAlgorithmAndKey(key);
    const cipher = (0, crypto_1.createCipheriv)(algorithm, fixedKey, Buffer.from(iv));
    cipher.setAutoPadding(true);
    const encrypted = cipher.update(plainText, "utf8");
    const final = cipher.final();
    return Uint8Array.from(Buffer.concat([encrypted, final])).buffer;
}
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
    if (!appId || typeof appId !== "number") {
        throw {
            errorCode: ErrorCode.appIDInvalid,
            errorMessage: "appID invalid",
        };
    }
    if (!userId || typeof userId !== "string") {
        throw {
            errorCode: ErrorCode.userIDInvalid,
            errorMessage: "userId invalid",
        };
    }
    if (!secret || typeof secret !== "string" || secret.length !== 35) {
        throw {
            errorCode: ErrorCode.secretInvalid,
            errorMessage: "secret must be a 35-byte string",
        };
    }
    if (!effectiveTimeInSeconds || typeof effectiveTimeInSeconds !== "number") {
        throw {
            errorCode: ErrorCode.effectiveTimeInSecondsInvalid,
            errorMessage: "effectiveTimeInSeconds invalid",
        };
    }
    const createTime = Math.floor(Date.now() / 1000);
    const tokenInfo = {
        app_id: appId,
        user_id: userId,
        nonce: RndNum(-2147483648, 2147483647),
        ctime: createTime,
        expire: createTime + effectiveTimeInSeconds,
        payload: payload || "",
    };
    const plainText = JSON.stringify(tokenInfo);
    const iv = makeRandomIv();
    const encryptBuf = aesEncrypt(plainText, secret, iv);
    const b1 = new Uint8Array(8);
    const b2 = new Uint8Array(2);
    const b3 = new Uint8Array(2);
    new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false);
    new DataView(b2.buffer).setUint16(0, iv.length, false);
    new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false);
    const buf = Buffer.concat([
        Buffer.from(b1),
        Buffer.from(b2),
        Buffer.from(iv),
        Buffer.from(b3),
        Buffer.from(encryptBuf),
    ]);
    return "04" + Buffer.from(buf).toString("base64");
}
exports.generateToken04 = generateToken04;
