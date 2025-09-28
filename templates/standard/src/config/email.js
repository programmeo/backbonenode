import nodemailer from 'nodemailer';
import { CONSTANTS } from './constants.js';

/**
 * Create and return a nodemailer transporter configured from environment constants.
 */
export function getTransporter() {
  const transporter = nodemailer.createTransport({
    host: CONSTANTS.EMAIL_HOST || process.env.EMAIL_HOST,
    port: Number(CONSTANTS.EMAIL_PORT || process.env.EMAIL_PORT || 587),
    secure: (CONSTANTS.EMAIL_SECURE === 'true') || false, // true for 465, false for other ports
    auth: {
      user: CONSTANTS.EMAIL_USER || process.env.EMAIL_USER,
      pass: CONSTANTS.EMAIL_PASS || process.env.EMAIL_PASS
    }
  });

  return transporter;
}

export default { getTransporter };
