import type { Country } from '../types';
import { unitedStates } from './us';
import { unitedKingdom } from './uk';
import { canada } from './canada';
import { australia } from './australia';
import { germany } from './germany';
import { france } from './france';
import { sweden } from './sweden';
import { japan } from './japan';
import { southKorea } from './south-korea';
import { india } from './india';
import { brazil } from './brazil';
import { mexico } from './mexico';
import { nigeria } from './nigeria';

export const COUNTRIES: Country[] = [
  unitedStates,
  unitedKingdom,
  canada,
  australia,
  germany,
  france,
  sweden,
  japan,
  southKorea,
  india,
  brazil,
  mexico,
  nigeria,
];

export const COUNTRY_BY_ID: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c]),
);
