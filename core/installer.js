import { spawn } from 'child_process';

export function installDependencies(deps, cwd) {
  // Install the latest versions by pinning to `@latest`
  const latestDeps = deps.map(d => d.endsWith('@latest') ? d : `${d}@latest`);
  console.log('Installing dependencies (latest):', latestDeps.join(', '));
  const child = spawn('npm', ['install', ...latestDeps], {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`npm install exited with code ${code}`);
    } else {
      console.log('Dependencies installed.');
    }
  });
}
