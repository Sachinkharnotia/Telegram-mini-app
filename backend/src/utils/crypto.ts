import { ethers } from 'ethers';
import * as crypto from 'crypto';

export const validateWalletAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

export const encryptSensitiveData = (data: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    iv
  );
  
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const verifyTelegramData = (
  data: Record<string, string>,
  botToken: string
): boolean => {
  if (!data.hash) return false;
  
  const checkString = Object.keys(data)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
    
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');
  
  return hash === data.hash;
};
