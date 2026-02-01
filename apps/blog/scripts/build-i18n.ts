import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const localesDir = path.join(__dirname, '../src/i18n/locales');
const locales = ['ja', 'en'];

for (const locale of locales) {
  const ymlPath = path.join(localesDir, `${locale}.yml`);
  const jsonPath = path.join(localesDir, `${locale}.json`);

  if (!fs.existsSync(ymlPath)) {
    console.error(`File not found: ${ymlPath}`);
    process.exit(1);
  }

  const ymlContent = fs.readFileSync(ymlPath, 'utf8');
  const jsonContent = yaml.load(ymlContent);
  fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
  console.log(`Generated: ${jsonPath}`);
}

console.log('i18n build completed.');
