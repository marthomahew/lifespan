# Definition of done

The project is done when the final check in §8 runs clean. That requires every section below.

## 1. Items
Every `[M…]` item in `docs/PLAN.md` has `"passes": true` in `progress/features.json`, with evidence naming checks that exist in the repo and run inside `npm run verify` (M12.2 and M12.3 excepted, see CLAUDE.md). Only M0.6, M12.2, and M12.3 may instead be `"waived": true`, with evidence quoting the container error and a matching line in `progress/WAIVERS.md`.

## 2. `npm run verify`

### 2.1 Steps
In this order, stopping at the first failure and exiting non-zero:
1. `typecheck`
2. `lint` (zero warnings)
3. `hygiene` (§2.3)
4. `test`
5. `content:check` (§3)
6. `sim` (§4)
7. `build`
8. `e2e` (§5)
9. `electron:smoke`, skipped with a printed notice only while `progress/WAIVERS.md` contains a line starting with `- M0.6:`

### 2.2 Constraints
Under 20 minutes in this container. Writes only to gitignored paths. Works from a fresh clone in any directory after `npm ci`.

### 2.3 Hygiene (each finding fails the step)
- `.only(` in tests; `.skip(`, `.todo(`, `.fixme(`, `xit(`, or `xdescribe(` in tests.
- Any `@ts-ignore`. More than 5 `@ts-expect-error`, or any without a reason on the same line.
- `eslint-disable` without a rule name and a reason.
- `TODO`, `FIXME`, `XXX`, `TBD`, or `lorem` (any case) in `src/`.
- `console.log` in `src/` outside the logger module.
- `fetch(`, `XMLHttpRequest`, `WebSocket`, or `http://` and `https://` URLs in `src/renderer` and `src/engine`. The app is offline.
- "BitLife" or "Candywriter" (any case) in `src/`.
- Any file in `src/` over 600 lines, except under `src/content/`.
- A `[Mx.y]` id in `docs/PLAN.md` without an entry in `progress/features.json`.

## 3. Content thresholds (checked by `content:check`)
| Content | Minimum |
|---|---|
| Events (choice and notice) | 250 in total |
| Events per stage: child 0–12, teen 13–17, young adult 18–29, adult 30–49, middle age 50–64, senior 65+ | 40, 40, 45, 45, 30, 30 |
| Notice-only events | at most 25% of all events |
| Event chains (2+ linked events, at least 1 year apart) | 15 |
| Jobs, excluding military and music | 45 across 10+ fields, plus 8+ part-time jobs for ages 14–17 |
| University majors, graduate programs | 12, 4 |
| Military specialties | 6 |
| Relationship interactions | 12 |
| Activities, each with 3+ outcome texts | 25 |
| Illnesses | 20 |
| Crimes, prison activities | 10, 6 |
| Countries | 12, each with 25+ male and 25+ female first names, 30+ surnames, 5+ cities, and complete economy and law data |
| Traits, skills | 15, 6 |
| Achievements, life titles | 30, 12 |
| Vehicles, possessions, home types | 12, 10, 6 |
| Cheat commands | 40 |

An event counts toward the stage that contains the midpoint of its age range; events whose range spans more than 40 years count toward the total only. Also required: no duplicate event texts, no unresolved tokens, 2–4 choices on every choice event, and every romance-category event, interaction, and activity requires the player and every bound NPC to be 18 or older.

## 4. Simulation (`npm run sim`: 300 lives, seeds 1–300, default persona)
The default persona picks uniformly among available choices; each year, with 50% probability, does 0–2 random activities that aren't crimes or vices; enrolls in university when eligible and able to pay, with 60% probability; applies for a random eligible job each year it's an unemployed adult, with 80% probability; accepts romantic progress with 50% probability; never uses cheats. Record any change to these details in DECISIONS.md.

### 4.1 Invariants (any violation fails)
- No exceptions. Every life ends in death by age 120.
- Every stat is an integer within its range every year.
- Money and every other numeric field are finite. No NaN, and no undefined or null where the type doesn't allow it (deep scan every year).
- Each Age Up increases age by one.
- Every log entry and event text is non-empty and has no unresolved tokens.
- Every pending event offers at least one selectable choice.
- NPC ids are unique; no living NPC is older than 120; relationships stay within 0–100; dead NPCs are never bound to events.
- At 10 random checkpoints per life, serialize, deserialize, and continue: the final state hash matches a run that never saved.
- Nobody under 18 is ever involved in romance, pregnancy, or marriage.

