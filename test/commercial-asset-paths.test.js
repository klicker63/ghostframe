import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const commercialDir = path.join(root, 'public', 'commercial');

const findHtmlFiles = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
  }));
  return nestedFiles.flat();
};

const stylesheetHrefs = html => [...html.matchAll(/<link\b[^>]*>/gi)]
  .map(([tag]) => Object.fromEntries(
    [...tag.matchAll(/\b(rel|href)\s*=\s*(["'])(.*?)\2/gi)]
      .map(([, name, , value]) => [name.toLowerCase(), value]),
  ))
  .filter(attributes => attributes.rel?.split(/\s+/).includes('stylesheet'))
  .map(attributes => attributes.href);

test('commercial HTML uses existing absolute commercial stylesheet paths', async () => {
  const htmlFiles = await findHtmlFiles(commercialDir);
  assert.ok(htmlFiles.length > 0, 'expected commercial HTML files');

  for (const htmlFile of htmlFiles) {
    const relativeHtmlFile = path.relative(root, htmlFile);
    const html = await readFile(htmlFile, 'utf8');

    for (const href of stylesheetHrefs(html)) {
      if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) continue;

      assert.doesNotMatch(
        href,
        /^\.\//,
        `${relativeHtmlFile}: ./ stylesheet paths break at clean trailing-slash URLs`,
      );
      assert.match(
        href,
        /^\/commercial\//,
        `${relativeHtmlFile}: local stylesheets must use absolute /commercial/ paths`,
      );

      const pathname = new URL(href, 'https://www.ghostframestudios.com').pathname;
      const stylesheetFile = path.join(root, 'public', ...pathname.split('/').filter(Boolean));
      assert.ok(
        stylesheetFile.startsWith(`${commercialDir}${path.sep}`),
        `${relativeHtmlFile}: stylesheet must remain under public/commercial`,
      );
      await assert.doesNotReject(
        access(stylesheetFile),
        `${relativeHtmlFile}: ${href} must point to an existing stylesheet`,
      );
    }
  }
});
