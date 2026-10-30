const { spawn } = require('child_process');
const c = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "echo 'DSH_SOVEREIGN_SHELL_OK'"]);
let o = '';
c.stdout.on('data', d => o += d.toString());
c.stderr.on('data', d => console.error('ERR:', d.toString()));
c.on('close', code => console.log('CODE:', code, 'OUT:', o));
c.on('error', e => console.log('ERR_EV:', e.message));
