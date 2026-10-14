# Plan

Work top to bottom. Every line that begins with an `[Mx.y]` id is a required item with a matching entry in `progress/features.json`. M0–M4 produce a playable core; M5–M12 complete the game. The `[S…]` items are stretch work, done only if the owner sets a new goal after DoD.

Each item's text is its acceptance criterion. Every item needs a check inside `npm run verify` that would fail if the behaviour broke (M12.2 and M12.3 excepted).

## M0. Scaffold and gates
- [M0.1] Electron + electron-vite + React + TypeScript (strict) project builds, and the renderer also runs standalone in a browser through `dev:web` and the web build.
- [M0.2] Every npm script listed in CLAUDE.md exists under that name. `verify` runs its steps in order and stops at the first failure. Steps whose milestone hasn't arrived may print SKIPPED until then; M12.4 removes every skip.
- [M0.3] ESLint (zero warnings) and Prettier are configured, and lint forbids `Math.random`, `Date.now`, and `new Date` in `src/engine` and `src/content`.
- [M0.4] Vitest runs with at least one passing engine test.
- [M0.5] Playwright runs against the built web app (vite preview, port 4173, strictPort); a smoke spec passes; every spec fails on console errors and page errors.
- [M0.6] `electron:smoke` launches the built Electron app under xvfb through Playwright `_electron` and checks the window title. Waivable for container limitations only.
- [M0.7] The Electron security baseline from SPEC §9.6 is in place and a test checks it (webPreferences and CSP).
- [M0.8] `hygiene` implements every check in DONE §2.3.
- [M0.9] `.gitignore` covers build output and reports, and `verify` writes only to gitignored paths.

## M1. Engine core
- [M1.1] `GameState` is plain JSON data with a `schemaVersion`, and a test shows engine functions never mutate their input.
- [M1.2] A seeded PRNG lives in state; the same seed and inputs give an identical state hash after 80 years, including across a save and load midway.
- [M1.3] `newLife` supports random and custom creation (name, gender, attraction, country, city, birth year, appearance, traits, starting stats, family wealth tier).
- [M1.4] Visible and hidden stats with clamping and yearly drift per SPEC §3.2.
- [M1.5] `ageUp` follows the yearly order in SPEC §3.4, produces log entries, and switches life stages at the right ages.
- [M1.6] Mortality per SPEC §3.5 with a recorded cause; death ends the life and produces obituary data.
- [M1.7] `sim` plays 300 seeded lives to death with the default persona, checks every invariant in DONE §4.1, and writes `reports/balance-report.md`.
- [M1.8] Save round trip: serialize then deserialize gives a deep-equal state, and continuing from a loaded save matches an uninterrupted run.

## M2. UI shell
- [M2.1] Main screen layout per SPEC §6 (header, stats column, log, tabbed right panel, Age Up button) at 1280×820 and 1024×700.
- [M2.2] Age Up works by button and Space; the log groups by age with sticky headers; the header shows age, year, and cash.
- [M2.3] The event popup shows numbered choices, keys 1–4 choose, and Age Up is blocked while a decision is pending.
- [M2.4] Start screen and New Life screen (random and custom).
- [M2.5] Obituary screen with summary, cause of death, title, and a New Life action.
- [M2.6] Persistence through `SaveStore`: autosave each year; a Lives screen (load, rename, delete); export and import as JSON. Electron uses files over IPC; the web build uses localStorage.
- [M2.7] Settings screen per SPEC §6 (theme, text size, popups per year, cheat badge, autosave, reduced motion), with settings that persist.
- [M2.8] Stat sparklines (last 20 years) and trait chips with modifier tooltips.
- [M2.9] Light and dark themes through CSS custom properties, following the system by default.

## M3. Cheat system
- [M3.1] The cheat registry from SPEC §8.2 exists, the GUI and the console both use it, and every command has a unit test.
- [M3.2] The cheat panel opens and closes with backquote, ⇧⌘K (Ctrl+Shift+K in web tests), and the Electron Cheats menu, with the tabs from SPEC §8.3.
- [M3.3] The console has autocomplete, history, and `help`.
- [M3.4] Core cheats work: set and lock stats, add and set cash, set age, skip years, immortality, force success, fire any event.
- [M3.5] Rewinding N years from the snapshot ring buffer restores the earlier state bit for bit (checked by hash).
- [M3.6] Debug tab: hidden-stats overlay and a JSON state viewer with validated editing.
- [M3.7] Cheat use marks the life (header badge and obituary note) unless switched off in settings.

## M4. Events engine
- [M4.1] Event definitions are typed per SPEC §4.2, including choices, outcomes, effects, bindings, and chains.
- [M4.2] Selection and pacing per SPEC §4.3 (popup cap, notice cap, cooldowns, one-time events), with tests.
- [M4.3] Token rendering per SPEC §4.4, with currency formatted for the country and year.
- [M4.4] Chain steps live in state and survive save, load, and rewind (tested).
- [M4.5] `content:check` validates schema, unique ids, tokens, references, the adults-only rule, duplicate texts, and the DONE §3 thresholds.
- [M4.6] The first 80 events, spread across all life stages (they count toward the DONE §3 totals).

## M5. Relationships and family
- [M5.1] Family generated at birth per SPEC §5.1.
- [M5.2] NPC records with traits, stats, relationship, and memory (30 lines max); NPCs age and die each year.
- [M5.3] At least 12 interactions whose outcomes depend on relationship, traits, memory, and RNG; each one writes a memory line.
- [M5.4] Friends come from school, work, and activities, and fade without contact.
- [M5.5] Romance for adults: meeting, dating stages, proposals, weddings, prenups, divorce with asset split, and affairs through chains.
- [M5.6] Children: pregnancy and adoption (adults only); children age, inherit traits, attend school, and have their own events.
- [M5.7] Wills and inheritance in both directions.
- [M5.8] Family tree view (three generations each way, clickable).
- [M5.9] The relationship cheats from SPEC §8.3.

