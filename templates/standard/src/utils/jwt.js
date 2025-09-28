import jwt from 'jsonwebtoken';
import { CONSTANTS } from '../config/constants.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, CONSTANTS.JWT_SECRET, { expiresIn: CONSTANTS.JWT_ACCESS_EXPIRY });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, CONSTANTS.JWT_REFRESH_SECRET, { expiresIn: CONSTANTS.JWT_REFRESH_EXPIRY });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, CONSTANTS.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, CONSTANTS.JWT_REFRESH_SECRET);
}

export default { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
