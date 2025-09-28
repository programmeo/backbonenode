import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { installDependencies } from './installer.js';
import { generateConstantsContent } from './constants-generator.js';
import { generateEnvContent } from './env-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Formats environment variable key-value pairs
 */
function formatEnvPair(key, value = '') {
  return `${key}=${value}`;
}

/**
 * Install authentication module with selected features
 */
async function installAuthModule(targetDir, authType, authFeatures) {
  const authTemplateDir = path.resolve(__dirname, '../modules/auth/templates');
  
  // Copy auth module files
  await fs.copy(authTemplateDir, targetDir);
  console.log(`Added authentication module (${authType})`);
  
  // Return auth-specific dependencies
  const dependencies = [
    'jsonwebtoken',
    'bcryptjs',
    'express-rate-limit',
    'helmet'
  ];

  if (authType === 'session') {
    dependencies.push(
      'express-session',
      'connect-mongo'
    );
  }

  if (authFeatures.includes('googleOAuth')) {
    dependencies.push('passport', 'passport-google-oauth20');
  }

  return dependencies;
}

/**
 * Generate a new backend project with selected features
 */
export async function generateProject(options) {
  const {
    projectName,
    database,
    includeAuth,
    authType,
    authFeatures = [],
    includeNotifications = false,
    notificationProviders = []
  } = options;

  const targetDir = path.resolve(process.cwd(), projectName);
  const templateDir = path.resolve(__dirname, '../templates/standard');
  
  // Validate project creation
  if (await fs.pathExists(targetDir)) {
    throw new Error(`Directory already exists: ${targetDir}`);
  }

  try {
    // Create project structure
    await fs.copy(templateDir, targetDir);
    // Ensure root-level entrypoints are present (app.js, server.js)
    const rootAppSrc = path.resolve(templateDir, 'app.js');
    const rootServerSrc = path.resolve(templateDir, 'server.js');
    if (await fs.pathExists(rootAppSrc)) {
      await fs.copy(rootAppSrc, path.join(targetDir, 'app.js'));
    }
    if (await fs.pathExists(rootServerSrc)) {
      await fs.copy(rootServerSrc, path.join(targetDir, 'server.js'));
    }
    // Remove redundant entry files under src/ to keep layout flat
    const redundant = [
      path.join(targetDir, 'src', 'app.js'),
      path.join(targetDir, 'src', 'server.js'),
      path.join(targetDir, 'src', 'index.js')
    ];
    for (const p of redundant) {
      if (await fs.pathExists(p)) {
        await fs.remove(p);
      }
    }
    console.log(`Created project folder: ${projectName}`);

    // Initialize features map and dependencies
    const features = new Set();
    let dependencies = [];

    // Handle MongoDB setup
    if (database === 'mongoose') {
      const dbTemplate = path.resolve(
        __dirname,
        '../modules/db/mongoose/templates/src/config/db.js'
      );
      const targetDb = path.join(targetDir, 'src', 'config', 'db.js');
      await fs.copy(dbTemplate, targetDb);
      console.log('Added MongoDB (Mongoose) config');
      dependencies.push('mongoose');
      features.add('mongodb');
    }

    // Handle authentication setup
    if (includeAuth) {
        const authDeps = await installAuthModule(targetDir, authType, authFeatures);
        dependencies = [...dependencies, ...authDeps];
        // Remove deprecated authConstants if present in copied templates
        const maybeAuthConstants = path.join(targetDir, 'src', 'config', 'authConstants.js');
        if (await fs.pathExists(maybeAuthConstants)) {
          await fs.remove(maybeAuthConstants);
        }
        // Ensure roles config is present in generated project
        const rolesSource = path.resolve(__dirname, '../templates/standard/src/config/roles.js');
        const rolesTarget = path.join(targetDir, 'src', 'config', 'roles.js');
        await fs.copy(rolesSource, rolesTarget);
      features.add('auth');
    }

    // Handle notifications setup
    if (includeNotifications) {
      if (notificationProviders.includes('email')) {
        // copy email config template
        const emailConfigSrc = path.resolve(__dirname, '../templates/standard/src/config/email.js');
        const emailConfigTarget = path.join(targetDir, 'src', 'config', 'email.js');
        if (await fs.pathExists(emailConfigSrc)) {
          await fs.copy(emailConfigSrc, emailConfigTarget);
        }
        dependencies.push('nodemailer');
        // ejs is used for optional templating support
        dependencies.push('ejs');
        features.add('notifications-email');
      }

      if (notificationProviders.includes('sms')) {
        const smsConfigSrc = path.resolve(__dirname, '../templates/standard/src/config/sms.js');
        const smsConfigTarget = path.join(targetDir, 'src', 'config', 'sms.js');
        if (await fs.pathExists(smsConfigSrc)) {
          await fs.copy(smsConfigSrc, smsConfigTarget);
        }
        dependencies.push('twilio');
        features.add('notifications-sms');
      }
    }

    // Install all dependencies at once
    if (dependencies.length > 0) {
      await installDependencies(dependencies, targetDir);
    }

    // Generate environment variables
    const envPath = path.join(targetDir, '.env.example');
    const envContent = generateEnvContent({
      database,
      includeAuth,
      authFeatures,
      includeNotifications,
      notificationProviders
    });
    await fs.writeFile(envPath, envContent, 'utf8');
    console.log('Updated .env.example');

    // Generate constants file
    const constantsPath = path.join(targetDir, 'src', 'config', 'constants.js');
    const constantsContent = generateConstantsContent({
      database,
      includeAuth,
      authFeatures,
      includeNotifications,
      notificationProviders
    });

    await fs.outputFile(constantsPath, constantsContent);
    console.log('🔧 Generated src/config/constants.js');

    console.log('\nProject setup complete!');
    console.log('Installed features:', Array.from(features).join(', '));
    console.log('\nTo get started:');
    console.log(`cd ${projectName}`);
    console.log('npm install');
    console.log('npm run dev');

  } catch (error) {
    console.error('Error generating project:', error.message);
    // Clean up on failure
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
    }
    throw error;
  }
}