## M6. Education and careers
- [M6.1] Primary and secondary school with grades, school events, and dropping out at the legal age.
- [M6.2] University: majors, acceptance, costs by country, scholarships, student loans, graduation, and community college.
- [M6.3] Graduate programs (law, medicine with residency, business, PhD) with their requirements.
- [M6.4] A job catalog meeting DONE §3, and a job listings view with filters.
- [M6.5] Applications with interview events; performance, raises, promotions, firing, quitting, retirement, and pensions.
- [M6.6] Part-time jobs for ages 14–17 and freelance gigs.
- [M6.7] Military per SPEC §5.4: enlistment and commission, branches, specialties, ranks, deployments, medals, discharge types, the veteran education benefit, and conscription.
- [M6.8] Music and fame per SPEC §5.5.
- [M6.9] The career and education cheats from SPEC §8.3.

## M7. Money and assets
- [M7.1] Annual finances per SPEC §5.6, with a Finances view (last year's breakdown and a net worth graph).
- [M7.2] Inflation index and local-currency display.
- [M7.3] Savings interest and at least 4 investment vehicles with seeded volatility; buying and selling.
- [M7.4] Student, mortgage, and personal loans with correct amortization (tested against known values), missed-payment consequences, and early payoff.
- [M7.5] Homes: generated listings, buying with cash or a mortgage, selling, appreciation, maintenance, condition.
- [M7.6] Vehicles and possessions with depreciation, condition, and accident events; a driving licence at the country's age.
- [M7.7] The money and asset cheats from SPEC §8.3.

## M8. Health, vices, crime
- [M8.1] An illness catalog meeting DONE §3, with onset, symptoms, treatments, progression, and death factors.
- [M8.2] Health activities: doctor, gym, diet, meditation, therapy, plastic surgery.
- [M8.3] Vices with addiction meters, consequences, rehab, and support groups.
- [M8.4] Crimes meeting DONE §3, with odds, loot, and notoriety.
- [M8.5] Justice: arrest, bail, lawyers, plea, trial, sentencing, criminal records (juvenile records seal at 18), and their effects on jobs and travel.
- [M8.6] Prison life with at least 6 activities, parole, and release.
- [M8.7] The health and legal cheats from SPEC §8.3.

## M9. World, traits, skills
- [M9.1] Country data meeting DONE §3.
- [M9.2] Emigration with requirements, currency conversion, and language effects.
- [M9.3] Traits meeting DONE §3 with explicit modifiers shown in tooltips, gained and lost through events.
- [M9.4] Skills meeting DONE §3 with practice, diminishing returns, decay, and effects; languages with fluency.
- [M9.5] The world and time cheats from SPEC §8.3.

## M10. Content and balance
- [M10.1] Event totals and per-stage minimums from DONE §3.
- [M10.2] At least 15 multi-year event chains.
- [M10.3] Achievements and life titles meeting DONE §3, with toasts and an Achievements screen.
- [M10.4] Activities meeting DONE §3, each with at least 3 outcome texts.
- [M10.5] `sim:coverage` across all personas fires at least 85% of events at least once, and its report lists the rest with reasons.
- [M10.6] The balance bands in DONE §4.2 hold for the default persona.

## M11. Legacy and polish
- [M11.1] Continue as a child: choosing the heir, inheritance, and history carried over.
- [M11.2] Dynasty view with legacy score.
- [M11.3] Milestone timeline, plus a searchable and filterable log.
- [M11.4] The full keyboard map from SPEC §6, listed in the Help overlay; the ⌘K palette finds any available action.
- [M11.5] Visual review: `npm run shots` covers at least 12 screens in both themes at both window sizes, problems found are fixed, and the review notes are in REPORT.md.
- [M11.6] Accessibility: axe reports no serious or critical violations on the main, event, cheat, settings, and obituary screens.
- [M11.7] The performance budgets in SPEC §9.9, with a benchmark test for `ageUp`.

## M12. Packaging and handoff
- [M12.1] The Electron menu from SPEC §9.7.
- [M12.2] `dist:mac` builds an unsigned darwin-arm64 `Lifespan.app` in `release/`, and `scripts/check-mac-bundle` validates its Info.plist (name, bundle id, category), executable, and app.asar. Waivable for container limitations only.
- [M12.3] `dist:linux` builds the packaged app and `electron:smoke:packaged` passes against it, showing that packaging works apart from signing. Waivable for container limitations only.
- [M12.4] `verify` has no SKIPPED steps left.
- [M12.5] README.md covers what the game is, the controls, the full cheat list (generated from the registry), the dev commands, and how the Mac build gets installed.
- [M12.6] `progress/REPORT.md` meets DONE §6.
- [M12.7] The fresh-eyes audit from DONE §7 is done and recorded in REPORT.md.

## Stretch (after DoD), in order
- [S1] Content to 500+ events and 30+ chains.
- [S2] Acting and athletics careers with their own fame paths.
- [S3] Business ownership: start a company, hire, grow, sell.
- [S4] Politics: run for office, approval ratings, scandals.
- [S5] Pets with their own stats and lifespans.
- [S6] NPC-to-NPC life: friends marry each other, siblings have kids, cousins appear.
- [S7] Casino mini-games and a lottery syndicate.
- [S8] Rental properties and landlord events.
- [S9] JSON mod packs loaded from `userData/mods`, validated with zod, with a Mods screen.
- [S10] Procedural WebAudio sound effects with a mute setting.
- [S11] Historical eras: birth years 1900–1990 with era-gated events and technology.
- [S12] Export a life story as Markdown.
