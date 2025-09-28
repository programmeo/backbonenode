import inquirer from 'inquirer';

/**
 * Prompt user for project configuration including:
 * - Project name
 * - Database choice
 * - Authentication options
 */
export async function askProjectQuestions() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input) => !!input || 'Please enter a project name.'
    },
    {
      type: 'list',
      name: 'database',
      message: 'Select a database:',
      choices: [
        { name: 'MongoDB (Mongoose)', value: 'mongoose' }
      ],
      default: 'mongoose'
    },
    {
      type: 'confirm',
      name: 'includeAuth',
      message: 'Would you like to include authentication?',
      default: true
    },
    {
      type: 'list',
      name: 'authType',
      message: 'Select authentication type:',
      choices: [
        { name: 'JWT Authentication', value: 'jwt' },
        { name: 'Session-based Authentication', value: 'session' }
      ],
      default: 'jwt',
      when: (answers) => answers.includeAuth
    },
    {
      type: 'checkbox',
      name: 'authFeatures',
      message: 'Select additional authentication features:',
      choices: [
        { name: 'Password Reset', value: 'passwordReset', checked: true },
        { name: 'OTP (email/SMS)', value: 'otp' },
        { name: 'OAuth (Google)', value: 'googleOAuth' },
        { name: 'Magic Link Login', value: 'magicLink' }
      ],
      when: (answers) => answers.includeAuth
    }
    ,
    {
      type: 'confirm',
      name: 'includeNotifications',
      message: 'Would you like to include notifications (email/SMS)?',
      default: false
    },
    {
      type: 'checkbox',
      name: 'notificationProviders',
      message: 'Select notification providers to include:',
      choices: [
        { name: 'Email (Nodemailer)', value: 'email' },
        { name: 'SMS (Twilio)', value: 'sms' }
      ],
      when: (answers) => answers.includeNotifications
    }
  ]);
  return answers;
}
