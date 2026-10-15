# Falling Blocks — proposed design

Status: Implemented after user approval to continue all stages, including the added 8-bit classic mode. This is the original proposal; RULES.md and PLAYING.md describe the delivered behavior and its limits.

## Desktop and architecture

- Windows-first Electron app, JavaScript game engine, Canvas board, HTML/CSS controls, electron-builder portable executable.
- Match the companion behavior inspected in ../TapTapJesus: frameless, optional always-on-top, tray menu, draggable window, saved position, size presets 50/75/100/150/200%, Ctrl+scroll from 50% to 300%. Default logical size approximately 320 x 520; clamp to available screen space.
- Compact board with hold, five next pieces, current score, lifetime score, training points, and an expandable training/skins panel. Normal gameplay should not steal keyboard focus; a separate focusable settings window can support conventional input.
- Engine runs independently of rendering; bounded AI search runs in a worker. Hiding the window keeps play running with rendering reduced. System sleep and closing the app pause progress; no offline earnings in the first version.
- Separate modules for rules, reachable-move search, strategy, training, progression, persistence, and rendering. Seeded randomness and replayable inputs support verification.
- Restricted preload bridge, context isolation, no renderer Node access. Versioned local saves under %APPDATA%/falling-blocks, atomic replacement with backup, periodic and purchase-time saving.

## Rules profile proposed for approval

Implement a documented modern rules profile: 10 x 20 visible board with 20 hidden spawn rows; seven-bag randomizer; standard piece colors; hold once per piece; five previews; ghost; soft/hard drop; clockwise/counterclockwise SRS rotation and ordered wall kicks.

Proposed timing: 500 ms lock delay, maximum 15 successful movement/rotation resets, increasing gravity every 10 cleared lines. Specify spawn blocking and lock-out behavior in engine fixtures. No custom 180-degree kicks.

Scoring proposal: singles/doubles/triples/four-line clears 100/300/500/800 times run level; full T-spin zero/single/double/triple 400/800/1200/1600 times run level; mini zero/single/double 100/200/400 times run level; difficult back-to-back line clears receive 1.5x; combo bonus 50 x combo index x level, starting at index 0. Soft drop 1 and hard drop 2 per cell. Perfect clear is an additional explicitly configured award of 800/1200/1800/2000 times level for 1/2/3/4 cleared lines; four-line back-to-back perfect clear uses 3200 instead of 2000. Round fractional awards consistently.

These numbers are proposed choices to freeze and test, not a claim of exact current official Guideline compliance. A complete current official handbook was not verified. T-spin corner classification, kick exceptions, lock-out details, perfect-clear stacking, and gravity curve need an explicit rules specification during Step 2.

Primary research: official Tetris games page https://play.tetris.com/games/ publishes scoring including T-spin single 800 and back-to-back bonus 0.5x; licensed product manual https://www.basicfun.com/wp-content/uploads/2025/06/09686_1L_IM.pdf is a candidate for further verification; SRS research paper https://erikdemaine.org/papers/TetrisPieces_FUN2024/paper.pdf; Electron window documentation https://www.electronjs.org/docs/latest/api/browser-window/ . Public sources do not establish every requested exact rule.

## Automatic play and training

- Starter AI chooses reachable placements using height, holes, surface unevenness, and line-clear rewards. Execute actual legal moves and rotations; never teleport pieces into cavities.
- Spend points on training tiers: fundamentals, deeper preview/hold planning, four-line back-to-backs, T-spin setups/back-to-backs, perfect clears, then T-spin triples and advanced legal rotation paths.
- Purchases unlock strategy modules and search budgets. Local seeded practice trials tune evaluation weights; retain improvements only after comparison on held-out seeds. Practice earns no currency. Save learned weights, training results, and skill tiers.
- Practice runs in bounded background batches and can be paused. Show measurable results (survival, score per piece, successful target moves) instead of promising mastery after every purchase.
- Advanced tactics need specific setup fixtures and seeded benchmarks. Unlocking a tactic does not guarantee it is feasible for every piece sequence.

## Progression and skins

Keep three separate totals: current run score, lifetime earned score, and spendable training points. Each positive score award adds once to lifetime score and wallet. Spending never reduces lifetime progress or removes unlocks.

Proposed skins/levels: Classic at 0, Neon at 10,000, Frost at 30,000, Ember at 75,000, Arcade at 150,000, Cosmic at 300,000, Grandmaster at 500,000 lifetime score. Retain piece color identity while changing frames, backgrounds, textures, and effects. Prices and thresholds remain tunable after playtesting.

On loss, show a brief run summary and restart after 3 seconds. Keep all progression, training, skins, and settings. Pause/speed controls: 0.5x, 1x, 2x, 4x; speed scales simulation time rather than changing rules.

## Ultimate mode

At 500,000 lifetime score permanently unlock an optional Blind Grandmaster mode. Proposed behavior: active piece, hold, and previews remain visible; locked blocks disappear immediately; ghost is disabled; internal board remains intact. Reveal the board at game over. Normal play remains selectable.

Reference https://www.youtube.com/shorts/ij4smVur4EY could not be loaded during research, so these visual details are provisional and require user review. The AI tracks its own board state; this mode changes presentation and does not claim to reproduce human memory or the complete TGM grading system.

## Approval checkpoints and evidence

1. Approve this design and proceed to Step 2.
2. Desktop shell and rules engine: runnable preview; tests for bag generation, collision, hold, SRS kicks, timing/lock resets, top-out, line clearing, spin classification, scoring chains, and perfect clears. Stop for review.
3. Autonomous play: executable move paths, automatic restart, pause/speed, seeded survival runs, bounded CPU work. Stop for review.
4. Progression/training: real purchases and practice, restart persistence, no double-counted rewards, tactic fixtures, training benchmarks. Stop for review.
5. Blind mode and release: threshold/presentation checks, scaling and monitor checks, long-run smoke test, portable Windows build, launch instructions. Stop for final review.

## Environment findings

The initial project contains only readme.md. TapTapBaby was located at ../TapTapJesus and inspected read-only. Its local Electron executable exists; node and npm are unavailable on the current shell PATH and the usual Program Files/nodejs paths. Resolve a local development toolchain during Step 2 before claiming execution or packaging validation.
