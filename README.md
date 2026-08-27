# Rummy Arena – Rummy + 7S v7

Mobile-only GitHub Pages app with LocalStorage.

## Modes
### Rummy
Lowest total points wins.

### 7S
- Rounds 1–6: entered points are normal.
- Every 7th round: entered points are doubled.
- Example: 7th round input `2` → table shows `4`.
- Player total is calculated using the converted score.
- Lowest total points wins.

Example:
R1=2, R2=3, R3=1, R4=2, R5=4, R6=2, R7=2
Total = 2+3+1+2+4+2+4 = 18.

Data remains in browser LocalStorage. Backup/restore can be added/used for device transfer.
