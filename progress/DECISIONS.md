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
