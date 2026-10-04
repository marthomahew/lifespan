# Visual review notes (M11.5)

`npm run shots` captures 23 screens × light/dark × 1280×820/1024×700 (92 PNGs in reports/screenshots/).

Problems found and fixed:
- Modal screenshots caught the 150 ms fade-in (washed-out panels); shots now disable animations.
- Tab labels clipped at 1024 ("Relationships" in bold); tabs became emoji-over-label with no bold on the active tab.
- NPC rows truncated the role text; rows now put name and role on two lines.
- Home listings squeezed the name between buttons in the narrow panel; buttons wrap below the name.
- Sticky log headers used the page background inside a white card; they now use the card surface.
- The obituary card didn't grow with the heir list (content spilled out); the screen now aligns the card to the top and scrolls.
- Toasts stacked to five and covered the cheat panel; capped at three and moved beside the panel when it's open.
- Enroll and enlist selects clipped at 1024; they now take the full width.
- Low-contrast text found by axe: the Age Up shortcut hint (opacity), light accent on hover backgrounds, and achievement toasts inheriting the grid's 0.6 opacity; all fixed.
- The milestone timeline was full of colds; only chronic or dangerous diagnoses are milestones now.

Known cosmetic limits: toasts can briefly cover the bottom of the right panel; the family tree has no connecting lines (generations are rows).
