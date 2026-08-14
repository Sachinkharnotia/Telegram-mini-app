const { spawn } = require('child_process');

const npx = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--url', 'http://localhost:5173'], {
  shell: true,
  stdio: 'pipe'
});

npx.stdout.on('data', (data) => {
  console.log(data.toString());
});

npx.stderr.on('data', (data) => {
  console.log(data.toString());
});

npx.on('exit', (code) => {
  console.log(`Cloudflared exited with code ${code}`);
});
