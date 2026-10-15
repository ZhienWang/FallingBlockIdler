# 1.3.1 - Falling Blocks rename

- Project, window title, tray, board labels, engine namespace and new portable executable use Falling Blocks.
- Workspace folder becomes Falling Blocks; launchers use paths relative to the project.
- Previous saved progression is imported into the renamed app without deleting the old save.

# 1.3.0 - NES-first progression, skins, and practice

- New profiles start with NES Classic and the 8-bit skin. Modern unlocks at 50,000 lifetime points; Blind Grandmaster at 500,000.
- Locked saved modes fall back to Classic while keeping accumulated progress.
- Level-based retro palettes and a center-out sweep after desktop input acknowledges a clear.
- Handheld, Terminal, and Sunset skins with matching block colors.
- Separate Classic/Modern practice weights, fresh disjoint sequences, six additive mutations, and validation safeguards for survival and lines.

# 1.2.0 — desktop input line clearing

- Current run score counter above the board.
- Completed rows stay on the board until typing or a left/right/middle click anywhere on the desktop; play waits for the player.
- Points and lifetime progression are awarded immediately at completion, with no duplicate award when rows disappear.
- Desktop input signals also work while hidden. Earlier inputs and held-key repeats cannot authorize later clears; key identities/text and mouse positions are not saved.

# 1.1.0 — closer NES classic play

- Nintendo rotation geometry, including two-state I/S/Z and the original spawn pivot/faces.
- Classic game over uses blocked spawn; pieces can rotate into two hidden rows.
- Original shift-register/spawn-counter randomizer calculation, advancing with simulated frames.
- Frame-based button taps, rotation release, delayed horizontal repeat, and held soft drop.
- Soft-drop points only for the final held segment into lock; transition clears use the new level's score multiplier.
- Start levels 0–19, remembered between launches, with A-Type first-transition thresholds.
- Center-out line-clear animation and inter-piece entry pauses.
- Classic AI sees only one preview at every training tier.
- Run completion is recorded once, including losses reported by the planner or delayed spawn.

This improves classic play without requiring a ROM. Original audio/artwork, PAL timing, console bugs, menu-time RNG, and cycle-accurate entry/render delays are outside this release.
