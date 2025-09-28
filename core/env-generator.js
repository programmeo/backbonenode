/**
 * Generate environment variables template content
 */
export function generateEnvContent(options) {
  const { database, includeAuth, authFeatures, includeNotifications, notificationProviders } = options;
  
  const lines = [
    '###########################################',
    '# BackBone Generated Environment Variables',
    '###########################################',
    '',
    '# Core Application Settings',
    'NODE_ENV=development',
    'PORT=3000',
    '',
  ];

  if (database === 'mongoose') {
    lines.push(
      '# Database Configuration',
      'MONGODB_URI=mongodb://127.0.0.1:27017/your-database',
      '',
    );
  }

  if (includeAuth) {
    lines.push(
      '# JWT Authentication',
      'JWT_SECRET=your-super-secret-jwt-key',
      'JWT_REFRESH_SECRET=your-super-secret-refresh-key',
      'JWT_ACCESS_EXPIRY=15m',
      'JWT_REFRESH_EXPIRY=7d',
      '',
      '# Password Reset',
      'PASSWORD_RESET_SECRET=your-password-reset-secret',
      'PASSWORD_RESET_EXPIRY=1h',
      '',
      '# Security Settings',
      'RATE_LIMIT_WINDOW=900000  # 15 minutes in milliseconds',
      'RATE_LIMIT_MAX=100',
      '',
    );

    if (authFeatures?.includes('googleOAuth')) {
      lines.push(
        '# Google OAuth',
        'GOOGLE_CLIENT_ID=your-google-client-id',
        'GOOGLE_CLIENT_SECRET=your-google-client-secret',
        'GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback',
        '',
      );
    }

    if (authFeatures?.includes('otp') || authFeatures?.includes('magicLink')) {
      lines.push(
        '# OTP / Magic Link settings',
        'OTP_LENGTH=6',
        'OTP_EXPIRY=300000 # milliseconds (5 minutes)',
        'MAGIC_LINK_EXPIRY=900000 # milliseconds (15 minutes)',
        ''
      );
    }
  }

  if (includeNotifications) {
    if (notificationProviders?.includes('email')) {
      lines.push(
        '# Email (Nodemailer)',
        'EMAIL_HOST=smtp.example.com',
        'EMAIL_PORT=587',
        'EMAIL_USER=you@example.com',
        'EMAIL_PASS=super-secret-password',
        'EMAIL_FROM=Your App <noreply@example.com>',
        'EMAIL_SECURE=false  # set true if using port 465',
        ''
      );
    }

    if (notificationProviders?.includes('sms')) {
      lines.push(
        '# SMS (Twilio)',
        'TWILIO_ACCOUNT_SID=your-twilio-sid',
        'TWILIO_AUTH_TOKEN=your-twilio-auth-token',
        'TWILIO_PHONE_NUMBER=+1234567890',
        ''
      );
    }
  }

  return lines.join('\n');
}