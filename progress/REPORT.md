# Lifespan: final report

## What was built

Lifespan is a single-player life simulator for macOS, built with Electron, React and TypeScript. You live one year at a time from birth to death.
- **Engine:** pure and deterministic, with seeded randomness, so the same seed and choices give the same life.
- **Content:** 588 original events (45 chains) shape each year, including career-specific events for all 14 job fields, life after prison, life abroad, and the wider world.
- **Systems:** family, friends and adult romance; school, university and 51 careers; the military, music and fame; money (inflation, local currencies, tax, loans, bankruptcy, investments); homes, vehicles and possessions; 25 illnesses and six vices; crime, courts and prison; 13 countries with emigration; traits, skills and languages; achievements, life titles, wills, and generations you can continue as your child.
- **Cheats:** a full cheat menu (72 commands). One registry drives both the GUI forms and a console with autocomplete, plus a 20-year rewind.
- **Interface:** the app is keyboard-first (Space, 1–4, ⌘K command palette) and has light and dark themes.

## Installing the Mac app

`npm run dist:mac` builds an unsigned `release/Lifespan-darwin-arm64/Lifespan.app` in the container. On the Mac, run `bash overnight/install-mac.sh`. It copies the app to /Applications (or ~/Applications), clears quarantine, signs it ad hoc, verifies the signature and opens it. If that build won't run, `bash overnight/build-mac.sh` (needs Node on the Mac) clones the repo, runs `npm ci && npm run dist:mac` natively, and installs the result the same way. The README covers both.

## Item status

- PLAN items: 96. All pass at the end of this session, and none are waived. `progress/WAIVERS.md` has no entries.
- M0.6, M12.2 and M12.3 (packaging and the packaged smoke test) work in the container. `dist:mac`, `check-mac-bundle`, `dist:linux` and `electron:smoke:packaged` all run here.
- The audit flipped M7.4 (loans) back to failing because overdraft debt grew without limit. It was fixed (see below) and passes again.

## Since the first draft (stretch items S1–S11; the fun pass is S12–S15)

After the first draft was finished, the owner asked to keep going. Each item below is tracked in `progress/features.json` with its evidence.
- **S1 Buy dialog:** buying a home, vehicle or item is a modal form (SPEC §6). Homes get a live mortgage quote: term, deposit, rate, yearly and total cost.
- **S2 Job perks:** perks now do something. Insurance halves medical bills, pensions pay more, and bonuses, stock options and tips follow your performance. Flexible work lowers stress. The UI says what each perk does.
- **S3 Other people's lives:** family and friends marry, divorce, change jobs, get promoted, move (some abroad), have babies, have health scares and come into money. You get at most three pieces of news a year, starting in your teens, and distance fades ties.
- **S4 Family tree:** lines join each child to their parents, couples sit over their children, hovering a person highlights their links, and the view opens centred on you.
- **S5 Event coverage:** every event can fire. Bots buy homes, keep vice habits and chase a dream career field. Mid-career workplaces include young colleagues. Every persona passes the invariants inside verify.
- **S6 Toasts:** compact, at the bottom of the left column, under any open dialog.
- **S7 Injuries:** recorded as minor, major or serious. They heal over years or linger, and physio or surgery treats them. Save format v2 migrates old saves.
- **S8 Careers and romance:** career events for all 14 job fields, plus career-arc moments and a second romance pack: 76 events.
- **S9 Life goals:** from 14 you choose up to three of 20 aspirations. Reaching one is celebrated and the obituary records it. Save format v3.
- **S10 More packs:** crime, life after prison, travel and life abroad, and community/world events (51 events). Old cellmates can find you after release. Bankruptcy now covers every unsecured debt; the new persona sweep found that bug.
- **S11 Story matches state:** moving abroad with a partner really moves you, the obituary records military service, and service counts as a career in life titles.

## The overnight run (S17–S22)

