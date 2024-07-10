const path = require('path');
const electronInstaller = require('electron-winstaller');

const rootPath = path.join(__dirname, '/');
const outPath = path.join(rootPath, 'dist');

async function createInstaller() {
  console.log('Starting installer creation...');
  console.log(`Root path: ${rootPath}`);
  console.log(`Output path: ${outPath}`);
  console.log('Checking app directory content...');
  const appDirectory = path.join(outPath, 'EZHost-win32-x64/');
  const fs = require('fs');

  if (!fs.existsSync(appDirectory)) {
    console.error('App directory does not exist. Please ensure the app is packaged correctly.');
    return;
  }

  const files = fs.readdirSync(appDirectory);
  console.log(`App directory contains: ${files.join(', ')}`);

  try {
    await electronInstaller.createWindowsInstaller({
      appDirectory: appDirectory, // Path to the folder containing your packaged app
      outputDirectory: path.join(outPath, 'installer'),
      authors: 'Daniel Gebura',
      exe: 'EZHost.exe', // Your main executable file
      description: 'Manage and control local minecraft servers with ease',
      noMsi: true,
      setupExe: 'EZHostInstaller.exe', // Name for the installer executable
      setupIcon: path.join(rootPath, 'app', 'public', 'favicon.ico') // Path to your app icon
    });
    console.log('Installer created successfully!');
  } catch (e) {
    console.error(`Error creating installer: ${e.message}`);
  }
}

createInstaller();
