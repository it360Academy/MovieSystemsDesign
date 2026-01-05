const { exec } = require('child_process');
exec('python main.py', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) console.error(stderr);
  console.log(stdout);
});

