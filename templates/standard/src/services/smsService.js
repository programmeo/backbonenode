import { getTwilioClient } from '../config/sms.js';

/**
 * Send SMS using Twilio
 * - options: { from, to, body }
 */
export async function sendSms({ from, to, body } = {}) {
  const client = getTwilioClient();
  const msg = await client.messages.create({ from, to, body });
  return msg;
}

export default { sendSms };
