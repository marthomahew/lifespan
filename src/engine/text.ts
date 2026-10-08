/** Small English helpers for generated log text. */

/** Lower-case a catalog label for mid-sentence use, keeping acronyms (COPD, CEO) intact. */
export function lowerLabel(label: string): string {
  // Acronyms (BMW) and brand-and-model names (Chevrolet Bel Air, Porsche 911) keep their capitals.
  const proper =
    /^[A-Z]{2}/.test(label) ||
    /^[A-Z][a-z-]+ [A-Z]/.test(label) ||
    // A model number, every word after it capitalised too (not "Type 2 diabetes").
    /^[A-Z][a-z-]+ \d\w*( [A-Z0-9]\S*)*$/.test(label);
  return proper ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

/** A job title mid-sentence: every word lower-case except acronyms (CEO, EMT, IT). */
export function lowerTitle(title: string): string {
  return title
    .split(' ')
    .map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase()))
    .join(' ');
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

/** "a", "a and b", "a, b and c". */
export function listAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1] ?? ''}`;
}
