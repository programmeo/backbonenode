import twilio from 'twilio';
import { CONSTANTS } from './constants.js';

export function getTwilioClient() {
  const sid = CONSTANTS.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
  const token = CONSTANTS.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error('Twilio credentials are not set in environment variables');
  }
  return twilio(sid, token);
}

export default { getTwilioClient };
