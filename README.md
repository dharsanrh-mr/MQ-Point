# Rummy Arena v10 — Separate Rummy + 7S LocalStorage

- Rummy and 7S now have separate current-game storage.
- Switching Rummy ↔ 7S NEVER resets either mode.
- Return to Rummy: the previous Rummy players/rounds/winner are restored.
- Return to 7S: the previous 7S players/rounds/winner are restored.
- Rummy: normal points, lowest total wins.
- 7S: R1 and R7 double entered points; R2–R6 are normal. Exactly 7 rounds.
- Completing R7 automatically determines the lowest-total winner.
- LocalStorage key is `rummyArena_v3`.
- Existing data from the previous single-mode version is migrated into the currently selected mode on first load.