- **Full character customization (S17):** the New Life screen has Who, Look (skin and hair), Where and when (including who raised you and how many siblings you have), Nature (traits and a gift for one skill) and Starting stats. Each section has its own dice, plus Roll everything and a live preview. In life you can practise a chosen skill, get a new look, or change your name.
- **UI passes (S18):** three passes over every screen, covering contrast, clipping, button hierarchy, title case, tooltips, toast placement, empty states and the finance chart.
- **Challenges (S19):** 12 premised lives with goals and deadlines, one of which spans generations. You pick them on New Life, see their status on the goals card, and get a line in the obituary. Completions are remembered across lives.
- **Feedback and motion (S20):** a result card after every choice that shows what changed and why; stat deltas for the year; fresh log lines highlighted; short entrances, all off with reduced motion.
- **Callbacks (S21):** 18 events bring old choices back years later (the band you quit, the country you left, the record you carry, the ex you never called).
- **Free time (S22):** a year holds only so many activities. You get 7 out of work and 9 when retired; full-time work costs 2, studies 1, and small children 1. Health care, paperwork and prison life are free. The Activities tab shows what's left and why, so casual play rarely hits the limit, but you can't do everything every year.
- **Drawn portraits (S23):** layered SVG faces replace the emoji avatars. The New Life builder has 10 tabs: skin and freckles, 5 face shapes, 13 haircuts in 13 colours, 5 eye shapes in 6 colours, 6 brows, 6 noses, 5 mouths, 6 kinds of facial hair, 5 glasses and 5 tops in 10 colours. Every option is drawn on your own face, and the preview shows you at 1, 8, 30 and 75. Portraits age, from a baby's round face and blush to greying hair and lines. Everyone in your life has a face: blood relatives take after you, and your children mix you and their other parent. An heir keeps the face they had as your child. A makeover (hair, colour, facial hair, glasses, clothes) shows a live preview. Save v6 builds a portrait for older saves from their old hair and skin tone.
- **Faces everywhere (S24–S25):** expressions follow happiness (a frown and worried brows when miserable) and health (pale, tired eyes when ill). Faces appear in event popups (whoever the event is about), the family tree, the Lives list and the Continue button. Cosmetic surgery uses the builder to change face, eyes, brows, nose or mouth. Most patients get what they picked, some get a bill, and complications pick a nose for you.
- **Pets (S26):** adopt a dog, cat, rabbit, hamster, parrot, goldfish, tortoise or horse from age 6. Children get one small pet that the parents pay for. Each pet has a name, a bond and its own health. Play, walks (dogs and horses) and the vet build the bond; neglect wears it down, and a neglected cat or dog may wander off. Pets cost upkeep, lift your mood when the bond is strong, age on their own clock (a hamster lasts two years, a tortoise outlives you), are mourned when they die, pass to your heir, and are rehomed if you go to prison. 20 pet events name them, the obituary remembers them, and the Relationships tab lists the living and the remembered.
- **Accessories (S27):** earrings (studs, hoops, drops, gems) and headwear (beanie, cap, bucket hat, fedora, headscarf). Hats tuck tall hair away; a headscarf covers it.
- **Playtest fixes (S28–S30):** a fresh-eyes reviewer read ten bot lives, and the fixes cover what they found:
  - Names, fertility and named strangers: nobody new shares a first name with your family; fertility ends in the mid-forties (no more births at 64); a friend named in an event's text gets that name.
  - Words: wealth titles convert currency; crimes are charged as nouns ("arrested for burglary"); NPC pronouns and grammar are fixed.
  - Prison: cellmates don't send you photos from outside, and talking to someone from prison happens across a visiting table.
  - Text that assumed things: no imaginary pets; the family-dog choice brings home a real dog; money words are local.
  - Timing: early-relationship events stay early; the empty nest comes when the youngest leaves.
  - Repetition: yearly lines are fresher and repeats grow rarer. 16 long-sentence prison events were added, plus six callbacks after release.
- **Mini-games (S31–S32):**
  - **Prison escape:** a turn-based plan across the yard past patrolling guards and their sight lines, before dawn. The yard is seeded and always solvable, and turning back costs nothing.
  - **Casino blackjack:** pick a table, play up to five hands (hit, stand, double), and cash out.
  - **How they're decided:** the engine replays your moves, so the result is exactly what you played.
