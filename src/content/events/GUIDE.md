# Writing Lifespan events

Read this whole file before writing. Events are TypeScript data (`EventDef` in `src/engine/events/types.ts`).

## Voice (SPEC §11)

- Second person, present tense. One to three sentences, max 280 characters per text.
- Specific beats generic. "Your uncle sells you a 'barely used' car that leaks something blue" beats "You buy a used car."
- Dry humour by default. Death, illness, grief, and addiction are played straight and kept brief.
- Choices are short verb phrases ("Lend it", "Refuse", "Ask what the thing is"), max 60 chars. 2–4 choices. Each leads somewhere different; no fake choices.
- Outcome text resolves the moment and hints at the stat change without numbers.
- When an event involves someone, use their name ({friend.first}) and, where it fits, their memory of you ({mother.memory}, which needs `hasMemory: true` on that binding).
- 100% original: no BitLife text or jokes, no real celebrities, brands, or companies (invent names). Real countries and cities are fine.
- No self-harm or suicide content anywhere. Crime and drugs stay abstract: consequences, never methods.
- Romance, dating, sex and pregnancy: adults only (player and every NPC 18+), always fade-to-black. Under-18s get friendships, rivalries, school and family drama only.
- Vary openings. Never reuse a sentence. `content:check` fails duplicate texts (any outcome text identical to another).
- Never write the words TODO, FIXME, TBD, XXX or lorem.

## Shape

```ts
import type { EventDef } from '../../engine/events/types';
import { canAfford, hasJob } from './conditions';

export const TEEN_EVENTS: EventDef[] = [
  {
    id: 'teen_party_parents_away', // snake_case, unique, prefix with your stage
    kind: 'choice', // 'choice' (popup) or 'notice' (straight into the log)
    category: 'social', // family | school | social | romance | work | money | health | crime | military | fame | travel | world | random
    ages: [14, 17], // inclusive; keep the span <= 40 years
    weight: 10, // 4–12 typical
    cooldownYears: 3, // default 8; or once: true
    bind: { host: { role: 'friend', minRelationship: 30 } },
    text: "{host.first} is throwing a party and swears {host.their} parents are 'definitely gone until Sunday.'",
    choices: [
      {
        id: 'go',
        label: 'Go',
        outcomes: [
          {
            chance: 0.6,
            text: 'You dance badly for three hours and regret nothing.',
            effects: [{ stat: 'happiness', delta: 8 }],
          },
          {
            chance: 0.4,
            text: 'The parents come home early. You leave through a hedge.',
            effects: [{ stat: 'health', delta: -2 }],
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay home',
        outcomes: [
          {
            chance: 1,
            text: 'You hear about it for the next three years.',
            effects: [{ stat: 'happiness', delta: -3 }],
          },
        ],
      },
    ],
  },
];
```

A notice has `outcomes` (one is drawn by `chance`) and no `choices`. The log shows the event text followed by the outcome text, so notice outcome text continues the event text.

## Tokens

`{first}` `{last}` `{age}` `{city}` `{country}` `{year}`; for a binding or role name `n`: `{n.first}` `{n.last}` `{n.full}` `{n.they}` `{n.They}` `{n.them}` `{n.their}` `{n.Their}` `{n.rel}` ("your sister") `{n.Rel}` `{n.age}` `{n.job}` `{n.memory}` (needs hasMemory), `{n.is}`/`{n.has}`/`{n.s}` for verb agreement right after `{n.they}` ("{n.they} {n.is} late", "{n.they} laugh{n.s}"); after a name always write the singular verb ("{n.first} laughs"). `{money:3000}` formats 3,000 reference dollars (2026 US purchasing power) in local currency. In chain-only follow-ups, `{money:$amount}` and `{$key}` read the payload.

Role names usable without a `bind` (the first living NPC with that role is used, and the event is skipped if there's none): mother, father, sibling, grandparent, child, partner, spouse, ex, friend, enemy, coworker, classmate, teacher, boss, cellmate, bandmate. Use `bind` to filter (minRelationship, maxRelationship, minAge, maxAge, gender: 'male'|'female', hasMemory, flag, notFlag) or to name a second person of the same role.

## Effects

- `{ stat: 'happiness'|'health'|'smarts'|'looks'|'karma'|'discipline'|'stress'|'fame'|'notoriety', delta: n }` (typical ±2…±10)
- `{ money: 500 }` reference dollars (negative to spend); `{ money: { payload: 'amount', mult: 1.5 } }` in chain follow-ups
- `{ rel: 'friend', delta: 10, memory: 'the time you lent them money' }` relationship ±, ALWAYS with a memory line (a short noun phrase that reads well after "still brings up": "the hedge escape", "your wedding speech")
- `{ npcStat: 'friend', stat: 'happiness'|'health'|'smarts'|'looks', delta: n }`
- `{ flag: 'x' }` / `{ unflag: 'x' }` on the player; `{ npcFlag: 'friend', flag: 'x' }`
- `{ addTrait: id }` / `{ removeTrait: id }` — traits: ambitious lazy charming hot_headed frugal spendthrift bookish athletic anxious optimistic pessimistic reckless cautious loyal funny creative honest cunning calm awkward generous musical
- `{ skill: id, delta: n }` — skills: instrument voice athletics programming cooking art writing
- `{ injury: n }` (health loss from an injury), `{ illness: 'flu' }`
- `{ vice: 'alcohol'|'smoking'|'gambling'|'party_drugs'|'pills'|'hard_drugs', delta: n }` (adults; keep abstract)
- `{ status: 'friend' }` (a new friend NPC), `{ status: 'enemy' }`, `{ status: 'npc_dies', with: 'grandparent' }` (serious, brief)
- Adults-only events only: `{ status: 'meet' }` (start dating someone new), `{ status: 'breakup', with: 'partner' }`
- `{ performance: n }` work performance (only in events with `when: hasJob`)
- `{ conduct: n }` military conduct (only with `when: serving`); `{ system: 'dishonorable' }` ends service with a dishonorable discharge; `{ system: 'injury_discharge' }` ends it honorably after a serious injury; `{ system: 'move_abroad', arg?: countryId }` (move abroad with your partner; gate the choice with `requires: canMoveAbroad`); `{ system: 'therapy' }` (counselling: less stress)
- `{ fame: n }` fame up or down
- `{ death: 'cause text' }` — very rare, only for genuinely dangerous choices, never for self-harm.
- Chains: on an outcome, `next: { eventId: 'your_followup_id', inYears: [1, 4], payload: { amount: 3000 } }`. The follow-up has `chainOnly: true`, and reuses the same binding names (they are carried over).

## Conditions

Import helpers from `./conditions`: livesAbroad, exCon, hasRecord, inField(field), isJob(...jobIds), jobLevelAtLeast(n), serving, deployed, famous(min), hasKidAged(lo, hi), canAfford(ref), hasFlag(f), lacksFlag(f), hasTrait(t), statAtLeast(k, v), statBelow(k, v), hasJob, noJob, inSchool, atUniversity, hasPartner, single, isMarried, hasChildren, ownsHome, ownsVehicle, notInPrison, hasSkill(id, v), all(...), any(...), and oddsBy(stat, base, slope) for an outcome `chance` that rises with a stat (use it on the success outcome and give the failure outcome a fixed chance; chances are relative weights).
Use `when` for an event-level condition, `requires` for a choice that needs money (`requires: canAfford(3000)`), and `success: true` on the outcome that counts as "it worked".
