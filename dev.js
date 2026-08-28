import { spawn } from 'child_process';

const rawArgs = process.argv.slice(2);
const transformedArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--host') {
    transformedArgs.push('-H');
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      transformedArgs.push(rawArgs[i + 1]);
      i++;
    }
  } else if (arg.startsWith('--host=')) {
    transformedArgs.push('-H', arg.slice(7));
  } else {
    transformedArgs.push(arg);
  }
}

if (!transformedArgs.includes('-p') && !transformedArgs.includes('--port')) {
  transformedArgs.push('-p', '3000');
}
if (!transformedArgs.includes('-H') && !transformedArgs.includes('--hostname')) {
  transformedArgs.push('-H', '0.0.0.0');
}

const child = spawn('npx', ['next', 'dev', ...transformedArgs], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '3000',
  },
  shell: true,
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
process.on('SIGINT', () => {
  child.kill('SIGINT');
});

child.on('exit', (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