- **On the run (S33):**
  - An escape leaves you a fugitive. The years you still owe follow you, and you can't take a job without papers (false ones can be bought, at a risk).
  - Each year the chance of a 6 a.m. knock fades. After twenty years nobody is looking, and turning yourself in takes two years off.
  - Eight events cover your face on the news, false papers, a police checkpoint, cash-in-hand work, an old cellmate who recognises you, a birthday call home, the ten-year mark and the quiet life.
- **UX fixes (S34):** from a second reviewer who played the app in a browser:
  - Space always ages up, even when a button still has focus after a dialog closes.
  - Grades compare you with children your age (an average child earns a C), report cards start at 9, and universities want a B.
  - Parents pay for a child's doctor, lessons and treatments.
  - An adult heir keeps their job, and their diploma matches their grades.
  - The lease event really moves you out; no imaginary family dog; "your share of the estate".
- **Dating (S35):** Find a date and dating apps offer three drawn people, each with a job, two traits, a line about them, and whether they want children or marriage. The face on the card is the face you get. Relationships get serious more surely the longer and warmer they are.
- **Deeper arcs (S51–S57), from a game-design review:**
  - A novel is now a multi-year project. You draft year by year, then revise, send it out or shelve it. Rejections can mean revising or self-publishing, an offer can be taken or held out on (risky), and reviews follow.
  - A new Threads card in the left column keeps open storylines in view: the book, a baby on the way, prison time, life on the run, studies, and things still unfolding with someone.
  - Music takes free time and can flop, tours can go wrong, and fame comes slower (the musician bot reaches fame 90 at 31 instead of 21).
  - Real money brings real decisions, with stakes as a share of your net worth: a sibling's house deposit, a friend's startup, a foundation, a lawsuit, a holiday home.
  - A serious diagnosis is a decision: the hard road (strongest treatment, side effects, time off), the gentle one, or a second opinion.
  - Children take after the face you were born with, so a makeover or surgery doesn't change theirs.
  - People act on what they remember: someone with a strong memory of you, a kindness or a wound, brings it back years later.
  - Events that need phones, apps or video calls only happen from 2008, and the content check enforces it. The most-repeated activity lines have four variants each (the worst repeat per life fell from 38 to 10).
  - A re-measurement found the gains: lasting choices up across adulthood, mid-life decisions up, the musician's fame at 27 instead of 19, and the worst repeated line per life down from 39 to 11. Its bugs are fixed: unique book titles, a tenure clock for crossroads, settled memories, a long-engagement nudge, follow-ups for the holiday home, the foundation and the drawer novel, no corner-shop job offers for the rich, varied failed-treatment and refused-promotion lines, and "across the United States".
  - Every five to eight years in a job brings a crossroads: take the team or stay hands-on, a rival's offer (take it, counter, or stay), a redundancy package, or a sabbatical.
  - Living with your parents costs board from 23; unemployment support is means-tested; alternative events (three gap years) happen at most once.
- **More to do (S39–S49):**
  - Achievements for pets, escapes and blackjack, plus Passport Stamps for twelve holiday destinations, each with its own lines.
  - A setting that switches off the free-time limit.
  - Records across lives on the start screen, toddler activities, and 20 childhood events with callbacks later in life.
  - Pets' faces in their popups; dynasty and obituary portraits; nephews, nieces, aunts and uncles for heirs.
  - Life on the run is shown on screen; fixes from two more playtests and a second browser review.
- **Polish (S36–S38):**
  - Panels show what an action did; children can study harder from the Occupation tab; buying a car warns about a missing licence.
  - The side columns fade where there is more below.
  - Partners' panels say whether they want children or marriage.
  - Pets are drawn too: eight animals in varied coats, in the list, the panel and the adoption picker.


## Late life (S16)

