# Falling Blocks

Double-click `release/Falling Blocks-1.3.1-portable.exe` to play. This is a Windows x64 desktop companion. It plays automatically and restarts after a loss. New profiles start in NES Classic with the 8-bit skin. Existing points and purchases carry over; selected skins below their new thresholds fall back to 8-bit; a previously selected mode below its new unlock threshold falls back to Classic.

## Controls

- Drag the title bar to move the window. Position is remembered.
- Pause/resume and change playback speed along the bottom.
- The top **SCORE** counter shows the current run score. Completing lines awards score and training points immediately, then keeps those rows on the board until you type anywhere or click the left, right, or middle mouse button anywhere on your desktop. Play waits for that input. The rows are removed without awarding the same points again. Earlier inputs are not saved for later clears.
- Open **Training & skins** to buy skills, practice, change appearance, or switch modes.
- The **…** button, right-click menu, and system tray offer window size, always-on-top, show/hide, and quit.
- Ctrl + scroll scales the window from 50% to 300%, bounded by the current monitor's work area. Menu presets are also available.
- The minus button hides to the tray; automatic play continues. Quit saves progress and stops play. Sleep does not earn points.

## Modes

Gameplay progresses from **NES Classic** to **Modern at 1,000,000,000 lifetime points**, then **Blind Grandmaster at 10,000,000,000**. Choose unlocked modes in Settings; earning an unlock does not interrupt the current run. Spending points never removes a mode unlock.

**Modern** uses seven-bag pieces, hold, five previews, ghost, SRS kicks, soft/hard drop, T-spin scoring, back-to-back bonuses, combos, and perfect-clear bonuses.

**8-bit Classic** is available immediately. Selecting the 8-bit skin starts classic gameplay. It now uses Nintendo's piece orientations and pivots, visible spawns, two hidden rows, blocked-spawn game over, and one preview. It has no hold, ghost, hard drop, wall kicks, or modern bonuses. Its seeded 16-bit shift-register randomizer advances each simulated frame and uses the NES spawn-counter/reroll calculation.

Choose **Settings → Classic start level** from 0–19. The first level transition uses the A-Type threshold; later levels advance every ten lines. Classic input runs at 60 Hz: rotation buttons need a release frame, horizontal hold repeats after 16 frames then every six, and held soft drop starts after three frames then repeats every two. Only the final continuous soft-drop segment into lock earns drop points. Completed lines follow the same wait-for-typing-or-click rule as other modes.

The 8-bit skin uses pixel blocks, square controls, and three-color palettes that change with the level and repeat every ten levels. Desktop input starts Classic's center-out clear sweep before the next entry delay. Other skins can be used in Classic mode. It remains a recreation: RGB colors, inter-piece delays and clear animation are approximations; menu-time RNG, PAL timing, original graphics/music, console overflow bugs, and cycle-accurate emulation are not included.

**Blind Grandmaster** unlocks permanently at 10,000,000,000 lifetime points. Locked blocks become invisible, the ghost is disabled, and the AI remembers the board. Active pieces and previews remain visible. The board is revealed at game over. This mode is inspired by the requested blind-game concept; the linked short could not be verified, and TGM grades/credits-roll rules are not implemented.

## Progress and learning

Every score award increases both lifetime points and your spendable training wallet. Spending never reduces lifetime score or removes skins. Current run score resets after a loss; other progress remains saved.

Training purchases unlock increasingly capable placement evaluation and lookahead, hold planning, four-line chains, T-spin setups, perfect clears, and T-spin triples. The AI follows legal movement/rotation paths. Skills prefer suitable opportunities; they do not force every board to produce the target tactic.

Purchasing a skill also starts local practice. **Run local practice** repeats it; **Stop practice** cancels safely. Practice uses the selected mode's rules (Grandmaster uses Modern rules) and saves separate Classic and Modern weights. Each session tries six additive weight mutations on two fresh seeds, then compares the candidate and original on three different validation seeds. Saving requires better validation fitness and no reduction in survived pieces or cleared lines. Fitness combines survival, cleared lines, and score. Practice caps its strategy at the back-to-back tier to keep foundational weight tuning inexpensive; advanced tactics come from unlocked strategy modules and deeper search. This is local parameter learning, not a neural network. Practice earns no points.

Earned skins range from **Handheld at 100 million** to **Grandmaster at 10 billion**. **Terminal requires 1 billion** and **Sunset requires 4 billion**. Classic and 8-bit remain free. Training skills cost 100 million, 300 million, 800 million, 1.5 billion, 2.5 billion, and 4 billion wallet points, in order. Selecting a skin preserves the current mode, except the 8-bit skin selects Classic.

