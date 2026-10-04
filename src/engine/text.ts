/** Small English helpers for generated log text. */

/** Lower-case a catalog label for mid-sentence use, keeping acronyms (COPD, CEO) intact. */
export function lowerLabel(label: string): string {
  return /^[A-Z]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

/** "a" or "an" for the word that follows (by its first letter, with the usual u/eu exceptions). */
export function article(word: string): 'a' | 'an' {
  const w = word.trim().toLowerCase();
  if (/^[A-Z]{2}/.test(word.trim())) return /^[aefhilmnorsx]/.test(w) ? 'an' : 'a';
  if (/^(uni|use|usu|eu|one)/.test(w)) return 'a';
  if (/^hour|^honest|^heir/.test(w)) return 'an';
  return /^[aeiou]/.test(w) ? 'an' : 'a';
}

/** "an oil painting", "a laborer": the label lower-cased with its article. */
export function withArticle(label: string): string {
  const l = lowerLabel(label);
  return `${article(l)} ${l}`;
}
