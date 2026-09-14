# run_ralph.ps1
param(
    [int]$Limit = 20
)

$ErrorActionPreference = "Continue"

for ($i = 1; $i -le $Limit; $i++) {
    Write-Host "`n==================================================" -ForegroundColor DarkCyan
    Write-Host "🌀 Ralph Loop Iteration $i of $Limit..." -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor DarkCyan

    if (Test-Path "progress.txt") {
        $progress = Get-Content "progress.txt" -Raw
        if ($progress -match "ralph-done") {
            Write-Host "`n🎉 All tasks in PRD.md marked complete! Stopping Ralph Loop." -ForegroundColor Green
            break
        }
    }

    if (Get-Command agy -ErrorAction SilentlyContinue) {
        Get-Content "prompt.md" | agy -p -
    } else {
        Write-Host "ℹ️ Antigravity CLI ('agy') not in PATH for automated spawning. Executing in current agent context." -ForegroundColor Yellow
        break
    }
}
