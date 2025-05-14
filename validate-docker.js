/**
 * Docker Setup Validation Script
 * 
 * This script checks if all necessary files and configurations 
 * are in place for Docker deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of required files for Docker setup
const requiredFiles = [
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.prod.yml',
  '.dockerignore',
  '.env.example',
  'package.json',
  'package-lock.json',
  'server.js',
];

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

// Function to check if a directory exists
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!dirExists(logsDir)) {
  console.log(`Creating logs directory: ${logsDir}`);
  fs.mkdirSync(logsDir, { recursive: true });
}

// Check required files
console.log('Checking required files...');
let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fileExists(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    allFilesExist = false;
  }
}

// Check server.js for health endpoint
if (fileExists(path.join(__dirname, 'server.js'))) {
  const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  if (serverContent.includes('/health')) {
    console.log('✅ Health endpoint detected in server.js');
  } else {
    console.log('❌ Health endpoint not found in server.js');
    allFilesExist = false;
  }
}

// Check package.json for build scripts
if (fileExists(path.join(__dirname, 'package.json'))) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ Build script found in package.json');
  } else {
    console.log('❌ Build script missing in package.json');
    allFilesExist = false;
  }
}

// Final result
if (allFilesExist) {
  console.log('\n✅ All Docker setup files are in place. You should be able to build and run the Docker image successfully.');
} else {
  console.log('\n❌ Some files are missing or incorrectly configured. Please fix the issues above before building the Docker image.');
}

console.log('\nValidation complete!');