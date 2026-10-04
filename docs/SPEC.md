# Lifespan: game and technical spec

Lifespan is a single-player life simulator for macOS. Each press of Age Up is one year. Things happen, you choose, you live with the results, you die, and you can carry on as one of your children. The loop is BitLife's. The differences are depth, consequences that persist, fast keyboard play on a Mac, and total player control, cheat menu included.

## 1. Pillars
1. **One more year.** Age Up responds instantly. A year with nothing to decide costs one keypress.
2. **Consequences persist.** NPCs remember. Records follow you. Money compounds. Choices come back years later.
3. **Short, specific, funny writing.** Never generic. Serious moments are played straight.
4. **The player is in charge.** No paywalls, energy, timers, ads, or premium currency. The cheat menu can change anything.
5. **Reproducible.** A life is fully determined by its seed and the player's inputs.

## 2. Improvements over BitLife (all required)
- **Nothing locked.** Custom birth (name, gender, attraction, country, city, birth year, appearance, traits, starting stats, family wealth), every career and system from the start, rewind through cheats.
- **NPC memory.** Each NPC keeps up to 30 remembered moments with you. Interaction outcomes and event text use them ("{mother.first} still brings up the wedding speech").
- **Event chains.** Storylines spanning years: a loan that resurfaces, an affair found out later, a friend's startup that pays off or doesn't.
- **A working economy.** Inflation, country price and wage levels, tax bands, interest, amortized loans, volatile investments, housing appreciation, a lifestyle spending setting.
- **Visible mechanics.** Trait and skill tooltips show their actual modifiers. Finances show last year's breakdown.
- **Event pacing.** A popup cap per year (setting, default 3), category cooldowns, one-time events that never repeat, and low-stakes happenings logged as notices instead of popups.
- **Keyboard first.** Space ages up, 1–4 choose, ⌘1–⌘4 switch tabs, ⌘K finds any action, backquote opens cheats.
- **Information.** Stat sparklines, net worth graph, family tree, searchable life log, milestone timeline.
- **Saves.** Autosave every year, many lives side by side, export and import, rewind.
- **Generations.** Continue as a child with inheritance; dynasty view with a legacy score.
- **Content as data.** Events, jobs, countries and the rest are typed data modules, so new content never touches engine code.

## 3. Character, stats, time

### 3.1 Character
First and last name, gender (male, female, nonbinary), attraction (men, women, everyone), birth year, birth country and city, current country and city, appearance emoji (skin-tone aware), 2–3 traits at birth, skills, languages with fluency, education record, career record, criminal record, flags (a string set), achievements, family links, and cause of death once dead.

### 3.2 Stats
All stats are integers from 0 to 100.
- Visible: Happiness, Health, Smarts, Looks.
- Hidden (debug overlay, cheats, and wherever context needs them): Karma, Discipline, Fertility, Stress, Fame (shown in the header once above 0), Notoriety (criminal reputation), and one addiction meter per vice.

Each year stats drift toward a baseline set by age, traits, lifestyle, and circumstances: debt and prison raise Stress, good relationships lift Happiness. Health declines slowly from 30 and faster after 60. Looks peak around 20–35. Smarts grows through the school years with study and stalls without it.

### 3.3 Life stages
Infant 0–2, Child 3–12, Teen 13–17, Young adult 18–29, Adult 30–49, Middle age 50–64, Senior 65+. Stages gate activities, jobs, and events.

