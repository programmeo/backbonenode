import fs from 'fs/promises';
import path from 'path';
import ejs from 'ejs';
import { getTransporter } from '../config/email.js';

/**
 * Send email using nodemailer.
 * - mailOptions: { from, to, cc, subject, html, text }
 * - templatePath: optional path under project `templates/` to render if html not provided
 * - infoObject: data passed to EJS template
 */
export async function sendEmail({ mailOptions = {}, templatePath, infoObject = {} } = {}) {
  const transporter = getTransporter();

  // If no html provided and templatePath is provided, render template
  if (!mailOptions.html && templatePath) {
    const tplPath = path.resolve(process.cwd(), templatePath);
    const tplSource = await fs.readFile(tplPath, 'utf8');
    mailOptions.html = await ejs.render(tplSource, infoObject);
  }

  // Send mail
  const info = await transporter.sendMail(mailOptions);
  return info;
}

export default { sendEmail };
