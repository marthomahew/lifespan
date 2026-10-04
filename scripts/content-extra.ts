/** Catalogs beyond events that content:check validates and counts (extended as systems land). */
export type ExtraContent = {
  crimes: Set<string>;
  jobs: Set<string>;
  thresholds: { key: string; label: string; value: number; min: number }[];
};

export function extraContent(): ExtraContent {
  return { crimes: new Set(), jobs: new Set(), thresholds: [] };
}