Many lives ended abruptly ("You died at 63."), and the senior years were the thinnest part of the game.
- **A warning before the end:** when your yearly risk of dying passes 7%, a doctor says so and names the main worry. You can take it seriously (a real health boost), write a bucket list, or carry on. This happens at most every six years. About 55% of lives get a warning, a median of five years before death.
- **The bucket list:** an activity from 55, once a year, with an achievement for five ticks and a line in the obituary.
- **A late-life pack (18 events):** grandchildren (lessons, babysitting, a teenager who needs a bed, their graduation), retirement (the first free Monday, a hobby that takes over, being called back as a consultant, volunteering), reunions, memoirs, an old flame's parcel, a friend's funeral, a new hip, the driving keys, downsizing, and one last adventure.
- **Balance headroom:** fewer partners want children (45%) or marriage (25%), and the happiness baseline is lower. Married, children and happiness now sit 6–8 points under their ceilings.

## Fun pass (S12–S15)

The owner asked for a pass on whether the loop is fun. I measured 60 lives played passively (Age Up plus random answers), read whole lives as a player would, and fixed what got in the way.

| | Before | After |
|---|---|---|
| Years with no decision, ages 0–4 | 50% | 17% |
| Years with no decision, ages 5–64 | 26–31% | 13–17% |
| Popups a year (ages 5+) | 1.1–1.3 | 1.3–1.5 |
| Word-for-word repeated log lines per life | 26 | 17 |
| Bankruptcies per passive life | 3.4 | 0.18 |
| Popup outcomes that depend on who you are | none | every choice with a marked success |

What changed:
- **Feedback:** after every choice, a result card shows what you chose, what happened, coloured changes to Happiness, Health, Smarts, Looks, money, fame and relationships, and any knock-on effects. One key continues. Under Age Up, "This year" sums up the year so far.
- **Your character matters:** traits, skills and the relevant stat tilt each popup toward its success outcome, capped at ±25 points. When that decides it, the card says why ("Being Charming helped").
- **A log that reads as a story:** each choice outcome keeps its setup (one muted line) and the option you picked.
- **Less noise:** minor illnesses are half as frequent and recover quietly. Notices and repeat illnesses are never told the same way twice. Report cards vary and show the trend.
- **A better opening:** a baby and toddler pack gives decisions from the first Age Up.
- **No dead-end lives:** job leads offer real work to the unemployed, and a modest benefit is paid while out of work. Housing costs follow income, so an entry-level renter can make ends meet; the old costs made every non-graduate life loop through bankruptcy. Adults move out once both parents have died.
- **Life goals are announced** at 14.

## Fresh-eyes audit (DONE §7)

**How it was done:**
1. I re-read SPEC from top to bottom and mapped each section to the code and to the check that covers it (table below).
2. I played three lives through the UI with Playwright (`e2e/audit/three-lives.spec.ts`, run with `npx playwright test -c playwright.audit.config.ts`): an ordinary life, a criminal life and a military life.
   - Choices were random, and cheats were used only to skip dull adult stretches.
   - Screenshots were taken at 0, 5, 14, 22, 35, 55 and 70, plus the obituary, into `reports/audit/`.
   - I looked at every screenshot.

**Fixes made because of the audit:**
- **Runaway debt (broke M7.4):** a broke criminal died owing $24.8M, because overdraft debt compounded at 19% forever.
  - Unsecured debt above max($40k ref, 2× salary) now ends in bankruptcy: savings and investments go to creditors and the rest is wiped.
  - A sim invariant now fails if debt runs away again.
- **Prison life:** outside-world events (commutes, long walks) were firing in a cell.
  - Only `inPrison` events fire inside now: the court events plus a new pack of 10 prison events (visits, letters, cellmate, kitchen job, contraband, classes, parole board, lockdown).
  - Chain steps due inside wait until release.
