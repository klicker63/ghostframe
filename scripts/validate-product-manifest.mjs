import path from 'node:path';
import { loadAndValidateManifest, repositoryRoot } from './manifest-lib.mjs';

const requested = process.argv[2] || 'launch/products/ghostgate.yaml';
const manifestPath = path.resolve(repositoryRoot(), requested);

try {
  const manifest = await loadAndValidateManifest(manifestPath);
  console.log(`Valid product manifest: ${manifest.product_id} (${manifest.manifest_version})`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
