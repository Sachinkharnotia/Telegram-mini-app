const { spawn } = require('child_process');

const proc = spawn('npx', ['--yes', 'cloudflared', 'tunnel', '--protocol', 'http2', '--url', 'http://localhost:5173'], {
  shell: true
});

proc.stderr.on('data', (data) => {
  const str = data.toString();
  console.log(str);
});

proc.stdout.on('data', (data) => {
  const str = data.toString();
  console.log(str);
});
