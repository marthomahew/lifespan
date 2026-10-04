import { describe, expect, it } from 'vitest';
import { ESLint } from 'eslint';

const eslint = new ESLint({ cwd: process.cwd() });

async function lint(code: string, filePath: string): Promise<string[]> {
  const [res] = await eslint.lintText(code, { filePath });
  return (res?.messages ?? []).map((m) => m.message);
}

describe('lint purity rules', () => {
  for (const dir of ['src/engine/x.ts', 'src/content/x.ts']) {
    it(`forbids Math.random in ${dir}`, async () => {
      const msgs = await lint('export const r = Math.random();\n', dir);
      expect(msgs.join('\n')).toMatch(/Math\.random/);
    });
    it(`forbids Date.now in ${dir}`, async () => {
      const msgs = await lint('export const t = Date.now();\n', dir);
      expect(msgs.join('\n')).toMatch(/Date\.now/);
    });
    it(`forbids new Date in ${dir}`, async () => {
      const msgs = await lint('export const d = new Date();\n', dir);
      expect(msgs.join('\n')).toMatch(/new Date/);
    });
    it(`forbids Node and DOM access in ${dir}`, async () => {
      const msgs = await lint(
        "import { readFileSync } from 'node:fs';\nexport const d = document.title + readFileSync;\n",
        dir,
      );
      expect(msgs.length).toBeGreaterThanOrEqual(2);
    });
  }

  it('allows Date in the renderer', async () => {
    const msgs = await lint('export const t = Date.now();\n', 'src/renderer/x.ts');
    expect(msgs).toEqual([]);
  });
});
