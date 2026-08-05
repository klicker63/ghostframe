import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import { parse } from 'yaml';

const root = path.resolve(import.meta.dirname, '..');
const schemaPath = path.join(root, 'launch', 'product.schema.json');

function collectStrings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.entries(value)
    .filter(([key]) => key !== 'prohibited_claims')
    .flatMap(([, item]) => collectStrings(item));
  return [];
}

export async function loadAndValidateManifest(filePath) {
  const [source, schemaSource] = await Promise.all([readFile(filePath, 'utf8'), readFile(schemaPath, 'utf8')]);
  let manifest;
  try {
    manifest = parse(source);
  } catch (error) {
    throw new Error(`Manifest YAML could not be parsed: ${error.message}`);
  }
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(JSON.parse(schemaSource));
  if (!validate(manifest)) {
    const errors = validate.errors.map(error => `${error.instancePath || '/'} ${error.message}`).join('\n');
    throw new Error(`Manifest validation failed:\n${errors}`);
  }
  const publishable = collectStrings(manifest).join('\n').toLowerCase();
  const violation = manifest.prohibited_claims.find(claim => publishable.includes(claim.toLowerCase()));
  if (violation) throw new Error(`Manifest contains prohibited public claim: ${violation}`);
  return manifest;
}

export function repositoryRoot() {
  return root;
}
