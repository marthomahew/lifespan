import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { cheatMarkdown } from '../../scripts/cheat-docs';
import { CHEATS } from '../../src/engine/cheats/registry';

describe('README (M12.5)', () => {
  const readme = readFileSync('README.md', 'utf8');
  it('has the generated cheat list, in sync with the registry', () => {
    expect(readme).toContain(cheatMarkdown());
    for (const c of CHEATS) expect(readme).toContain(`\`${c.syntax}\``);
  });
  it('covers the game, controls, dev commands and Mac install', () => {
    for (const s of [
      '## Playing',
      '## Controls',
      '## Cheats',
      '## Installing on the Mac',
      '## Development',
      'overnight/install-mac.sh',
      'overnight/build-mac.sh',
      'npm run verify',
      '⌘K',
    ])
      expect(readme).toContain(s);
  });
});
