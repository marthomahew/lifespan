import type { EventDef } from '../../engine/events/types';
import { CHILD_EVENTS } from './child';

export const EVENTS: EventDef[] = [...CHILD_EVENTS];

export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);
