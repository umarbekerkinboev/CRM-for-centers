import fs from 'fs';
import path from 'path';

const i18nContent = fs.readFileSync('src/i18n.ts', 'utf8');
const enMatch = i18nContent.match(/en:\s*{\s*translation:\s*{([^}]*)}/);
if (!enMatch) {
  console.log("Could not find en translations");
  process.exit(1);
}
const enTranslations = enMatch[1];
const definedKeys = [...enTranslations.matchAll(/"([^"]+)":/g)].map(m => m[1]);

const usedKeys = new Set<string>();
function scanDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = [...content.matchAll(/\bt\('([^']+)'\)/g)];
      for (const match of matches) {
        usedKeys.add(match[1]);
      }
    }
  }
}
scanDir('src');

const missingKeys = [...usedKeys].filter(key => !definedKeys.includes(key));
console.log('Missing keys:', missingKeys);
