# Progress log

Append an entry after each milestone or every couple of hours, 10 lines max, in this shape:

    ## YYYY-MM-DD HH:MM · M1.2–M1.4
    - Done: M1.2, M1.3
    - Partial: M1.4 (drift works; aging curve missing)
    - Verify: green (unit 212, e2e 6, sim 300/300)
    - Key files: src/engine/rng.ts, src/engine/life.ts, tests/engine/
    - Next: finish M1.4, then M1.5
    - Notes: anything you'd need after a compaction

---

## 2026-10-04 14:45 · M0–M3
- Done: M0.1–M0.9, M1.1–M1.8, M2.1–M2.9, M3.1–M3.7
- Verify: green in 21 s (unit 129, e2e 19, electron 3, sim 300/300 invariants clean)
- Key files: src/engine/{age,life,stats,mortality,save}.ts, src/engine/events/, src/engine/cheats/, src/renderer/
- Review M0–M2 done; fixed save races, IPC sender checks, file:// scope, modal focus trap, invariants (popup text, null paths, checkpoints)
- Next: M4 events engine tests + first 80 events, then M5
- Notes: balance bands report-only until M10.6 (ENFORCE_BANDS)

## 2026-10-04 17:40 · M4–M8
- Done: M4.1–M4.6, M5.1–M5.9, M6.1–M6.9, M7.1–M7.7, M8.1–M8.7; M3–M6 review fixes
- Verify: green in 59 s (unit 276, e2e 28, electron 3, sim 300/300, 0 violations, 30 s)
- Content: 230 events, 51 jobs, 25 illnesses, 12 crimes, 37 activities, 20 interactions, 13 countries
- Bands failing (report-only until M10.6): children 94%; median death age 66 (low side)
- Next: M9 world/traits/skills, M10 content+balance, M11 legacy/polish, M12 packaging

## 2026-10-04 · M12.5–M12.7, fresh-eyes audit
- Done: README (M12.5), REPORT.md (M12.6), fresh-eyes audit (M12.7); all 96 PLAN items pass, none waived
- Audit fixes: bankruptcy ends runaway debt (M7.4 re-opened and fixed); prison-only events + prison pack; work romance; money/item gifts; skill tooltips; flow 15 spec; absent NPCs unbound; obituary/article/acronym text
- Verify: green in 70 s (unit 334, e2e 42, electron 3, sim 300/300, 0 violations); coverage 301/307 (98.0%)
- Next: DONE §8 final check
