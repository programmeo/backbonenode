#!/usr/bin/env node
/**
 * Entry point for the backbone CLI
 */

import { askProjectQuestions } from '../core/prompts.js';
import { generateProject } from '../core/generator.js';

(async () => {
  try {
    // ask the user questions (project name, db)
    const answers = await askProjectQuestions();

    // generate the project based on answers
    await generateProject(answers);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