- **New-life form:** custom lives always started female and attracted to men. Both now default to "Surprise me".
- **Romance:** you can meet a partner through work (SPEC §5.1). `meet` can turn a coworker who fits your attraction into a partner.
- **Gifts:** a gift can be money or a possession (SPEC §5.1), and bigger gifts land better.
- **Skill tooltips:** these now show the actual modifier at your level (SPEC §2).
- **DONE §5 flow 15** has its own spec (`e2e/playthrough.spec.ts`: 45 Age Ups with seeded random choices). A test checks that every flow from 1 to 15 has a spec.
- **Absent NPCs:** events no longer bind cut-off NPCs or children lost in a custody fight (SPEC §4.3).
- **Text fixes:**
  - "Complications of copd" now reads "COPD".
  - "Worked as Laborer" now reads "Worked as a laborer".
  - "You buy a upright piano" now uses "an".
  - Degrees show the major's name, not its id.
  - The Education heading no longer shows empty before school starts.
- **New tests:** the income tax formula, alimony, prison and relationship stat drift, and achievements in cheated lives.

| SPEC section | Files | Checks | Gaps |
|---|---|---|---|
| §1 Pillars | `engine/age.ts`, `rng.ts`, `npc.ts` | `determinism.test.ts`, sim | none |
| §2 Improvements | `life.ts`, `describe.ts`, `events/select.ts`, `app/keys.ts`, `legacy.ts` | `newlife`, `events-pacing`, `events-chains`, e2e `keyboard`, `settings` | skill tooltips added in the audit |
| §3.1–3.3 Character, stats, stages | `types/state.ts`, `stats.ts`, `stage.ts` | `stats.test.ts`, `ageup.test.ts` | prison and relationship drift tests added |
| §3.4 One year | `age.ts`, `systems/index.ts` | `ageup.test.ts` | none |
| §3.5 Mortality | `mortality.ts`, `systems/health.ts` | `mortality.test.ts`, sim bands | none |
| §4.1–4.2 Event kinds and definition | `events/types.ts`, `apply.ts`, `choose.ts` | content:check, `event-popup.spec.ts` | some effect kinds are covered only through the sim and content checks |
| §4.3 Selection and pacing | `events/select.ts` | `events-pacing.test.ts` | absent NPCs fixed in the audit |
| §4.4–4.5 Tokens, chains | `events/tokens.ts`, `select.ts` | `events-tokens`, `events-chains` tests | none |
| §5.1 Relationships | `npcs.ts`, `interactions.ts`, `gifts.ts`, `romance.ts`, `inheritance.ts`, `family-tree.ts` | `family`, `interactions`, `romance` tests; e2e `relationships` | work romance and gifts added in the audit; NPC milestones (S3) after it |
| §5.2 Education | `systems/education.ts`, `content/education.ts` | `education.test.ts`, e2e `careers` | none |
| §5.3 Careers | `systems/careers.ts`, `content/jobs*.ts` | `careers.test.ts`, e2e flow 4 | perks given real effects after the audit (S2) |
| §5.4 Military | `systems/military.ts`, `content/military.ts` | `military.test.ts` | none |
| §5.5 Music and fame | `systems/music.ts`, `events/fame.ts` | `music.test.ts` | none |
| §5.6 Money | `economy.ts`, `finance.ts`, `loans.ts`, `banking.ts` | `finance.test.ts`, sim invariants | bankruptcy and the tax test added in the audit |
| §5.7 Assets | `systems/assets.ts`, `content/assets.ts` | `finance.test.ts`, e2e flow 6 | none |
| §5.8–5.9 Health, vices | `health.ts`, `illness.ts`, `vices.ts` | `health.test.ts`, `vices.test.ts`, `injuries.test.ts` | injury records with healing, lingering and treatment added after the audit (S7) |
| §5.10 Crime and justice | `crime.ts`, `legal-effects.ts`, `events/legal.ts`, `events/prison.ts` | `crime.test.ts`, e2e flow 7 | prison events added in the audit |
| §5.11 Countries | `content/countries/*`, `emigration.ts` | `world.test.ts`, e2e flow 8 | none |
| §5.12 Traits and skills | `content/traits.ts`, `skills.ts`, `describe.ts` | `world.test.ts`, e2e `settings` | none |
| §5.13 Activities | `content/activities*.ts`, `activities.ts` | content:check, `romance`, `health` tests | none |
| §5.14 Achievements | `achievements.ts`, `titles.ts` | `achievements.test.ts` | none |
| §5.15 Generations | `legacy.ts`, `ContinueAsChild.tsx`, `DynastyView.tsx` | `legacy.test.ts`, e2e flow 10 | none |
| §5.16 Saves | `save.ts`, `savefile.ts`, `platform/saveStore.ts` | `save`, `savefile` tests, e2e flow 9 | none |
| §6 Screens and controls | `screens/**`, `app/keys.ts` | e2e `layout`, `keyboard`, `settings`, `obituary`, `assets` | buy dialog added after the audit (S1) |
| §7 Visual style | `styles/*.css`, `StatBar.tsx` | shots, e2e a11y (flow 14) | none |
| §8 Cheats | `engine/cheats/*`, `renderer/cheats/*`, `main/menu.ts` | `cheats/*.test.ts` (one per command), e2e flow 11 | none |
| §9 Architecture | `main/*`, `preload/*`, `scripts/dist.ts` | `security.test.ts`, `menu.test.ts`, electron smoke, packaged smoke, perf tests | none |
| §10 Testing | `tests/**`, `e2e/**`, `scripts/sim*.ts` | verify | flow 15 spec added in the audit |
| §11 Writing guide | `content/events/GUIDE.md`, `scripts/content-lib.ts` | content:check | originality is checked by hand, not by code |
| §12 Out of scope | `scripts/check-hygiene.ts` | hygiene | none |

