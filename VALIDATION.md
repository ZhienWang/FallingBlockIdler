# Validation — 2026-10-09

## Version 1.3.1 - Falling Blocks rename

- 44 tests passed, including import of legacy progression and preference for subsequent Falling Blocks saves.
- Renamed package, app/window/tray/header branding, engine namespace, portable filename and current save location.
- Source and packaged UI checks passed, including Falling Blocks title/header and absence of the old name in visible game text.
- Folder rename initially blocked by a Windows directory-in-use lock. `rename-folder.cmd` allows retrying after closing the workspace and other handles; it refuses an existing destination and does not delete files.
- Final `Falling Blocks-1.3.1-portable.exe` launcher smoke test exited 0. Size: 100,248,430 bytes; SHA-256: `CB36D0513B79F94ADC5894D3D8FB519382EEAA37D5BC6BA0FC2D08EEE9C2FF6C`.

## Version 1.3.0

- 43 engine/progression/storage/practice tests passed, including mode thresholds, old-save fallback, skin milestones, post-input Classic sweep, mode-specific benchmarks and validation safeguards.
- Source UI checks passed: NES/8-bit default, disabled locked modes, Modern unlock at 50,000, Classic practice, all three new skins, and existing desktop input/gameplay checks.
- Repeated 1,700 legal placements: Modern starter 1,200 pieces / 478 lines; Classic tier 2, 400 pieces / 158 lines; Modern tier 6, 100 pieces / 25 lines.
- Screenshots: `artifacts/handheld.png`, `artifacts/terminal.png`, `artifacts/sunset.png`.
- Final packaged UI checks passed, including Classic practice preserving Modern weights, mode selection gates, all three skins, native listener startup/restart and hidden-window keyboard/mouse dispatch. Fixed fixtures temporarily pause the OS hook to prevent unrelated desktop activity from clearing their boards.
- Real Classic and Modern practice sessions on seed 20261009 completed with 150 validation pieces each; candidates that failed the validation gain checks were correctly rejected.
- Final `TetrisIdler-1.3.0-portable.exe` launcher smoke test exited 0 using an isolated profile. Size: 100,216,227 bytes; SHA-256: `A06C000829C0AC5B896FD8411459B859B8D89C2508FFB5708A2DDE5B4B25DCF5`.

## Version 1.2.0

- 36 engine/progression/storage tests passed. New cases verify immediate line scoring, completed rows retained until input, no duplicate points on removal, and no credit from earlier input in modern and classic modes.
- Native desktop listener startup and hidden-window keyboard/left/right/middle button dispatch are checked by the Electron UI harness. These dispatch checks inject native listener events; they do not synthesize physical desktop input.
- The UI harness checks the top score counter, retained board, and unchanged score after input, alongside the existing gameplay, training, skins, blind mode, tray, and scaling checks.
- Screenshot: `artifacts/score-awaiting-key.png`.
- Full source and packaged Electron UI checks passed with the desktop listener running, including hidden-window dispatch for each of the three mouse buttons.
- Final `TetrisIdler-1.2.0-portable.exe` launcher smoke test exited 0 with an isolated profile. Size: 100,213,692 bytes.

## Version 1.1.0

- 33 engine/progression/storage tests passed, including 15 NES classic cases and legacy-save migration.
- Source and packaged Electron UI checks passed, including 20 classic placements at level 18 / 4× playback and remembered start-level selection.
- Repeated the 1,700-piece legal-placement soak: modern starter 1,200 pieces / 478 lines; classic tier 2, 400 pieces / 158 lines; modern tier 6, 100 pieces / 25 lines.
- Classic tests cover the 19 orientations, visible pivot/spawn, two hidden rows, blocked spawn, opening delay, gravity, rotation release, horizontal repeat, soft-drop timing/scoring, entry/clear animation, transition scoring, A-Type start thresholds, seeded shift-register picks, and restriction to one preview.
- New screenshot: `artifacts/8bit-level18.png`.
- Final `TetrisIdler-1.1.0-portable.exe` launcher smoke test exited 0. Size: 99,974,101 bytes; SHA-256: `C9D076BD43E4EDA97514AEEBF781C4891418222B89164F73A94EC46643350FEF`.
- Remaining classic approximations are listed in RULES.md: rendering/entry phases, menu-time randomness, PAL behavior, original art/audio, and console bugs are not fully emulated.

## Version 1.0.0 baseline

- 17 engine/progression/storage tests passed.
- Executed 1,700 legal AI placements: modern starter 1,200 pieces / 478 cleared lines; classic tier 2, 400 pieces / 159 lines; modern tier 6, 100 pieces / 25 lines across two runs.
- Verified a reachable fifth-kick full T-spin triple, rotation-ending spin clear, and four-line perfect clear through actual engine inputs.
- Electron UI checks passed against both the source app and the packaged `release/win-unpacked/Falling Blocks.exe`: modern/classic autoplay, pause, complete window layout, skin switching, training purchase, local practice completion, blind unlock and pixel visibility/reveal, automatic restart, tray pause event, and scale changes.
- Source screenshots: `artifacts/modern.png`, `artifacts/8bit.png`, `artifacts/blind-reveal.png` (generated, not packaged).
- Portable Windows x64 build uses Electron 44.5.1 and electron-builder 26.15.3. The generated executable is unsigned.
- Final self-extracting portable launcher smoke test completed with exit code 0 using an isolated profile. Final executable size: 99,973,039 bytes; SHA-256: `B333A944B8D680BD385AC54B575C6118A54995E9E0C77EECE9835AB8E19004A9`.

Limits: automated runs are bounded checks, not a days-long stability trial. Classic is NES-inspired, not cycle-accurate emulation. Complete current official Guideline compliance and the linked video were not verified. Advanced strategy unlocks are implemented and specific tactics tested, but universal mastery or monotonic improvement after every training purchase is not claimed.
