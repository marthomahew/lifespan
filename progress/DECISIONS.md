# Decisions

One line each: `- [HH:MM] <decision>. Why: <reason>. Alternatives: <what else you considered>.`

- [owner] The game is called Lifespan; bundle id dev.local.lifespan.
- [owner] Electron, React, TypeScript. The Mac app is cross-packaged in the container and signed ad hoc on the Mac.
- [owner] Romance, sex, and pregnancy are adults-only and fade-to-black. Crime and drugs stay abstract.
- [13:46] Pinned vite 7 / TS 6.0 instead of latest vite 8 / TS 7. Why: electron-vite 5 peers vite<=7 and typescript-eslint peers TS<6.1. Alternatives: plain Vite+esbuild for main.
- [14:00] sim enforces balance bands only after M10.6 (ENFORCE_BANDS in scripts/sim-lib.ts); before that the report shows pass/fail. Why: bands need systems from M5–M10; M12.4 requires no skips remain. Alternatives: fail verify for hours (blocks all commits).
- [14:00] Rewind hash check uses lifeHash (state minus snapshot ring and cheats.used). Why: the ring and the cheat marker legitimately differ after a rewind. Alternatives: full stateHash (can never match).
- [14:40] Under-18 mortality is capped (0.004/yr, or 0.2 at Health < 15) on top of the SPEC §3.5 formula. Why: the Gompertz curve with the ×4 low-health multiplier would kill too many children for the ≥90% reach-18 band. Alternatives: tune A/B (shifts adult ages).
- [14:40] Cheat panel 'cheat badge' setting hides the badge/obituary note; the life is still marked as cheated in state. Why: SPEC §6 lists it as a display setting. Alternatives: not marking at all.
- [15:10] content:check enforces DONE §3 thresholds as their milestones land (ENFORCED set in scripts/content-check.ts); the rest print 'todo'. Why: thresholds need M5–M10 content. M12.4 requires every threshold enforced. Alternatives: fail verify until M10.
- [16:10] Parents with savings pay up to half of university costs from their own money; the default bot's 'able to pay' counts that help. Why: realistic and lets the degree band land without forcing loans. Alternatives: treat student loans as 'able to pay' (every life would qualify).
- [16:10] Medical residency is the doctor job's first level (3 years, no promotion until done) rather than a separate program. Why: fewer states, same play. Alternatives: residency as an enrollment.
- [17:40] Illness death risk is additive across illnesses (1 + Σ deathFactor·severity/100) and chronic progression stalls above 60. Why: multiplying several chronic conditions killed the default bot (median 58). Alternatives: lower every deathFactor.
- [19:10] Balance (DONE §4.2): illness lethality scaled by ILLNESS_RISK_SCALE=0.15 and chronic onset ×0.7; 40% of partners don't want children and 20% won't marry; proposals need the 'serious' stage; adoption needs a partner or steady income and succeeds 35% per attempt. Why: default persona hit marriage/children caps and median age 58–66. Alternatives: changing persona behaviour (fixed by DONE §4).
- [19:10] M10.5 check inside verify runs coverage on 30 lives per persona with the same 85% bar (tests/integration/coverage.test.ts); the full 2,080-life sim:coverage is outside verify per CLAUDE.md. Why: verify time budget.
- [19:50] Default persona details (DONE §4): university "eligible" = some major open and no bachelor yet (it picks among open majors, then rolls 60%); "unemployed adult" = 18+, no job, not retired, not serving; prison fights/riots/escapes count as crimes and are skipped; event popups (romance ones included) are answered uniformly, while romantic progress interactions are accepted 50%. Why: closest reading of DONE §4. Alternatives: none simpler.
- [19:50] "Lives with a university degree" counts bachelor's and higher, not associate degrees. Why: DONE §4.2 says university.
- [19:50] No-bad-events also stops new illnesses from starting. Why: an onset is a purely bad thing happening; the cheat's purpose. Alternatives: only filtering notices.
- [19:50] Smoking is 18+ everywhere; drinking follows the country's drinking age. Why: no smoking age in country data. Alternatives: add a field.
- [19:50] Vices drop only after a full year without use (lastUse < year − 1 at the start of the next year). Why: use during the previous year shouldn't count as abstinence.
- [19:55] Universities require a school average of 55 (community colleges take anyone; the veteran benefit waives it). Why: with the DONE §4 persona applying every eligible year, almost everyone eventually got a degree (98%). Alternatives: age-limiting admissions.
- 2026-10-04 Fresh-eyes audit: unsecured debt now ends in bankruptcy (savings and investments to creditors, rest wiped, Stress/Happiness hit) once it passes max($40k ref, 2× salary). SPEC §5.6 has debt compound with no end, and the audit saw a -$24.8M criminal estate.
- 2026-10-04 Custom new life: gender and attraction default to 'Surprise me' (engine rolls them), not female/men.
- 2026-10-04 Audit: in prison only events marked `inPrison` can fire (court events plus a new prison pack); chain steps due inside are pushed a year at a time until release. Why: outside-world events were firing in a cell.
- 2026-10-04 Audit: events can't bind cut-off NPCs or children lost in custody unless they ask for flag cut_off (SPEC §4.3 "absent NPCs").
- 2026-10-04 Audit: `meet` with a bound NPC turns that person (e.g. a coworker who fits the player's attraction) into a partner; work_coworker_spark covers SPEC §5.1 "meet people through work".
- 2026-10-04 Audit: gifts are a small present, an amount of money, or a possession; more generous gifts add up to +10 points of odds.
- 2026-10-05 Bots: careerist and family personas buy the cheapest home on a 30-year, 20%-down mortgage when the bank says yes; chaos keeps one vice habit (by seed). Default persona unchanged (DONE §4). Why: no bot ever bought a home, so mortgages/upkeep/home events were never simulated.
- 2026-10-05 Hires from age 35 also meet a junior colleague (22–30). Why: every colleague was within ~10 years of the player, so mid-career 'young colleague' content could never fire.
- 2026-10-05 Bots: careerist/family pick a dream job field per life (seed % fields) and take the best eligible job there, else the best overall. Why: always taking the top-paid job left most career fields unsimulated.
- 2026-10-05 Fun pass: popup outcomes marked success are tilted by the player's edge for the event's category (traits + skills via playerOdds, plus one visible stat), capped ±0.25, so traits matter in events as their tooltips promise. First popup draw 0.7→0.85 a year. Minor illnesses ×0.5 onset. Notices retire after showing each outcome once.
- 2026-10-05 Fun pass: renting costs follow income (rent ≤ 30% and living ≤ 45% of income, floors $4k/$6k ref, lifestyle on top). Why: an entry-level renter paid ~60k on ~30k pay, so non-graduate lives looped through bankruptcy. Adults at home after both parents die move out (or into an inherited home).
- 2026-10-06 Balance headroom: happiness baseline 55→52, partners not wanting children 40%→45%, not wanting marriage 20%→25%. Married 78%, children 77%, happiness 67.5 (were 81/80/70 against 85/85/75 ceilings).
