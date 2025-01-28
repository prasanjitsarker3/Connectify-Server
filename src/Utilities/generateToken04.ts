"use strict";
import { createCipheriv } from "crypto";

enum ErrorCode {
  success = 0,
  appIDInvalid = 1,
  userIDInvalid = 3,
  secretInvalid = 5,
  effectiveTimeInSecondsInvalid = 6,
}

function RndNum(a: number, b: number): number {
  return Math.ceil((a + (b - a)) * Math.random());
}

function makeRandomIv(): string {
  const str = "0123456789abcdefghijklmnopqrstuvwxyz";
  const result: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = Math.floor(Math.random() * str.length);
    result.push(str.charAt(r));
  }
  return result.join("");
}

function getAlgorithmAndKey(keyBase64: string): {
  algorithm: string;
  key: Buffer;
} {
  const key = Buffer.from(keyBase64);
  let algorithm: string;

  if (key.length === 16) {
    algorithm = "aes-128-cbc";
  } else if (key.length === 24) {
    algorithm = "aes-192-cbc";
  } else if (key.length === 32) {
    algorithm = "aes-256-cbc";
  } else if (key.length < 32) {
    // Pad the key to 32 bytes for AES-256
    const paddedKey = Buffer.concat([key, Buffer.alloc(32 - key.length, 0)]);
    algorithm = "aes-256-cbc";
    return { algorithm, key: paddedKey };
  } else {
    // Trim the key to 32 bytes for AES-256
    const trimmedKey = key.slice(0, 32);
    algorithm = "aes-256-cbc";
    return { algorithm, key: trimmedKey };
  }

  return { algorithm, key };
}

function aesEncrypt(plainText: string, key: string, iv: string): ArrayBuffer {
  const { algorithm, key: fixedKey } = getAlgorithmAndKey(key);

  const cipher = createCipheriv(algorithm, fixedKey, Buffer.from(iv));
  cipher.setAutoPadding(true);
  const encrypted = cipher.update(plainText, "utf8");
  const final = cipher.final();

  return Uint8Array.from(Buffer.concat([encrypted, final])).buffer;
}

interface TokenPayload {
  [key: string]: any;
}

interface TokenInfo {
  app_id: number;
  user_id: string;
  nonce: number;
  ctime: number;
  expire: number;
  payload: TokenPayload | string;
}

export function generateToken04(
  appId: number,
  userId: string,
  secret: string,
  effectiveTimeInSeconds: number,
  payload?: TokenPayload | string
): string {
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

  const tokenInfo: TokenInfo = {
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