Saves live at `%APPDATA%\falling-blocks\progress.json`, with a backup. The app saves periodically, after purchases/settings changes, and when quitting. It stores progression, trained weights, themes, window settings, and statistics; active runs start fresh on launch. The desktop input listener sends only a key-pressed or mouse-button-pressed signal to the game. Key identities are held temporarily to suppress auto-repeat, released on key-up, and never written to saves or logs; typed text and mouse positions are not recorded or transmitted. There is no network gameplay, cloud account, or telemetry. If the desktop listener cannot start, typing or clicking in the game still clears completed rows.

## Development

Install Node.js and run:

```powershell
npm install
npm start
npm test
npm run test:ui
npm run test:soak
npm run dist
```

`start.cmd` launches an installed local Electron runtime and clears the IDE's `ELECTRON_RUN_AS_NODE` variable. With npm, clear that variable first if the IDE sets it. npm versions that restrict dependency install scripts may require running `node node_modules/electron/install.js` after installation to download Electron.

The local Node installation found on this machine is `C:\Users\zhien\AppData\Local\nodejs-portable\node-v24.21.0-win-x64`; add it to the current terminal's PATH if needed. The portable executable requires no Node installation.

Engine/save tests cover rule behavior and actual tactic paths, including classic orientation cycles, RNG, button timing, soft-drop scoring, entry, block-out, and start-level transitions. UI tests launch Electron with an isolated process-specific profile under the system temporary directory, simulate progression without modifying real saves, and verify purchases, practice, rendering, restarts, scaling, controls, and classic level 18 at 4× speed. Screenshots are written under `artifacts/`. Soak tests execute 1,700 pieces across starter modern, classic, and advanced modern strategies.

See `RULES.md` for the implemented rules profile. Complete current official Guideline compliance has not been verified.

Falling Blocks stores progress under `%APPDATA%/falling-blocks`. On first launch it imports the previous app save if no Falling Blocks save exists; the original save is retained. Open the renamed `Falling Blocks` folder in your IDE; `start.cmd` continues to work from that folder.

Unlockable block art: Candy Glass at 150 million, Mosaic at 400 million, Crystal at 900 million, Circuit at 2 billion, and Starlight at 8 billion lifetime points. Each changes block artwork on the board, hold, and next-piece previews, and includes a preview in the Skins menu.

A soft anime-style orange-and-cream corgi sits behind the board grid. Each fresh keystroke makes its tail wag for a moment, including typing elsewhere on the desktop when the input listener is available. Held-key repeat and mouse clicks do not trigger the wag.

Nature UI skins: Wildflower Meadow unlocks at 250 million lifetime points, Woodland at 750 million, and Ivy Garden at 1.25 billion. Each includes botanical interface decorations, a matching palette, and flower, pine-tree, or leafy-vine block art with previews in the Skins menu.

Temporary testing: start.cmd currently passes --unlock-all, making every skin, gameplay mode, and AI skill available without changing earned points or purchased skills. Remove --unlock-all from start.cmd to restore normal unlock requirements.

## Pair puzzle games

Settings ? Gameplay now includes Dr. Mario, Puyo Puyo, and Puzzle Fighter. All three are unlocked immediately and use a two-pair lookahead AI. Pause, playback speed, desktop input, saved game selection, and automatic restarts work across games. Highlighted matches wait for a new keystroke or left/middle/right mouse click before each clear or chain step.

Dr. Mario uses an 8?16 bottle, stationary viruses, linked capsule halves, and horizontal/vertical matches of four. Clearing all viruses wins the run. Puyo Puyo uses a 6?12 field and orthogonally connected groups of four, with falling groups creating chains. Puzzle Fighter uses a 6?12 field, same-color Crash Gems, 2?2-or-larger rectangular Power Gem regions, and a diamond every 25 pairs. These are solo desktop adaptations; Puzzle Fighter and Puyo Puyo have no opponent or garbage attacks. Falling Blocks training remains specific to Falling Blocks.

Rule references: [Nintendo Dr. Mario manual](https://www.nintendo.co.jp/clv/manuals/en/pdf/CLV-P-NAAXE_en.pdf), [SEGA Puyo Puyo](https://segaages.sega.com/project/puyo-puyo/index.htm), [Capcom Puzzle Fighter](https://news.capcomusa.com/lets/browse/puzzle-fighter-101-smash-those-gems).

After a loss or win, the game waits three simulated seconds and rotates to the next unlocked entry in the Gameplay selector, wrapping to the first. Clearing a Dr. Mario bottle or creating a Suika watermelon counts as a win. Locked modes are skipped; newly earned unlocks join the rotation automatically. The next selected mode is saved.
