import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadAndValidateManifest, repositoryRoot } from './manifest-lib.mjs';

const ASSETS = {
  'product-hunt.md': 'product-hunt.md.tmpl',
  'show-hn.md': 'show-hn.md.tmpl',
  'reddit-value-first.md': 'reddit-value-first.md.tmpl',
  'technical-article-outline.md': 'technical-article-outline.md.tmpl',
  'github-readme-section.md': 'github-readme-section.md.tmpl',
  'founder-announcement.md': 'founder-announcement.md.tmpl',
  'short-social.md': 'short-social.md.tmpl',
  'long-social.md': 'long-social.md.tmpl',
  'community-permission-message.md': 'community-permission-message.md.tmpl',
  'founder-outreach-email.md': 'founder-outreach-email.md.tmpl',
  'three-day-follow-up.md': 'three-day-follow-up.md.tmpl',
  'newsletter-pitch.md': 'newsletter-pitch.md.tmpl',
  'podcast-pitch.md': 'podcast-pitch.md.tmpl',
  'demo-script.md': 'demo-script.md.tmpl',
  'headlines-and-ctas.md': 'headlines-and-ctas.md.tmpl',
  'faq.md': 'faq.md.tmpl',
  'utm-urls.md': 'utm-urls.md.tmpl',
  'launch-checklist.md': 'launch-checklist.md.tmpl',
};

const root = repositoryRoot();
const manifestArg = process.argv.find(argument => !argument.startsWith('--') && argument.endsWith('.yaml')) || 'launch/products/ghostgate.yaml';
const force = process.argv.includes('--force');
const manifest = await loadAndValidateManifest(path.resolve(root, manifestArg));
if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(manifest.product_id)) throw new Error('Unsafe product_id refused.');

const outputRoot = path.resolve(root, 'launch', 'generated');
const outputDirectory = path.resolve(outputRoot, manifest.product_id);
if (!outputDirectory.startsWith(`${outputRoot}${path.sep}`)) throw new Error('Output path escaped launch/generated.');

const list = values => values.map(value => `- ${value}`).join('\n');
const numbered = values => values.map((value, index) => `${index + 1}. ${value}`).join('\n');
const utm = (url, content) => {
  const parsed = new URL(url);
  parsed.searchParams.set('utm_source', manifest.tracking_parameters.source);
  parsed.searchParams.set('utm_medium', manifest.tracking_parameters.medium);
  parsed.searchParams.set('utm_campaign', manifest.tracking_parameters.campaign);
  parsed.searchParams.set('utm_content', content);
  return parsed.toString();
};
const view = {
  product_id: manifest.product_id,
  product_name: manifest.product_name,
  tagline: manifest.tagline,
  public_url: manifest.public_url,
  product_category: manifest.product_category,
  problem: manifest.problem,
  core_promise: manifest.core_promise,
  target_users: list(manifest.target_users),
  target_users_inline: manifest.target_users.join(', '),
  buyer_roles: list(manifest.buyer_roles),
  scope: list(manifest.scope),
  exclusions: list(manifest.exclusions),
  evidence: list(manifest.evidence),
  public_claims: list(manifest.public_claims),
  public_claims_numbered: numbered(manifest.public_claims),
  proof_links: list(manifest.proof_links),
  outreach_angles: list(manifest.outreach_angles),
  keywords: manifest.keywords.join(', '),
  price: manifest.price,
  payment_terms: manifest.payment_terms,
  delivery_target: manifest.delivery_target,
  free_tool_name: manifest.free_tool.name,
  free_tool_description: manifest.free_tool.description,
  free_tool_url: manifest.free_tool.url,
  paid_offer_name: manifest.paid_offer.name,
  primary_cta_label: manifest.primary_cta.label,
  primary_cta_url: manifest.primary_cta.url,
  secondary_cta_label: manifest.secondary_cta.label,
  secondary_cta_url: manifest.secondary_cta.url,
  founder_name: manifest.founder.name,
  company_name: manifest.company.name,
  company_url: manifest.company.url,
  utm_free_tool_product_hunt: utm(manifest.free_tool.url, 'product-hunt'),
  utm_free_tool_show_hn: utm(manifest.free_tool.url, 'show-hn'),
  utm_free_tool_reddit: utm(manifest.free_tool.url, 'reddit'),
  utm_free_tool_social: utm(manifest.free_tool.url, 'social'),
  utm_paid_offer_readiness: utm(manifest.primary_cta.url, 'readiness-result'),
};

function render(template, fileName) {
  const output = template.replace(/\{\{([a-z0-9_]+)\}\}/g, (_, key) => {
    if (!(key in view)) throw new Error(`Template ${fileName} requires missing value: ${key}`);
    return String(view[key]);
  });
  const unresolved = output.match(/\{\{[^}]+\}\}/);
  if (unresolved) throw new Error(`Unsupported placeholder in ${fileName}: ${unresolved[0]}`);
  const prohibited = manifest.prohibited_claims.find(claim => output.toLowerCase().includes(claim.toLowerCase()));
  if (prohibited) throw new Error(`Generated asset ${fileName} contains prohibited claim: ${prohibited}`);
  return `> **DRAFT — Human review required before publication.** Verify channel rules, claims, links, and current product details.\n\n${output.trim()}\n`;
}

await mkdir(outputDirectory, { recursive: true });
const pending = [];
for (const [outputName, templateName] of Object.entries(ASSETS)) {
  const outputPath = path.join(outputDirectory, outputName);
  if (!force) {
    try { await access(outputPath); throw new Error(`Refusing to overwrite ${path.relative(root, outputPath)}. Re-run with --force to replace generated files.`); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const template = await readFile(path.join(root, 'launch', 'templates', templateName), 'utf8');
  pending.push([outputPath, render(template, templateName)]);
}
for (const [outputPath, content] of pending) await writeFile(outputPath, content, { encoding: 'utf8', flag: force ? 'w' : 'wx' });
console.log(`Generated ${pending.length} draft assets in ${path.relative(root, outputDirectory)}.`);
