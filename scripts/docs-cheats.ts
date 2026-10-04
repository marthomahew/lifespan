/** npm run docs:cheats — regenerate the cheat list in README.md from the registry. */
import { readFileSync, writeFileSync } from 'node:fs';
import { cheatMarkdown, END, START } from './cheat-docs';

const readme = readFileSync('README.md', 'utf8');
const a = readme.indexOf(START);
const b = readme.indexOf(END);
if (a < 0 || b < 0) throw new Error('README.md is missing the cheat markers');
writeFileSync('README.md', readme.slice(0, a) + cheatMarkdown() + readme.slice(b + END.length));
console.log('docs:cheats: README.md updated');
