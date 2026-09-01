param(
  [string]$Message = "update blog"
)

$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

function Invoke-GitPushWithRetry {
  param(
    [int]$MaxAttempts = 4,
    [int]$DelaySeconds = 8
  )

  for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
    Write-Host ("Push attempt {0}/{1}..." -f $attempt, $MaxAttempts) -ForegroundColor DarkGray
    git push origin main
    if ($LASTEXITCODE -eq 0) {
      return
    }

    if ($attempt -lt $MaxAttempts) {
      Write-Host ("Push failed. Waiting {0}s, then retrying..." -f $DelaySeconds) -ForegroundColor Yellow
      Start-Sleep -Seconds $DelaySeconds
    }
  }

  throw "Git push failed after $MaxAttempts attempts. Check the network or GitHub login, then run the updater again."
}

function Test-RemoteSynced {
  $localHead = (git rev-parse HEAD).Trim()
  if ($LASTEXITCODE -ne 0) {
    throw "Unable to read local Git commit (exit code $LASTEXITCODE)."
  }

  $remoteLine = git ls-remote origin refs/heads/main
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Could not verify GitHub remote right now, but push has finished." -ForegroundColor Yellow
    return
  }

  $remoteHead = ($remoteLine -split "\s+")[0]
  if ($remoteHead -eq $localHead) {
    Write-Host "Verified: GitHub main is now synced with this computer." -ForegroundColor Green
  } else {
    Write-Host "Warning: GitHub main does not match local HEAD yet." -ForegroundColor Yellow
    Write-Host ("Local : " + $localHead) -ForegroundColor DarkGray
    Write-Host ("Remote: " + $remoteHead) -ForegroundColor DarkGray
  }
}

Write-Host "== Blog update ==" -ForegroundColor Cyan
Write-Host "Working directory: $PSScriptRoot"
Write-Host "Tip: save files in VS Code first (Ctrl+S), then run this updater." -ForegroundColor DarkGray

Write-Host "`n[1/5] Cleaning cache..." -ForegroundColor Cyan
npm run clean
if ($LASTEXITCODE -ne 0) {
  throw "Blog clean failed (exit code $LASTEXITCODE)."
}

Write-Host "`n[2/5] Building site..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Blog build failed (exit code $LASTEXITCODE)."
}

Write-Host "`n[3/5] Checking changes..." -ForegroundColor Cyan
$status = git status --short
if ($LASTEXITCODE -ne 0) {
  throw "Unable to read Git status (exit code $LASTEXITCODE)."
}

if (-not $status) {
  Write-Host "No file changes detected." -ForegroundColor Yellow
  Write-Host "Trying to push anyway in case a previous run committed locally but failed online..." -ForegroundColor DarkGray
  Invoke-GitPushWithRetry
  Test-RemoteSynced
  Write-Host "`nDone. No new commit was needed. GitHub is already up to date, or a previous commit has just been pushed." -ForegroundColor Green
  Write-Host "Site: https://lee520150.github.io/"
  exit 0
}

Write-Host $status

Write-Host "`n[4/5] Committing changes..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
  throw "Git add failed (exit code $LASTEXITCODE)."
}
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "Git commit failed (exit code $LASTEXITCODE)."
}

Write-Host "`n[5/5] Pushing to GitHub..." -ForegroundColor Cyan
Invoke-GitPushWithRetry
Test-RemoteSynced

Write-Host "`nDone. GitHub Pages will update in about 1-3 minutes." -ForegroundColor Green
Write-Host "Site: https://lee520150.github.io/"