### 3.4 One year
Age Up runs in this order. Changing the order needs a DECISIONS entry.
1. Age +1, world year +1, inflation index update.
2. Finances: income, tax, living costs, loan payments, interest, investment returns.
3. Drift: stats, addictions, relationships (decay without contact), skills (slow decay without practice).
4. System ticks: school, career, military, fame, health, legal, and the NPC lifecycle (aging, deaths, births, NPCs' own life changes).
5. Chain steps due this year.
6. Random events (§4.3).
7. Mortality.
8. Achievements, snapshot, autosave.

### 3.5 Mortality
Base annual death probability `q(age) = min(0.9, A * exp(B * age))`, starting with `A = 5e-5` and `B = 0.085`, which puts a healthy median near 83. Multiply by health (×1 at 60 and above, rising linearly to ×4 at 0, ×0.85 at 90 and above), each active illness's factor, addiction levels, and risk flags (prison, deployment, dangerous job). Accidents and violence arrive through events. Nobody passes 120 without the immortality cheat. Tune the constants until the DONE §4.2 bands hold. The cause of death is always recorded and shown.

## 4. Events

### 4.1 Kinds
- **Choice events** open a popup with 2–4 choices.
- **Notices** go straight into the log with an outcome and its effects.
- **Chain steps** are follow-ups scheduled by an earlier outcome.

### 4.2 Definition
Indicative TypeScript. Refine the types as you build.

```ts
type EventDef = {
  id: string;                      // snake_case, unique, never renamed (saves reference it)
  kind: 'choice' | 'notice';
  category: Category;              // family | school | social | romance | work | money | health | crime | military | fame | travel | world | random
  ages?: [number, number];         // inclusive
  weight: number | ((s: GameState) => number);
  when?: (s: GameState) => boolean;
  bind?: Record<string, NpcQuery>; // NPCs the text talks about; if one can't be bound, the event is ineligible
  once?: boolean;
  cooldownYears?: number;          // default 8
  adultsOnly?: boolean;            // required on every romance-category event
  text: string;
  choices?: ChoiceDef[];           // kind 'choice'
  outcomes?: OutcomeDef[];         // kind 'notice'
};
type ChoiceDef  = { id: string; label: string; requires?: (s: GameState) => boolean; outcomes: OutcomeDef[] };
type OutcomeDef = { chance: number; text: string; effects: Effect[]; next?: ChainStepDef };
type NpcQuery   = { role: Role; minRelationship?: number; minAge?: number; maxAge?: number; sameCountry?: boolean };
```

Effects must cover: stat deltas (visible and hidden); money in reference dollars (§5.6); a relationship delta plus a memory line for a bound NPC; setting or clearing flags; adding or removing traits; skill deltas; adding or curing an illness; addiction deltas; a criminal record entry or an arrest; job changes (hired, fired, promoted); relationship status changes (meet, break up, marry, divorce, birth); scheduling a chain step in N years with a payload; death with a cause; awarding an achievement.

### 4.3 Selection and pacing
Each year: collect eligible events, weight them (base weight × trait and flag modifiers × category cooldown factor), and draw with the game RNG until the popup cap is reached or a stop roll ends the draw. Notices don't count toward the popup cap and have their own cap of 6 a year. One-time events never repeat; other events respect their cooldowns. Dead or absent NPCs can't be bound.

### 4.4 Tokens
`{first}`, `{last}`, `{age}`, `{city}`, `{country}`. For a bound NPC: `{mother.first}`, `{friend.they}` and `{friend.They}`, `{friend.their}`, `{friend.them}`, `{friend.rel}` ("your sister"). `{money:3000}` formats 3,000 reference dollars in the current country's currency at the current year's prices. An unresolved token fails `content:check`.

### 4.5 Chains
A chain step is `{ eventId, dueYear, payload }` stored in game state, so chains survive saves and rewinds. The payload carries what the follow-up needs, such as the friend's id or the amount lent.

### 4.6 Examples (match this format and voice; all text must be original)
```ts
{
  id: 'teen_party_parents_away',
  kind: 'choice', category: 'social', ages: [14, 17], weight: 10, cooldownYears: 2,
  bind: { host: { role: 'friend', minRelationship: 30 } },
  text: "{host.first} is throwing a party and swears {host.their} parents are 'definitely gone until Sunday.'",
  choices: [
    { id: 'go', label: 'Go', outcomes: [
      { chance: 0.6, text: 'You dance badly for three hours and regret nothing.', effects: [{ stat: 'happiness', delta: 8 }] },
      { chance: 0.3, text: 'The parents come home early. You leave through a hedge.',
        effects: [{ stat: 'happiness', delta: 3 }, { stat: 'health', delta: -2 }] },
      { chance: 0.1, text: 'Police. Your parents collect you from the station in complete silence.',
        effects: [{ stat: 'happiness', delta: -10 }, { rel: 'mother', delta: -12, memory: 'police pickup' },
                  { rel: 'father', delta: -12, memory: 'police pickup' }, { flag: 'juvenile_warning' }] },
    ] },
    { id: 'stay', label: 'Stay home', outcomes: [
      { chance: 1, text: 'You hear about it for the next three years.', effects: [{ stat: 'happiness', delta: -3 }] },
    ] },
  ],
}
```

```ts
{
  id: 'friend_asks_for_loan',
  kind: 'choice', category: 'money', ages: [22, 75], weight: 6, cooldownYears: 10,
  bind: { friend: { role: 'friend', minRelationship: 40 } },
  text: "{friend.first} needs {money:3000} 'just until the thing comes through.' {friend.They} won't say what the thing is.",
  choices: [
    { id: 'lend', label: 'Lend it', requires: canAfford(3000), outcomes: [
      { chance: 1, text: '{friend.first} hugs you like you just pulled {friend.them} out of a river.',
        effects: [{ money: -3000 }, { rel: 'friend', delta: 10, memory: 'lent them money' }],
        next: { eventId: 'friend_loan_resolution', inYears: [1, 4], payload: { amount: 3000 } } },
    ] },
    { id: 'refuse', label: 'Refuse', outcomes: [
      { chance: 1, text: "{friend.first} says it's fine, in the voice people use when it isn't.",
        effects: [{ rel: 'friend', delta: -12, memory: 'refused a loan' }] },
    ] },
  ],
}
```
`friend_loan_resolution` then pays you back with interest, never pays you back, or reveals that the thing was a startup and hands you a stake.

## 5. Systems

### 5.1 Relationships and NPCs
- **NPC record:** id, names, gender, age, alive, roles (mother, father, sibling, grandparent, child, partner, spouse, ex, friend, enemy, coworker, classmate, cellmate, and so on), relationship 0–100, two traits, core stats, job, country, memory (up to 30 lines of year, short text, delta), flags.
- **Family at birth:** parents (ages, jobs, wealth tier, how they get along), 0–3 siblings, grandparents (alive according to their ages).
- **Lifecycle:** NPCs age every year and can die (the same mortality model, simplified).
- **Interactions (12 or more):** spend time, conversation, compliment, insult, argue, gift (money or an item), ask for money, apologize, hug, prank, ask for advice, cut off. Partner extras: date night, propose, plan a wedding, couples therapy, try for a baby (adults only), break up or divorce. Outcomes depend on the relationship, both sides' traits, the NPC's memory of you, and RNG. Every interaction writes a memory line.
- **Friends** come from school, jobs, activities, and events. Friendships decay without contact (3 to 6 points a year); family decays more slowly.
- **Romance (18+ only):** meet people through activities (find a date, nightlife, work, a dating app after 2012); stages from dating to serious to engaged to married; proposals can fail; weddings cost money by size; prenups; divorce splits assets (prenup-aware) and can bring alimony and custody; affairs can surface years later through chains.
- **Children:** pregnancy by trying (both partners' fertility, adults only) and adoption. Children age, inherit some traits and stats, go to school, and have their own events. How they feel about you matters when choosing an heir.
- **Wills and inheritance:** you write a will (heirs and shares). NPC deaths can leave you money and items according to relation and relationship.
- **Family tree view:** three generations up and down from the player, clickable nodes.

### 5.2 Education
- Primary (6–11) and secondary (12–17) happen automatically. Grades come from Smarts, Discipline, and the Study activity. School events cover teachers, bullies, and classmates. Dropping out is allowed at the country's school-leaving age.
- University (18+): 12 or more majors; acceptance depends on Smarts and grades; costs follow the country (free, cheap, expensive); scholarships for high Smarts; student loans when you can't pay; yearly performance over four years; graduation with a GPA. Community college is a cheaper two-year path.
- Graduate programs: law (3 years), medicine (4 years plus residency), business (2 years), PhD (5 years). Each has entry requirements and leads to specific careers.
- The veteran education benefit (§5.4) pays tuition.

### 5.3 Careers
- **Catalog** (minimums in DONE §3): each job has an id, a title per level, a field, requirements (age, education and major, stats, skills, clean record, country), a salary range per level in reference dollars, stress, risk, and perks.
- **Job listings** with filters (field, requirements met). Applying leads to an interview event whose outcome uses stats, traits, and skills.
- **On the job:** yearly performance from Smarts, Discipline, traits, and work-harder actions; asking for raises and promotions; coworker relationships; firing for poor performance or through events; quitting; part-time jobs for ages 14–17; freelance gigs; retirement with a pension that depends on years worked and the country.

### 5.4 Military
- Enlist at 17 or 18 depending on the country, or commission as an officer with a degree. Branches: Army, Navy, Air Force, Marines.
- Specialties (6 or more): infantry, intelligence or linguist, aviation, medical, engineering, logistics. A specialty sets risk, the skills you gain, and the civilian job bonuses you get afterward.
- Ranks: enlisted E-1 to E-9, officers O-1 to O-6. Promotion depends on time in service, performance, and events.
- Deployments bring risk events, injuries, medals, and combat stress, handled seriously (therapy is offered).
- Discharge types: honorable, general, other than honorable, dishonorable, decided by events and conduct. Honorable and general discharges grant the veteran education benefit and some job perks.
- Conscription applies in countries that have it.

### 5.5 Music and fame
- Requires an instrument or vocal skill (§5.12). The path runs busking, open mics, local gigs, band or solo act, record deal events, then releases whose quality comes from skill plus RNG. Success brings fame, income, and tours.
- Fame (0–100) changes events (fans, paparazzi, scandals), income, and happiness. It decays without new work.

### 5.6 Money and the economy
- **Reference dollars:** all money in content is written in 2026 US dollars of purchasing power. At runtime it's converted with the country's price level and the inflation index and shown in the local currency.
- **Inflation:** default 2.5% a year with seeded noise of ±1.5 points, never below 0. A cheat can scale it.
- **Country data:** 3–5 tax bands, price level, wage level, currency and a fixed exchange rate. These are game constants, not live data.
- **Annual finances:** salary, then tax, then living costs (by housing: with parents, renting, or owning, and by a Lifestyle setting of frugal, normal, or lavish, which also moves Happiness), then loan payments, savings interest, and investment returns. The Finances view shows last year's breakdown and a net worth history graph.
- **Banking:** a savings account with a variable rate of 1–4%.
- **Investments (4 or more):** bond fund (mean 3.5%, sd 6%), index fund (7%, 15%), growth stocks (9%, 30%), speculative coin (10%, 80%, with a 5% yearly chance of a 90% crash). Buy and sell any amount.
- **Loans:** student, mortgage (15 or 30 years at 3–8% depending on the economy), and personal, with standard amortization. Missed payments bring penalties, then repossession of collateral, plus Stress and Happiness hits.
- **Negative cash** turns into high-interest personal debt.

### 5.7 Assets
- **Homes:** fresh listings each year (type × condition × country price level). Appreciation averages 3% a year with sd 6%, maintenance costs 1% a year, condition decays. Buy with cash or a mortgage, sell, live in.
- **Vehicles** (12 or more models with invented names): depreciation around 15% a year, condition, maintenance, and accident events tied to driving and condition. Driving licence at the country's age.
- **Possessions** (10 or more): instruments (which feed the music skill), jewelry, art, electronics, and the like.

### 5.8 Health
- **Illnesses** (20 or more): onset odds by age, lifestyle, and family history; symptom text; severity; chronic or curable; treatments with cost and success odds (general doctor, specialist, surgery, an alternative healer with poor odds); progression when untreated; a death factor.
- **Injuries** from accidents, fights, sports, and deployments.
- **Mental health:** long stretches of low Happiness or high Stress can bring depression or anxiety, which therapy and medication help. Treat these respectfully: no jokes at the condition's expense, and no self-harm or suicide content anywhere in the game.
- **Activities:** doctor visit, gym, diet, meditation, therapy, plastic surgery (with a chance of going wrong).

### 5.9 Vices
- Drinking, smoking, gambling, and recreational substances in generic categories (party drugs, pills, hard drugs). No preparation or dosing detail.
- Each vice has an addiction meter that rises with use and with certain traits, and falls with abstinence. High levels trigger events, health damage, money drain, and job and relationship damage. Rehab and support groups bring it down.

### 5.10 Crime and justice
- **Crimes** (10 or more): shoplifting, pickpocketing, vandalism, burglary, car theft, fraud, embezzlement (needs a job), drug dealing, assault, armed robbery, homicide. Descriptions stay abstract: consequences, never methods.
- Each crime has success odds (stats, traits, notoriety, skills), loot, arrest odds, and charges.
- **Justice:** arrest, bail, lawyer choice (public defender or paid tiers), plea deal or trial, verdict odds, and a sentence scaled by the country. Juvenile records seal at 18. A record blocks some jobs, emigration, and loans.
- **Prison:** yearly activities (6 or more: work out, study for a diploma, make allies, pick a fight, join a riot, attempt an escape, file an appeal), relationships with cellmates, parole and early release for good behaviour, and life after release.

### 5.11 Countries and emigration
- **12 or more countries.** Each has: currency and exchange rate, price level, wage level, tax bands, ages (drinking, driving, marriage, voting, school leaving), conscription, a university cost model, a healthcare cost model, a sentencing multiplier, main language or languages, 5 or more cities, and name pools (DONE §3).
- **Emigration:** requirements (adult, money, no active sentence), costs, currency conversion, losing your job, strain on friendships, and a language penalty unless you speak the local language.

### 5.12 Traits and skills
- **Traits** (15 or more), for example ambitious, lazy, charming, hot-headed, frugal, spendthrift, bookish, athletic, anxious, optimistic, reckless, loyal, funny, creative, honest, cunning. Each has explicit modifiers (stat drift, event weights, success odds) and can be gained or lost through events. Tooltips show the modifiers.
- **Skills** (6 or more, 0–100): instrument or voice, athletics, programming, cooking, art, and languages (one entry per language, with fluency). Practice activities have diminishing returns, skills decay slowly without practice, and skills gate jobs, events, and fame.

### 5.13 Activities
25 or more, grouped (Mind and body, Social, Love (18+), Money, Fun, Crime, Travel, Admin) and gated by age. Each has at least 3 outcome texts. Include: gym, meditate, study at the library, doctor, diet, therapy, plastic surgery, night out, vacation, lottery, casino, volunteer, practice a skill, learn a language, write a novel, find a date (18+), dating app (18+, after 2012), driving test, emigrate, write a will, rehab, the crime menu, fertility clinic (18+), adopt (18+).

### 5.14 Achievements and life titles
- 30 or more achievements with toasts when earned and an Achievements screen.
- At death, a life title (12 or more) chosen from the life's record, shown on the obituary. Examples of the voice: "The Accountant Who Got Away With It", "Professional Disappointment".

### 5.15 Generations and legacy
- At death, continue as any living child aged 18 or over, or as a younger child from their current age. Inheritance follows the will; the family tree and history carry over.
- The Dynasty view lists each generation's name, years, title, net worth at death, and cause of death, plus a legacy score that adds up achievements, wealth, fame, and family size.

### 5.16 Saves
- Versioned JSON (`schemaVersion`) with a migration hook.
- Autosave after every year, manual save, and a Lives screen listing each life or dynasty (load, rename, delete, export, import).
- A snapshot ring buffer of the last 20 years per life backs the rewind cheat.

## 6. Screens and controls
Window: 1280×820 by default, minimum 1024×700.

**Main screen**
- Header: avatar emoji, full name, age, flag and city, year, cash, a fame badge once fame is above 0, and a cheat badge if the life has used cheats (settings can hide it).
- Left column: the four visible stats as bars with values and a 20-year sparkline; traits as chips with modifier tooltips; quick facts (stage, school or job, relationship status, net worth).
- Centre: the life log, grouped by age with sticky headers, newest at the bottom, auto-scrolling, a category emoji per line, with a search box and category filters.
- Right column, four tabs: Occupation (school, job, military, fame), Assets (finances, homes, vehicles, possessions, investments, loans), Relationships (grouped list, family tree button, interactions), Activities (grouped and searchable).
- Bottom centre: a large Age Up button.

**Modals:** events (emoji, text, numbered choice buttons), confirmations, and forms (buy, apply, invest).

**Other screens:** Start (Continue, New Life, Lives), New Life (random or custom), Obituary (summary, title, stats, cause, Continue as child or New Life), Dynasty, Family tree, Achievements, Finances, Settings, Help (shortcut list).

**Keyboard:** Space ages up. 1–4 choose in a popup. Esc closes the top modal or panel. ⌘1–⌘4 switch tabs. ⌘K opens a command palette that finds any available action. ⌘S saves. ⌘L opens Lives. ⌘, opens Settings. `?` opens Help. Backquote or ⇧⌘K toggles cheats.

**Settings:** theme (system, light, dark), text size, popups per year (1–5), cheat badge on or off, autosave on or off, reduced motion.

## 7. Visual style
Calm and native to macOS: the system font stack, 14 px base size, an 8 px spacing grid, 10 px corner radii, light shadows, one accent colour, and colour tokens for light and dark themes as CSS custom properties. Stat bars are red below 30, amber from 30 to 59, green from 60. Emoji serve as avatars and icons, so there are no image assets. Transitions stay at or under 150 ms and disappear with reduced motion. The log is the centre of the screen; give it room.

## 8. Cheats

### 8.1 Access
Backquote or ⇧⌘K anywhere in the game, plus a Cheats menu in the Electron menu bar. The panel slides in from the right (480 px) with tabs and a console along the bottom.

### 8.2 One registry
Every cheat is defined once (`id`, `group`, `label`, a `params` schema, and a pure `run(state, params)`), and both the GUI forms and the console use that definition. Console examples: `money add 1000000`, `stat health 100`, `age set 40`, `event fire teen_party_parents_away`, `npc 12 rel 100`. The console has autocomplete, history on ↑ and ↓, and `help [command]`.

### 8.3 Required cheats (40 or more in total), by tab
- **Character:** set any stat; lock or unlock a stat; rename; set gender, attraction, appearance; add or remove traits; set skills; set language fluency; set fame and notoriety; set karma.
- **Money and assets:** add or set cash; infinite money toggle; pay off all debts; spawn any asset from the catalog; set an asset's value or condition; set investment values; set salary.
- **Relationships:** list NPCs; set relationship; kill or revive; spawn an NPC by role (friend, partner, spouse, child, sibling, parent) with chosen traits; force romantic interest (adults only); instant marriage or divorce; have a baby now (adults only); edit NPC stats and traits.
- **Career and education:** grant a degree (any major and level); set job and level; promote or demote; set performance; set military rank, branch, and specialty; set discharge type; retire now.
- **Health and legal:** cure everything; add an illness; set addiction levels; immortality; clear criminal record; release from prison; set sentence; end probation.
- **Events:** a searchable list of every event showing whether it's eligible right now and why not; fire any event now (optionally ignoring its conditions); reroll the current popup; switch categories off; list and fire pending chain steps.
- **World and time:** skip N years; rewind N years from snapshots; emigrate instantly; set the inflation multiplier; set the RNG seed; force-success toggle (skill checks, applications, dates, crimes all succeed); no-bad-events toggle.
- **Debug:** hidden-stats overlay; per-year event probability view; JSON state viewer with validated editing; export or import the current life; fast-forward to death with the sim bot.

### 8.4 Cheated lives
Using a cheat marks the life as cheated (header badge and a note on the obituary) unless that's switched off in settings. Achievements still count.

## 9. Architecture

### 9.1 Stack
Electron (current stable), electron-vite (or plain Vite plus esbuild if it fights you), React and TypeScript, a small store (Zustand or `useSyncExternalStore`), plain CSS with custom properties, Vitest, Playwright, ESLint with typescript-eslint, Prettier, zod at the boundaries (saves, imports, IPC), @electron/packager for packaging, and @axe-core/playwright for accessibility checks.

### 9.2 Layout
```
src/
  engine/        pure TS: state, rng, life, stats, events/, systems/, actions, cheats/, save
  content/       typed data: events/, jobs, majors, countries/, names/, illnesses, traits, skills,
                 activities, achievements, assets, crimes
  renderer/      React UI: app/, screens/, components/, store/, styles/, platform/ (SaveStore adapters)
  main/          Electron main process: window, menu, IPC save handlers
  preload/       contextBridge API
scripts/         sim, sim-coverage, content-check, check-hygiene, shots, check-mac-bundle, make-icon
tests/           Vitest: engine/, content/, integration/
e2e/             Playwright web specs and the Electron smoke specs
build/           icon sources and generated icons
```

### 9.3 Engine API (indicative)
```ts
newLife(opts: NewLifeOptions, seed: number): GameState
ageUp(s: GameState): Step
choose(s: GameState, choiceId: string): Step
act(s: GameState, action: PlayerAction): Step        // activities, interactions, purchases, applications
availableActions(s: GameState): ActionGroup[]
runCheat(s: GameState, id: string, params: unknown): Step
serialize(s: GameState): string
deserialize(json: string): GameState                  // validates and migrates
type Step = { state: GameState; log: LogEntry[]; toasts: Toast[] }
```
`GameState` is plain JSON data. RNG state, pending events, scheduled chain steps, snapshots, and the settings that affect simulation all live in it.

### 9.4 Determinism
A seeded PRNG (sfc32 or similar) whose state lives in `GameState`. The same seed and the same inputs give an identical state hash after any number of years, including across a save and load.

### 9.5 Persistence
The renderer talks to a `SaveStore` interface. In Electron it goes over IPC to the main process, which keeps files in `app.getPath('userData')/saves/<id>.json`, writes atomically (temp file, then rename), and keeps one `.bak` per save. In the browser (tests and `dev:web`) it uses localStorage. Timestamps come from the platform layer, never from the engine.

### 9.6 Electron security
contextIsolation on, nodeIntegration off, sandbox on, a strict Content-Security-Policy, no remote content, loading other pages and opening new windows both blocked, and a narrow typed preload API (`saves.list/read/write/delete`, `saves.exportDialog/importDialog`, `app.version`) with input validation in the main process.

### 9.7 Menu
App (About, Settings, Quit), File (New Life, Save, Lives, Export, Import), Edit (standard), View (zoom, full screen, dev tools in development builds only), Cheats (open panel, the toggles), Window, Help (shortcuts).

### 9.8 Packaging
`dist:mac` uses @electron/packager: platform darwin, arch arm64, asar, bundle id `dev.local.lifespan`, app category games, icon `build/icon.icns` generated from an SVG with pure-JS tools. If icon generation fights you, ship without a custom icon and log it. Output goes to `release/`. The owner signs it ad hoc on the Mac. `dist:linux` produces an unpacked linux-arm64 build for the packaged smoke test.

### 9.9 Performance budgets
`ageUp` under 50 ms for a 70-year-old with 40 NPCs (benchmark test). The log stays smooth at 5,000 entries (virtualize or paginate). First paint of the built app under 1.5 s.

## 10. Testing
- **Unit (Vitest):** every engine system, the RNG, formulas (amortization, tax, mortality), event selection and pacing, token rendering, every cheat command, save round trips and migrations.
- **Content:** schema, unique ids, token resolution, the adults-only rule, thresholds.
- **Simulation:** headless bots play whole lives. Personas: default, careerist, criminal, family, military, musician, emigrant, chaos. Invariants and balance bands are in DONE §4. The coverage run reports which events fired across 2,000+ lives.
- **End to end (Playwright on the web build):** the flows in DONE §5, failing on console errors, plus axe scans.
- **Electron smoke:** the built app launches under xvfb, plays a year, and writes a save file.
- **Visual review:** `npm run shots`, then read the PNGs and fix what looks wrong.

## 11. Writing guide
- Second person, present tense. One to three sentences per event, 280 characters at most.
- Specific beats generic. "Your uncle sells you a 'barely used' car that leaks something blue" beats "You buy a used car."
- Dry humour by default. Death, illness, grief, and addiction are played straight and kept brief.
- Choices are short verb phrases ("Lend it", "Refuse", "Ask what the thing is"). Each leads somewhere different; no fake choices.
- Outcome text resolves the moment and hints at the stat change without numbers.
- When an event involves someone, use their name and their memory of you.
- Originality: no BitLife text or recognisable BitLife jokes. No real celebrities, brands, or companies; invent them. Real countries and cities are fine.
- Romance follows the adults-only rule in CLAUDE.md. No self-harm or suicide content. Crime and drugs stay abstract: consequences, never instructions.
- Vary openings. `content:check` flags duplicate texts.

## 12. Out of scope
Online features, accounts, telemetry, multiplayer, anything involving real money, real celebrities or brands, audio files (procedural sound is a stretch item), localization, Windows and Linux distribution, code signing and notarization.
