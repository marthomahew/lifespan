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
