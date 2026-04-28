#!/usr/bin/env node
/**
 * Entry point for the backbone CLI
 */

import inquirer from 'inquirer';
import { askProjectQuestions } from '../core/prompts.js';
import { generateProject } from '../core/generator.js';
import { calculateDependencies } from '../core/utils.js';

(async () => {
  try {
    // ask the user questions (project name, db)
    const answers = await askProjectQuestions();

    const deps = calculateDependencies(answers);
    
    console.log('\n📦 The following modules will be added to your project:');
    console.table(deps);

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed and set up the project?',
        default: true
      }
    ]);

    if (!proceed) {
      console.log('Project setup cancelled.');
      process.exit(0);
    }

    // generate the project based on answers
    await generateProject(answers);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
