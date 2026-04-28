import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateConstantsContent } from './constants-generator.js';
import { generateEnvContent } from './env-generator.js';
import { calculateDependencies } from './utils.js';

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
}

function getReadmeContent(projectName, deps) {
  return `# ${projectName}

This project was generated with Backbone CLI.

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Set up your \`.env\` file based on \`.env.example\`
3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Testing API (cURL)

You can quickly test if the server is running optimally using this cURL command:
\`\`\`bash
curl -X GET http://localhost:3000/api/health
\`\`\`

${deps.find(d => d.name === 'jsonwebtoken') ? `## Authentication
This project uses JWT authentication. You can test register/login flows at \`/api/auth/register\` and \`/api/auth/login\`.` : ''}

## Features Installed
${deps.map(d => `- **${d.name}**`).join('\n')}
`;
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
    notificationProviders = [],
    includeCrons = false
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
    // Note: The template already has bin/server.js and app.js correctly placed.

    // Remove redundant entry files under src/ to keep layout flat if any exist
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

    const features = new Set();
    const depsList = calculateDependencies(options);

    // Handle MongoDB setup
    if (database === 'mongoose') {
      const dbTemplate = path.resolve(
        __dirname,
        '../modules/db/mongoose/templates/src/config/db.js'
      );
      const targetDb = path.join(targetDir, 'src', 'config', 'db.js');
      await fs.copy(dbTemplate, targetDb);
      console.log('Added MongoDB (Mongoose) config');
      features.add('mongodb');
    }

    // Handle authentication setup
    if (includeAuth) {
        await installAuthModule(targetDir, authType, authFeatures);
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
        features.add('notifications-email');
      }

      if (notificationProviders.includes('sms')) {
        const smsConfigSrc = path.resolve(__dirname, '../templates/standard/src/config/sms.js');
        const smsConfigTarget = path.join(targetDir, 'src', 'config', 'sms.js');
        if (await fs.pathExists(smsConfigSrc)) {
          await fs.copy(smsConfigSrc, smsConfigTarget);
        }
        features.add('notifications-sms');
      }
    }

    // Handle cron setup
    if (includeCrons) {
      const cronsTemplateDir = path.resolve(__dirname, '../modules/cron/templates/src/crons');
      const targetCronsDir = path.join(targetDir, 'src', 'crons');
      await fs.copy(cronsTemplateDir, targetCronsDir);
      console.log('Added sample cron job');
      features.add('crons');
    }

    // Generate environment variables
    const envExamplePath = path.join(targetDir, '.env.example');
    const envPath = path.join(targetDir, '.env');
    const envContent = generateEnvContent({
      database,
      includeAuth,
      authFeatures,
      includeNotifications,
      notificationProviders
    });
    await fs.writeFile(envExamplePath, envContent, 'utf8');
    await fs.writeFile(envPath, envContent, 'utf8');
    console.log('Updated .env.example and created .env');

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

    // Generate README.md
    const readmeContent = getReadmeContent(projectName, depsList);
    await fs.writeFile(path.join(targetDir, 'README.md'), readmeContent, 'utf8');
    console.log('📝 Generated README.md');

    // Update package.json dynamically with latest dependencies
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const pkg = await fs.readJson(packageJsonPath);
      // Ensure we add base deps like compression
      const combinedDeps = depsList.reduce((acc, dep) => {
        acc[dep.name] = dep.version; // e.g. "express": "latest"
        return acc;
      }, {});
      pkg.dependencies = { ...pkg.dependencies, ...combinedDeps };
      await fs.writeJson(packageJsonPath, pkg, { spaces: 2 });
    }

    console.log('\n✅ Project setup complete!');
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
