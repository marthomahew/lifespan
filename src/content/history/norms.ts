/** How the world's rules changed: when same-sex couples could marry, and the generations. */

/** First year same-sex couples could marry nationwide (null: not by 2025). */
export const SAME_SEX_MARRIAGE: Record<string, number | null> = {
  us: 2015,
  uk: 2014,
  se: 2009,
  mx: 2022,
  ng: null,
  kr: null,
  in: null,
  jp: null,
  ca: 2005,
  fr: 2013,
  au: 2017,
  br: 2013,
  de: 2017,
};

/** The generation a birth year belongs to (as commonly labelled). */
export function generationOf(birthYear: number): string {
  if (birthYear < 1928) return 'the Greatest Generation';
  if (birthYear < 1946) return 'the Silent Generation';
  if (birthYear < 1965) return 'a Baby Boomer';
  if (birthYear < 1981) return 'Generation X';
  if (birthYear < 1997) return 'a Millennial';
  if (birthYear < 2013) return 'Generation Z';
  if (birthYear < 2025) return 'Generation Alpha';
  return 'Generation Beta';
}
