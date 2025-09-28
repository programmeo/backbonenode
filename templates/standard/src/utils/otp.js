import crypto from 'crypto';
import { CONSTANTS } from '../config/constants.js';

export function generateOtp(length = CONSTANTS.OTP_LENGTH) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)];
  return otp;
}

export function generateMagicLinkToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function isOtpExpired(expiresAt) {
  return !expiresAt || Date.now() > new Date(expiresAt).getTime();
}

export default { generateOtp, generateMagicLinkToken, isOtpExpired };