### 4.2 Balance bands (default persona)
| Metric | Band |
|---|---|
| Median age at death | 60–92 |
| Lives reaching 18 | 90% or more |
| Lives with a university degree | 15–75% |
| Ever employed full-time (lives reaching 25) | 70% or more |
| Ever married (lives reaching 30) | 30–85% |
| Ever had children (lives reaching 40) | 30–85% |
| Ever imprisoned | 25% or less |
| Median inflation-adjusted net worth at death | above 0 |
| Mean lifetime happiness | 35–75 |
| Share of all popups from the single most common event | 3% or less |
| Runtime for 300 lives | under 180 s |

`reports/balance-report.md` lists each metric, its band, and pass or fail.

## 5. End-to-end flows (`npm run e2e`, web build, Chromium)
One spec per flow. Each fails on any console error or page error.
1. New random life; age to 5 using the button and Space.
2. Custom life creation with every field set.
3. Event popup answered by mouse and by number key.
4. Cheat to age 18, apply for a job, get hired, see it under Occupation.
5. A relationship interaction changes the relationship bar and adds a memory line.
6. Cheat money, buy a home with a mortgage, see the loan under Assets.
7. Commit a crime; the arrest, trial, and sentence or acquittal path completes.
8. Emigrate; currency and country change in the header.
9. Save, reload the page, same life restored; export then import round trip.
10. Death (via cheats), obituary, continue as a child.
11. Cheat panel through both shortcuts; a console command changes state; rewind works.
12. Theme switch persists across a reload.
13. Family tree opens, and clicking a node opens that NPC.
14. axe scans per M11.6.
15. Playthrough: start a life and do 40+ Age Ups by hand with random choices, without errors.

## 6. REPORT.md
`progress/REPORT.md` contains: what was built (one paragraph); how the Mac app gets installed (`scripts/mac/install-mac.sh`, with `scripts/mac/build-mac.sh` as the fallback); item status counts and any waivers; known issues and limitations; the 10 most important decisions; verification evidence (test counts, sim results, coverage percentage, content counts, verify duration); an index of the screenshots in `reports/screenshots/`; suggested next steps.

## 7. Fresh-eyes audit (its own session, after every item passes)
1. Re-read `docs/SPEC.md` from top to bottom. For each section, find the code that implements it and the check that covers it. Put a table in REPORT.md: section, files, checks, gaps.
2. Play three lives through the UI with Playwright (ordinary, criminal, military), using cheats only to skip dull stretches, and capture a screenshot at each life stage. Look at them.
3. Fix every gap that breaks a PLAN item, flipping that item back to `passes: false` first. List smaller gaps under known issues.

## 8. Final check
After README.md and `progress/REPORT.md` are written and everything is committed, run this as one sequence and leave the complete output in the conversation:
```bash
git status --porcelain | wc -l
jq '[to_entries[] | select(.key | test("^M[0-9]+\\.[0-9]+$")) | select((((.value.passes == true) or (.value.waived == true and (.key == "M0.6" or .key == "M12.2" or .key == "M12.3"))) and ((.value.evidence // "") | length >= 5)) | not)] | length' progress/features.json
npm run verify && echo FINAL_VERIFY_OK
rm -rf /tmp/cleanroom && git clone -q . /tmp/cleanroom && (cd /tmp/cleanroom && npm ci && npm run verify) && echo FINAL_CLEANROOM_OK
npm run dist:mac && ls -d release/*/Lifespan.app && echo FINAL_APP_OK
```
The project is done when one uninterrupted run prints `0`, `0`, `FINAL_VERIFY_OK`, `FINAL_CLEANROOM_OK`, and `FINAL_APP_OK`. If M12.2 is waived, skip the last line and say so. If anything fails, fix it, commit, and run the whole sequence again.

## 9. Stretch
The required work ends at §8. For stretch work, take the `[S…]` items in PLAN order, add each to `features.json` as `S1`, `S2`, and so on with evidence, keep verify green after every commit, and rebuild `dist:mac` when you finish.
