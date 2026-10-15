@echo off
setlocal
cd /d "C:\Users\zhien\Desktop\Projects"
(
  powershell -NoProfile -Command "$sourceFolder='C:\Users\zhien\Desktop\Projects\TetrisIdler'; $targetFolder='C:\Users\zhien\Desktop\Projects\Falling Blocks'; try { if ([IO.Path]::GetFullPath($sourceFolder) -ne 'C:\Users\zhien\Desktop\Projects\TetrisIdler' -or [IO.Path]::GetFullPath($targetFolder) -ne 'C:\Users\zhien\Desktop\Projects\Falling Blocks') { throw 'Unexpected path' }; if (Test-Path -LiteralPath $targetFolder) { throw 'Falling Blocks already exists; nothing was changed' }; Move-Item -LiteralPath $sourceFolder -Destination $targetFolder -ErrorAction Stop; Write-Host 'Renamed project folder to Falling Blocks.' } catch { Write-Host $_.Exception.Message; Write-Host 'Close the IDE workspace, terminals, and Explorer windows using the project folder, then retry.'; exit 1 }"
  pause
)
