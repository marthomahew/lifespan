import type { EventDef } from '../../engine/events/types';
import { CHILD_EVENTS } from './child';
import { TEEN_EVENTS } from './teen';
import { YOUNG_ADULT_EVENTS } from './young-adult';
import { ADULT_EVENTS } from './adult';
import { MIDDLE_AGE_EVENTS } from './middle-age';
import { SENIOR_EVENTS } from './senior';
import { ROMANCE_EVENTS } from './romance';
import { SYSTEM_EVENTS } from './systems';
import { SCHOOL_EVENTS } from './school';
import { WORK_EVENTS } from './work';
import { FAME_EVENTS } from './fame';
import { SERVICE_EVENTS } from './service';
import { PARENTING_EVENTS } from './parenting';

export const EVENTS: EventDef[] = [
  ...CHILD_EVENTS,
  ...TEEN_EVENTS,
  ...YOUNG_ADULT_EVENTS,
  ...ADULT_EVENTS,
  ...MIDDLE_AGE_EVENTS,
  ...SENIOR_EVENTS,
  ...ROMANCE_EVENTS,
  ...SCHOOL_EVENTS,
  ...WORK_EVENTS,
  ...FAME_EVENTS,
  ...SERVICE_EVENTS,
  ...PARENTING_EVENTS,
  ...SYSTEM_EVENTS,
];

export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);
