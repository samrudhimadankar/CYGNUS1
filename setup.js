#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Interstellar Trade Route Simulator...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies:', error.message);
  process.exit(1);
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('npm run install-all', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies:', error.message);
  process.exit(1);
}

// Create .env file for server if it doesn't exist
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚙️  Creating server environment file...');
  const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/interstellar_trade
NODE_ENV=development
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created');
}

// Create .env file for client if it doesn't exist
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  console.log('\n⚙️  Creating client environment file...');
  const clientEnvContent = `REACT_APP_API_URL=http://localhost:5000/api
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Client environment file created');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Run "npm run dev" to start both frontend and backend');
console.log('3. Open http://localhost:3000 in your browser');
console.log('\n🌟 Happy trading across the galaxy!');
