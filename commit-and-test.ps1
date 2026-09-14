# commit-and-test.ps1
# Automates linting/CodeRabbit check, pytest execution, and clean Git commits.
param (
    [string]$CommitMessage = "chore: atomic task completed"
)

$ErrorActionPreference = "Stop"

Write-Host "`n[1/3] Checking Code Analysis and Review..." -ForegroundColor Cyan
if (Get-Command cr -ErrorAction SilentlyContinue) {
    try {
        cr --dir . --agent | Out-File -FilePath "coderabbit_feedback.txt" -Encoding utf8
        $feedback = Get-Content "coderabbit_feedback.txt" -Raw
        if ($feedback -match "(CRITICAL|HIGH_SEVERITY)") {
            Write-Host "CodeRabbit reported critical violations. Check coderabbit_feedback.txt" -ForegroundColor Red
            exit 1
        }
        Write-Host "CodeRabbit review clean." -ForegroundColor Green
    } catch {
        Write-Host "CodeRabbit scan skipped or timed out." -ForegroundColor Yellow
    }
} else {
    Write-Host "CodeRabbit CLI not detected, proceeding directly to unit tests..." -ForegroundColor Gray
}

Write-Host "`n[2/3] Running MedGuide AI Test Suite..." -ForegroundColor Cyan
Push-Location "backend"
try {
    & ".\.venv\Scripts\pytest.exe" -q
    $testExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}

if ($testExitCode -ne 0) {
    Write-Host "Unit tests failed with exit code $testExitCode. Commit aborted." -ForegroundColor Red
    exit 1
}

Write-Host "All tests passed successfully." -ForegroundColor Green

Write-Host "`n[3/3] Creating Clean Git Commit..." -ForegroundColor Cyan
git add -A
git commit -m "$CommitMessage"
$commitExitCode = $LASTEXITCODE

if ($commitExitCode -eq 0) {
    Write-Host "Task cleanly committed: $CommitMessage" -ForegroundColor Green
} else {
    Write-Host "Nothing to commit or git returned code $commitExitCode." -ForegroundColor Yellow
}
exit 0
