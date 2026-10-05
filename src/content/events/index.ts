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
import { LEGAL_EVENTS } from './legal';
import { HEALTH_EVENTS } from './health';
import { TEEN_YA_EVENTS_2 } from './teen-ya-2';
import { CHILD_EVENTS_2 } from './child-2';
import { MIDDLE_AGE_EVENTS_2 } from './middle-age-2';
import { SENIOR_EVENTS_2 } from './senior-2';
import { PRISON_EVENTS } from './prison';
import { CAREER_CARE_EVENTS } from './careers-care';
import { CAREER_OFFICE_EVENTS } from './careers-office';
import { CAREER_HANDS_EVENTS } from './careers-hands';
import { CAREER_FIELD_EVENTS } from './careers-field';
import { ROMANCE_EVENTS_2 } from './romance-2';

export const EVENTS: EventDef[] = [
  ...PRISON_EVENTS,
  ...CAREER_CARE_EVENTS,
  ...CAREER_OFFICE_EVENTS,
  ...CAREER_HANDS_EVENTS,
  ...CAREER_FIELD_EVENTS,
  ...ROMANCE_EVENTS_2,
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
  ...LEGAL_EVENTS,
  ...HEALTH_EVENTS,
  ...TEEN_YA_EVENTS_2,
  ...CHILD_EVENTS_2,
  ...MIDDLE_AGE_EVENTS_2,
  ...SENIOR_EVENTS_2,
  ...SYSTEM_EVENTS,
];

export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);
