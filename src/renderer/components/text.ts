/** Engine reasons are written to sit mid-sentence; shown on their own, they start with a capital. */
export const cap = (t: string): string => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
