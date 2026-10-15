# Implemented rules profile

These are explicit project choices, not a claim of exact current Tetris Company certification.

## Mode progression

New profiles start in NES Classic with the 8-bit skin. Modern unlocks at 1,000,000,000 lifetime points; Blind Grandmaster unlocks at 10,000,000,000. Settings enforces these thresholds, including on saved-mode migration. Training purchases use the wallet and do not remove lifetime unlocks. Unlocking a mode does not automatically change the current run.

## Modern

- Board: 10 columns by 20 visible rows. Active pieces may move through 20 hidden rows; locking any block above the visible board ends the run (partial lock-out before line clearing). Hidden locked blocks are therefore never retained. Spawn at x=3, y=-2 in the defined geometry.
- Seven-bag Fisher–Yates shuffle using seeded xorshift randomness; hold once per piece; five visible previews.
- Four rotation states around 3x3 geometry or the I piece's 4x4 geometry. O remains fixed. SRS offsets are ordered and tested in board coordinates. No 180-degree action or custom kick tables.
- Gravity interval: max(10, 1000 × max(0.05, 0.8 − (level−1) × 0.007)^(level−1)) milliseconds. Start level 1, advance every 10 lines.
- Grounded lock delay 500 ms; successful grounded movement/rotation resets it at most 15 times. Falling does not erase last-rotation status; successful horizontal/soft/hard movement does. A zero-distance hard drop preserves it.
- T-spins need a last successful rotation and three occupied/out-of-bounds pivot corners. Two front corners or the fifth kick classify a full spin; otherwise mini.
- Normal clears: 100 / 300 / 500 / 800 × level.
- Full T-spins, 0–3 lines: 400 / 800 / 1200 / 1600 × level. Mini spins, 0–2 lines: 100 / 200 / 400 × level.
- Difficult clears (four lines or spin line clears) extend back-to-back. Consecutive difficult clears multiply their base award by 1.5. Normal 1–3 line clears break it; nonclears do not.
- Combo index starts at zero on the first consecutive clear; bonus 50 × index × level. A nonclear resets the combo.
- Perfect-clear additional bonus, 1–4 lines: 800 / 1200 / 1800 / 2000 × level; back-to-back four-line perfect clear uses 3200. Add this to line/spin and combo awards.
- Soft drop earns 1 per cell; hard drop earns 2 per cell. AI paths that soft drop receive the same awards.

## 8-bit Classic

- Nintendo's 19 orientations about a pivot at column 5, row 0: downward-facing T/J/L; two-state I/S/Z; fixed O. Two hidden rows. Hidden locked cells are discarded; a blocked spawn ends the run.
- A seeded phase of the 16-bit NES shift register advances every simulated frame. Selection uses the high byte plus an 8-bit spawn counter; repeated or invalid candidates reroll using the next register value and previous spawn orientation ID. There is no seven-bag guarantee.
- One preview; no hold, ghost, hard drop, kicks, spin/B2B/combo/perfect-clear bonus.
- Unshifted Nintendo rotations; no kicks. At 60 Hz, rotation requires a released frame; horizontal hold shifts immediately, waits 16 frames, then repeats every six. Down suppresses horizontal movement, while rotation can accompany dropping.
- Soft drop starts after three held frames, repeating every two; only its final uninterrupted segment into lock earns points. Carrying Down through entry cannot soft drop a new piece until it is released and repressed. No BCD scoring bugs are reproduced.
- Line awards: 40 / 100 / 300 / 1200 × (level+1), using the new level when a clear crosses a transition. Select start levels 0–19; first transition at min(start×10+10, max(100, start×10−50)), then every ten lines.
- Fall intervals in 60 Hz frames, levels 0–29: 48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3,2,2,2,2,2,2,2,2,2,2,1. Level 29 onward stays at one frame. A blocked gravity tick locks immediately.
- Opening suspension lasts 96 frames and Down cancels it. Inter-piece entry is approximated at 10–18 frames from the lock pivot height; the center-out clear sweep adds 20 frames. Rendering and VRAM-phase delays are not emulated cycle by cycle.

The 8-bit presentation groups pieces into three colors, changes palette with each level, and repeats every ten levels. Its RGB colors are approximations. In the desktop-input variant, the center-out clear sweep starts only after acknowledgment; the completed board stays intact while waiting.

## Training

Classic practice uses Classic rotation, RNG, preview and scoring rules, and advances entry/clear phases between placements. It evaluates reachable placements without simulating real-time high-level controller pressure. Modern and Blind share Modern practice weights; Classic uses its own weights. Two fresh training sequences and three disjoint validation sequences are generated per session. Six bounded additive mutations can explore zero-valued weights. Candidate validation fitness must improve without reducing aggregate survived pieces or cleared lines. A session may retain the original weights.

## Idler timing

Version 1.2 adds a player-input rule across every displayed mode: score/line counters and lifetime points increase immediately when a piece completes rows. Those completed rows remain physically on the board, and simulation waits, until desktop typing or a left/right/middle mouse-button press acknowledges the clear. Acknowledgment collapses the board and resumes play without another score award. AI inputs cannot acknowledge it. Held-key auto-repeat cannot authorize later clears; earlier inputs are not stored for future clears. In blind mode completed waiting rows are visible; other locked blocks remain hidden. Practice simulations retain automatic line removal so they can run unattended.

The planner runs in a Web Worker. Search processing time is excluded from game time. Modern animation executes up to three planned input actions each 35 simulated milliseconds. Classic animation sends frame-based held/released button states through the classic controller, including its gravity and lock behavior. Plans are discarded and recomputed when gravity changes their target or an action fails. All committed placements use legal movements. Classic planning can inspect only its single visible preview, even at the highest training tier.

The agent explicitly waits for locking once its target is reached. Speed changes simulation time, including the three-second loss/restart delay. The blind mode affects rendering, while the AI keeps its board state. This is a desktop autoplay presentation, not a human-input timing simulation.

## Research

- Official scoring examples: https://play.tetris.com/games/
- Licensed product manual, verified scoring and level progression: https://www.basicfun.com/wp-content/uploads/2025/06/09686_1L_IM.pdf
- Electron security: https://www.electronjs.org/docs/latest/tutorial/security
- NES disassembly tables and routines (orientation, spawn, RNG, scoring): https://github.com/CelestialAmber/TetrisNESDisasm/blob/master/main.asm
- Original reverse-engineering research on NES input, spawn, and gravity: https://meatfighter.com/nintendotetrisai/

The linked YouTube short and a complete current official handbook could not be loaded/verified. Remaining rule details are the project choices listed above.
