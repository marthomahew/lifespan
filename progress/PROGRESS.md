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