## Known issues and limitations

- Originality and "no self-harm" are enforced by the writing guide and by hand review. `content:check` catches duplicates, banned words, tokens and age rules, but not originality.
- Toasts sit bottom-right, under any open dialog, for 2.5 seconds; at 1024×700 they can briefly cover the bottom of the right panel.
- The default bot persona never commits crimes (DONE §4), so the 300-life sim shows 0% imprisoned. The criminal persona in `sim:coverage` covers prison.

## Ten key decisions

1. **Toolchain versions:** pinned vite 7 and TypeScript 6.0, because electron-vite 5 and typescript-eslint don't support vite 8 or TypeScript 7 yet.
2. **One engine call per year:** a pure `ageUp(state) → {state, log, toasts}` over a cloned draft, with the sfc32 RNG state kept inside the game state. This gives bit-identical replays, and save/load and rewind can be checked by hash.
3. **Rewind check:** uses `lifeHash`, which leaves out the snapshot ring and the cheat marker, since both legitimately differ after a rewind.
4. **Child deaths are capped:** under-18 mortality is capped on top of the SPEC §3.5 formula, so at least 90% of lives reach 18.
5. **Illness risk:** additive across illnesses and scaled by 0.15, and chronic illnesses stop progressing above 60. This keeps the median age at death near 74 instead of 58.
6. **Family rates:** 40% of partners don't want children and 20% won't marry; proposals need the serious stage; adoption is gated. This keeps the marriage and children bands realistic.
7. **University entry:** needs a school average of 55. Community college takes anyone, and veterans are exempt, so degrees land near 49% and not almost everyone.
8. **Money units:** amounts are stored in local nominal currency and written in content as 2026 reference dollars. `money(s, ref)` converts them by country price or wage level and inflation.
9. **Bankruptcy:** unsecured debt ends in bankruptcy past max($40k ref, 2× salary). Without it, SPEC §5.6 debt compounded into the trillions.
10. **Prison:** in prison only `inPrison` events fire, and outside chain steps wait for release.

## Verification evidence

- `npm run verify` passes every step in about 97 s:
  - typecheck 5 s
  - lint 2 s
  - hygiene 0.3 s
  - test 12 s
  - content:check 0.3 s
  - sim 34 s
  - build 3 s
  - e2e 11 s
  - electron:smoke 2 s
- Tests:
  - 386 Vitest tests in 63 files.
  - 48 Playwright e2e tests, covering DONE §5 flows 1–15 plus extras.
  - 3 Electron smoke tests.
  - The packaged smoke test against the `dist:linux` build.
