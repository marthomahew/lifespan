# Decisions

One line each: `- [HH:MM] <decision>. Why: <reason>. Alternatives: <what else you considered>.`

- [owner] The game is called Lifespan; bundle id dev.local.lifespan.
- [owner] Electron, React, TypeScript. The Mac app is cross-packaged in the container and signed ad hoc on the Mac.
- [owner] Romance, sex, and pregnancy are adults-only and fade-to-black. Crime and drugs stay abstract.
- [13:46] Pinned vite 7 / TS 6.0 instead of latest vite 8 / TS 7. Why: electron-vite 5 peers vite<=7 and typescript-eslint peers TS<6.1. Alternatives: plain Vite+esbuild for main.
