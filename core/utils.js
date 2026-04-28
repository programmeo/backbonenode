export function calculateDependencies(answers) {
  const { database, includeAuth, authType, authFeatures = [], includeNotifications, notificationProviders = [], includeCrons } = answers;
  
  // Base dependencies that come with every project
  const deps = [
    { name: 'express', version: 'latest' },
    { name: 'dotenv', version: 'latest' },
    { name: 'cors', version: 'latest' },
    { name: 'helmet', version: 'latest' },
    { name: 'compression', version: 'latest' },
    { name: 'express-rate-limit', version: 'latest' }
  ];

  if (database === 'mongoose') {
    deps.push({ name: 'mongoose', version: 'latest' });
  }

  if (includeAuth) {
    deps.push({ name: 'jsonwebtoken', version: 'latest' });
    deps.push({ name: 'bcryptjs', version: 'latest' });
    
    if (authType === 'session') {
      deps.push({ name: 'express-session', version: 'latest' });
      deps.push({ name: 'connect-mongo', version: 'latest' });
    }
    
    if (authFeatures.includes('googleOAuth')) {
      deps.push({ name: 'passport', version: 'latest' });
      deps.push({ name: 'passport-google-oauth20', version: 'latest' });
    }
  }

  if (includeNotifications) {
    if (notificationProviders.includes('email')) {
      deps.push({ name: 'nodemailer', version: 'latest' });
      deps.push({ name: 'ejs', version: 'latest' });
    }
    if (notificationProviders.includes('sms')) {
      deps.push({ name: 'twilio', version: 'latest' });
    }
  }

  if (includeCrons) {
    deps.push({ name: 'node-cron', version: 'latest' });
  }

  return deps;
}
