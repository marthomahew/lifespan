export * from './types';
export { newLife, type NewLifeOptions, WEALTH_TIERS } from './life';
export { ageUp } from './age';
export { EngineError } from './errors';
export { choose, currentPopup, categoryEmoji, type PopupView } from './events/choose';
export type { Step } from './ctx';
export { serialize, deserialize, SaveError } from './save';
export { stateHash, lifeHash } from './hash';
export { stageOf, STAGE_LABEL } from './stage';
export { obituary, type Obituary } from './death';
export { netWorth, netWorthRef } from './networth';
export { formatMoney, formatMoneyShort, countryOf, money } from './economy';
export { makeSaveFile, parseSaveFile, summarize, type SaveSummary } from './savefile';
export { renderText } from './events/tokens';
export { avatarEmoji } from './avatar';
export { traitModifiers, statLabel } from './describe';
export {
  runCheat,
  runConsole,
  suggest,
  helpText,
  CHEATS,
  CHEAT_BY_ID,
  CheatError,
  parseCommand,
  type CheatStep,
} from './cheats/registry';
export { CHEAT_GROUPS, type CheatDef, type CheatGroup, type ParamDef } from './cheats/types';
export { eventTable, type EventRow } from './cheats/events';

// Saves are checked against the shape of a fresh life.
import { newLife as _newLife } from './life';
import { setSaveTemplate as _setTemplate } from './save';
_setTemplate(_newLife({ country: 'us', birthYear: 2000 }, 1));
