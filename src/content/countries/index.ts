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
import { italy } from './italy';
import { spain } from './spain';
import { ireland } from './ireland';
import { netherlands } from './netherlands';
import { poland } from './poland';
import { slovenia } from './slovenia';
import { turkey } from './turkey';
import { china } from './china';
import { philippines } from './philippines';
import { newZealand } from './new-zealand';
import { southAfrica } from './south-africa';
import { egypt } from './egypt';
import { argentina } from './argentina';

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
  italy,
  spain,
  ireland,
  netherlands,
  poland,
  slovenia,
  turkey,
  china,
  philippines,
  newZealand,
  southAfrica,
  egypt,
  argentina,
];

export const COUNTRY_BY_ID: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.id, c]),
);
