@echo off
setlocal
set ELECTRON_RUN_AS_NODE=
cd /d "%~dp0"
if exist "node_modules\electron\dist\electron.exe" (
  "node_modules\electron\dist\electron.exe" . --unlock-all
) else (
  echo Run npm install first. See PLAYING.md for setup.
  pause
)
