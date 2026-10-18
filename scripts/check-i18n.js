import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../public/locales');
const enPath = path.join(localesDir, 'en', 'translation.json');

if (!fs.existsSync(enPath)) {
  console.error(`Base English translation file not found at ${enPath}`);
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys.push(...getKeys(obj[k], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const enKeys = new Set(getKeys(en));
console.log(`Checking i18n key parity against base 'en' (${enKeys.size} keys)...`);

const localeDirs = fs
  .readdirSync(localesDir)
  .filter((d) => d !== 'en' && fs.statSync(path.join(localesDir, d)).isDirectory());

let hasError = false;

for (const locale of localeDirs) {
  const localeFile = path.join(localesDir, locale, 'translation.json');
  if (!fs.existsSync(localeFile)) {
    console.error(`[FAIL] ${locale}: Missing translation.json file`);
    hasError = true;
    continue;
  }

  try {
    const localeJson = JSON.parse(fs.readFileSync(localeFile, 'utf8'));
    const localeKeys = new Set(getKeys(localeJson));

    const missing = [...enKeys].filter((k) => !localeKeys.has(k));
    const extra = [...localeKeys].filter((k) => !enKeys.has(k));

    if (missing.length > 0 || extra.length > 0) {
      hasError = true;
      console.error(`[FAIL] ${locale} (${localeKeys.size}/${enKeys.size} keys):`);
      if (missing.length > 0) {
        console.error(`  Missing keys (${missing.length}):`, missing);
      }
      if (extra.length > 0) {
        console.error(`  Extra keys (${extra.length}):`, extra);
      }
    } else {
      console.log(`[PASS] ${locale}: All ${localeKeys.size} keys matched.`);
    }
  } catch (err) {
    console.error(`[FAIL] ${locale}: Failed to parse JSON - ${err.message}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\nTranslation check failed! Please synchronize missing keys.');
  process.exit(1);
} else {
  console.log('\nAll locale files are 100% in sync with English!');
  process.exit(0);
}
