# Lifespan: final report

## What was built

Lifespan is a single-player life simulator for macOS, built with Electron, React and TypeScript. You live one year at a time from birth to death.
- **Engine:** pure and deterministic, with seeded randomness, so the same seed and choices give the same life.
- **Content:** 307 original events (24 chains) shape each year.
- **Systems:** family, friends and adult romance; school, university and 51 careers; the military, music and fame; money (inflation, local currencies, tax, loans, bankruptcy, investments); homes, vehicles and possessions; 25 illnesses and six vices; crime, courts and prison; 13 countries with emigration; traits, skills and languages; achievements, life titles, wills, and generations you can continue as your child.
- **Cheats:** a full cheat menu (69 commands). One registry drives both the GUI forms and a console with autocomplete, plus a 20-year rewind.
- **Interface:** the app is keyboard-first (Space, 1–4, ⌘K command palette) and has light and dark themes.

## Installing the Mac app

`npm run dist:mac` builds an unsigned `release/Lifespan-darwin-arm64/Lifespan.app` in the container. On the Mac, run `bash overnight/install-mac.sh`. It copies the app to /Applications (or ~/Applications), clears quarantine, signs it ad hoc, verifies the signature and opens it. If that build won't run, `bash overnight/build-mac.sh` (needs Node on the Mac) clones the repo, runs `npm ci && npm run dist:mac` natively, and installs the result the same way. The README covers both.

## Item status

- PLAN items: 96. All pass at the end of this session, and none are waived. `progress/WAIVERS.md` has no entries.
- M0.6, M12.2 and M12.3 (packaging and the packaged smoke test) work in the container. `dist:mac`, `check-mac-bundle`, `dist:linux` and `electron:smoke:packaged` all run here.
- The audit flipped M7.4 (loans) back to failing because overdraft debt grew without limit. It was fixed (see below) and passes again.

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
- Toasts sit in the bottom of the left column. At 1024×700 they can cover the quick facts for their 4 seconds.
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

- `npm run verify` passes every step in about 73 s:
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
  - 334 Vitest tests in 53 files.
  - 42 Playwright e2e tests, covering DONE §5 flows 1–15 plus extras.
  - 3 Electron smoke tests.
  - The packaged smoke test against the `dist:linux` build.
- Sim: 300 seeded lives, 0 invariant violations, every band passing.

  | Band | Result |
  |---|---|
  | Median age at death | 74 |
  | Reached 18 | 99.3% |
  | University degree | 48.7% |
  | Employed by 25 | 100% |
  | Married by 30 | 82.1% |
  | Children by 40 | 78.0% |
  | Ever imprisoned | 0% |
  | Median net worth at death | $705k |
  | Mean happiness | 66.7 |
  | Most common popup share | 1.9% |
  | Runtime | about 34 s |

- Coverage: `sim:coverage` ran 2,080 lives across 8 personas and fired all 307 events (100%) against an 85% target. Every persona also passes the invariants inside verify (`tests/integration/persona-invariants.test.ts`).
- Content (all DONE §3 thresholds enforced):

  | Content | Count |
  |---|---|
  | Events (in 24 chains) | 307 |
  | Full-time jobs (14 fields) | 51 |
  | Part-time jobs | 10 |
  | Majors / grad programs | 16 / 4 |
  | Military specialties | 6 |
  | Interactions | 20 |
  | Activities | 37 |
  | Illnesses | 25 |
  | Traits / skills | 22 / 7 |
  | Achievements / life titles | 40 / 19 |
  | Crimes | 12 |
  | Vehicles / possessions / home types | 12 / 13 / 6 |
  | Countries | 13 |
  | Cheat commands | 69 |

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
