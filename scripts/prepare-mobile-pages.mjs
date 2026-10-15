import fs from 'node:fs';
const file = new URL('../src/spreads.jsx', import.meta.url);
let source = fs.readFileSync(file, 'utf8');
let count = 0;
source = source.replace(/\{id: '([^']+)', title: '([^']+)', className: '([^']+)', Content: function \w+\(\) \{ return <>([\s\S]*?)<\/>; \}\}\s*,?/g,
  (_, id, title, className, body) => {
    count++;
    if (id === 'editorial') return `{id: '${id}', title: '${title}', className: '${className}', wideContent: <>${body}</>},`;
    const pages = body.trim().replace(/<\/article>\s*<article/g, '</article>,\n          <article');
    if ((pages.match(/<article/g) || []).length !== 2) throw Error(`Expected two pages in ${id}`);
    return `{id: '${id}', title: '${title}', className: '${className}', pages: [\n          ${pages}\n        ]},`;
  });
if (count !== 10) throw Error(`Expected ten spreads, found ${count}`);
fs.writeFileSync(file, source);
console.log('Prepared 18 authored pages and one wide editorial for mobile rendering.');
