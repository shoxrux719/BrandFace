import fs from 'node:fs';
import path from 'node:path';

// One-time migration of the existing authored pages to actual JSX components.
const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'references/native-v1/index.html'), 'utf8');
const token = /<section\b[^>]*>|<\/section>/g;
const output = [];
let match, depth = 0, start = 0, opening = '';
while ((match = token.exec(html))) {
  if (match[0].startsWith('</')) {
    depth--;
    if (depth === 0) {
      const id = opening.match(/id="([^"]+)"/)[1];
      const title = opening.match(/data-title="([^"]+)"/)[1];
      const className = opening.match(/class="([^"]+)"/)[1];
      let content = html.slice(start, match.index);
      content = content.replace(/<figure class="(photo-cell[^"]*)" data-photo="([^"]+)" data-cell="(\d)" role="img" aria-label="([^"]+)"><\/figure>/g,
        (_, classes, photo, cell, alt) => `<Photo className="${classes}" photo="${photo}" cell={${cell}} alt="${alt}" />`);
      content = content.replace(/class=/g, 'className=').replace(/fetchpriority=/g, 'fetchPriority=');
      content = content.replace(/<(img|br)\b([^>]*?)>/g, '<$1$2 />');
      output.push(`  {id: '${id}', title: '${title}', className: '${className}', Content: function ${id[0].toUpperCase() + id.slice(1)}Pages() { return <>${content}</>; }} `);
    }
  } else {
    if (depth === 0) { start = token.lastIndex; opening = match[0]; }
    depth++;
  }
}
if (output.length !== 10) throw new Error(`Expected ten spreads, found ${output.length}`);
fs.writeFileSync(path.join(root, 'src/spreads.jsx'), `import React from 'react';\nimport Photo from './Photo.jsx';\n\nexport const spreads = [\n${output.join(',\n')}\n];\n`);
const cssPath = path.join(root, 'src/magazine.css');
fs.writeFileSync(cssPath, fs.readFileSync(cssPath, 'utf8').replaceAll("url('assets/", "url('/assets/"));
console.log('Migrated ten authored spreads to JSX components.');
