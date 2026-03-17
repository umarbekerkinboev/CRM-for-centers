const fs = require('fs');
const path = require('path');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, filesList);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      filesList.push(filePath);
    }
  }
  return filesList;
}

const files = getFiles('./src');
const usedKeys = new Set();

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const regex = /t\('([^']+)'\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

const i18nContent = fs.readFileSync('./src/i18n.ts', 'utf-8');
const definedKeys = new Set();
const keyRegex = /"([^"]+)":/g;
let match;
while ((match = keyRegex.exec(i18nContent)) !== null) {
  definedKeys.add(match[1]);
}

const missingKeys = [...usedKeys].filter(key => !definedKeys.has(key));
console.log('Missing keys:', missingKeys);