- Sim: 300 seeded lives, 0 invariant violations, every band passing.

  | Band | Result |
  |---|---|
  | Median age at death | 74 |
  | Reached 18 | 99.7% |
  | University degree | 57.3% |
  | Employed by 25 | 100% |
  | Married by 30 | 79.3% |
  | Children by 40 | 76.8% |
  | Ever imprisoned | 0% |
  | Median net worth at death | $415k |
  | Mean happiness | 67.5 |
  | Most common popup share | 2.0% |
  | Runtime | about 42 s |

- Coverage: `sim:coverage` ran 2,080 lives across 8 personas and fired 581 of 588 events (98.8%) against an 85% target. The few that never fired need rare combinations (a professional athlete aged 20–36, a smoking grandparent), and players can still reach them. Every persona also passes the invariants inside verify (`tests/integration/persona-invariants.test.ts`).
- Content (all DONE §3 thresholds enforced):

  | Content | Count |
  |---|---|
  | Events (in 45 chains) | 588 |
  | Full-time jobs (14 fields) | 51 |
  | Part-time jobs | 10 |
  | Majors / grad programs | 16 / 4 |
  | Military specialties | 6 |
  | Interactions | 20 |
  | Activities | 37 |
  | Illnesses | 25 |
  | Traits / skills | 22 / 7 |
  | Achievements / life titles | 47 / 20 |
  | Crimes | 12 |
  | Vehicles / possessions / home types | 12 / 13 / 6 |
  | Countries | 13 |
  | Cheat commands | 72 |

## Screenshots

`npm run shots` writes each screen below in light and dark, at 1280×820 and 1024×700, into `reports/screenshots/` as `<name>-<theme>-<width>.png` (for example `05-main-adult-dark-1024.png`). The audit lives are in `reports/audit/`.

| File | Screen |
|---|---|
| `01-start` | Start screen |
| `02-new-life` | New Life (custom) |
| `03-main-newborn` | Main screen at birth |
| `04-event` | Event popup |
| `05-main-adult` | Main screen as an adult |
| `06-relationships` | Relationships tab |
| `07-help` | Help and shortcuts |
| `08-settings` | Settings |
| `09-lives` | Lives list |
| `10-npc-panel` | NPC panel with interactions and memories |
| `11-family-tree` | Family tree |
| `12-activities` | Activities tab |
| `13-occupation` | Occupation tab |
| `14-job-listings` | Job listings |
| `15-assets` | Assets tab |
| `16-finances` | Finances view |
| `17-cheats` | Cheat panel |
| `18-cheats-events` | Cheat events tab |
| `19-palette` | Command palette |
| `20-achievements` | Achievements |
| `21-timeline` | Milestone timeline |
| `22-obituary` | Obituary |
| `23-dynasty` | Dynasty |
| `24-buy-home` | Buy dialog with the mortgage quote |
| `25-goals` | Life goal picker |
| `26-result` | Result card after a choice |
| `27-challenges` | Challenge picker |
| `28-look-builder` | Character builder: the hair grid, every option drawn on your own face |
| `29-makeover` | Get a new look: hair, facial hair, glasses and clothes |
| `30-adopt` | Adopt a pet: eight animals, costs and lifespans |
| `31-pet` | A pet's panel: bond, health, play, walk, vet |
| `32-blackjack` | The casino's blackjack table |
| `33-escape` | The prison-yard escape mini-game |
| `34-dating` | Find a date: three people, their faces, and what they want |

**Visual review, problems found and fixed:**
- Modal fade-ins were caught mid-animation.
- Tab labels clipped at 1024 px.
- NPC roles and home listings were truncated.
- Sticky log headers used the wrong surface colour.
- The obituary spilled past its card.
- Toasts stacked over the cheat panel.
- Enroll and enlist selects clipped.
- axe found low-contrast text: the Age Up hint, the light accent, and achievement toasts at 0.6 opacity.
- The milestone timeline was full of colds.

## Suggested next steps

- Add an automated content lint for brand names and sensitive topics on top of the hand review.
