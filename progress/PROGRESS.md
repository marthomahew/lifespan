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
- Verify: green in 73 s (unit 334, e2e 42, electron 3, sim 300/300, 0 violations); coverage 301/307 (98.0%)
- Next: DONE §8 final check

## 2026-10-05 · Stretch S1–S11 (owner: "keep going")
- Done: buy dialog + mortgage quote, real job perks, NPC milestones, family-tree lines, full event coverage + persona invariant sweep, toasts, injuries (save v2), 127 new events (careers, romance, crime, release, travel, world), life goals (save v3), story/state fixes
- Bugs found on the way: bankruptcy missed second debts (persona sweep), cellmates unreachable after release, bots never bought homes, partner-abroad story didn't move you
- Verify: green in ~71 s (unit 370+, e2e 46, electron 3, sim 300/300 0 violations); coverage 425/434
- Next: DONE §8 final check on the last commit

## 2026-10-05 · Fun pass S12–S15 (owner: "make sure the loop and gameplay are fun")
- Measured 60 passive lives + read lives as a player; fixed: no feedback after choices, outcomes context-free in the log, dice-only choices, log noise/repeats, dead years, empty baby years, broke-renter bankruptcy loop
- Added: result card, This-year summary, skill checks with reasons, baby pack, job leads + benefit, affordable housing, empty-nest move-out, goals prompt
- Verify: green in ~88 s (unit 386, e2e 48, electron 3, sim 300/300 0 violations); coverage 444/454

## 2026-10-06 · Overnight S16–S45 (owner: "UI pass and a full character customization run", "keep going")
- Done: drawn SVG portraits + builder (ageing, moods, family resemblance, accessories, surgery), pets (drawn, 8 kinds), mini-games (escape, blackjack), life on the run, dating candidates, free time (switchable), challenges, callbacks, records, toddler activities
- Three transcript playtests + two browser UX reviews by subagents; ~60 fixes (names, fertility, grades, heirs, fugitives, pay caps, repetition, layout cues)
- Verify: green in ~105 s (unit 454, e2e ~65, electron 3, sim 300/300 0 violations); coverage 535/542; final check clean at bd92001
- Next: fold in the second browser review, re-run the final check

## 2026-10-06 (S63–S66)
- S63 long-marriage check-in (dates, counselling, coasting); S64 five teen-parenting decisions; S65 wealth follow-ups (loan repaid, startup news); S66 later-life chapter (downsize, near family, abroad, stay).
- Measure (default bot, 40 lives): real decisions 35–65 0.68→0.77/yr; 65+ lasting choices 22→28%, stat-only 42→34%.
- DONE §8 final check re-run clean after S66; release/ matches 4adcd06.

## 2026-10-06 (S67–S70b)
- S67 novel querying ends after eight rounds (drawer, odds floor); S68 short stories while a book is out.
- Fourth transcript playtest (12 lives): S69/S70 fixed 15 findings: liquid-first wealth losses and no bankruptcy when assets cover debt; stale random popups pruned; situational gates; injuries match the story; sealed records; stale prison-deferred chains expire; office-only events; text agreement; variety.
- stats health-trend test now averages 120 lives (was 40; noise). DONE §8 re-run clean at 6fabee2.

## 2026-10-06 (S71–S72)
- Fifth transcript playtest (12 lives), 15 findings fixed in two batches: fugitive state, cellmate gender, injury reading, named friends/enemies, -es verb check in content:check, placeholders, sibling weddings, housing on marriage; living costs vs local wages (debt spiral in ng/mx/br/se), pension taper, warm cities, diagnosis gating, chronic illness, music variety, office gating, boss continuity.
- Coverage 590/600 (98.3%); sim bands all pass.

## 2026-10-07 (S73–S79)
- Owner requests: S73 year focus + faster childhood learning + prodigy/quick-study gifts; S74 prodigy paths (chess skill and tournaments, chess/music milestones, other-skill prodigies, burnout); S75 own business; S76 eight backgrounds (off by default; Settings off/rare/common); S77 luck gifts by area; S78 real product names by era.
- Reviewer pass on S73–S78: 13 findings, fixed in S79 (business currency on emigration, random-life background roll, talent caps, family-business inheritance, luck gaps, setup consistency, names).
- Coverage 651/658 (98.9%) with backgrounds and prodigies in a share of coverage lives.

## 2026-10-07 (S80–S83)
- S80 help guide for the systems; tabs open at top. S81 playtest of the new systems (12 scripted lives): 15 findings fixed (doubled "your", absent parents, memories in third person, immigrant names, prodigy caps, prison blocks, cottage price, peak-pay pensions, unique names, business lines by kind, moving family).
- S82 job board (fit/start/ceiling sorting, ladders, odds, search) and special careers (astronaut, politician, intelligence officer, diplomat, film actor; Olympics, restaurant star, Nobel). S83 teen relationships between peers (owner override of the adults-only rule; limits in DECISIONS).
- Coverage 684/692 (98.8%).

## 2026-10-07 (S84–S105)
- Owner playtest rounds: clubs, previews and pips; people cards; chess Elo/norms/titles and the world title cycle (prizes checked against Wikipedia); youth sport with Olympics by level; fame "known for"; lettings; results careers; activities per skill; skill crimes; item perks.
- Timeline: real markets (Yahoo year-end prices for 8 stocks and BTC, BLS CPI 1950–2025), bitcoin early buying, ~90 real history moments incl. 12 new countries, decade childhoods, jobs by era, same-sex marriage laws, generations.
- 25 countries, 79 US cities, 24 destinations; character creation redesign; web lookups allowed by owner (curl).

## 2026-10-07 (S106–S127)
- "Fun over punitive balance" (owner): more pips, separate work time, no yearly skill cap, momentum, no rust before 30, fair promotions, champions keep titles.
- Sports: real routes and age stages, scholarships, draft with rookie scales, positions, contracts, stats, honours, 28 pro events, ice hockey and American football. Actors climb billing, 25 actor events.
- Wealth: car showroom (~95 real models, Porsches, collectors), homes by budget (mobile home → castle), the good life (4 tiers), making ends meet, fame deals, 33 life-by-wealth events, smoking by era.
- Verify green ~140 s; unit 632, e2e 80; sim bands pass.
