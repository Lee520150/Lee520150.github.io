param(
  [string]$Message = "update blog"
)

$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

Write-Host "== Blog update ==" -ForegroundColor Cyan
Write-Host "Working directory: $PSScriptRoot"

Write-Host "`n[1/4] Building site..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Blog build failed (exit code $LASTEXITCODE)."
}

Write-Host "`n[2/4] Checking changes..." -ForegroundColor Cyan
$status = git status --short
if ($LASTEXITCODE -ne 0) {
  throw "Unable to read Git status (exit code $LASTEXITCODE)."
}
if (-not $status) {
  Write-Host "No changes to publish." -ForegroundColor Yellow
  exit 0
}

Write-Host $status

Write-Host "`n[3/4] Committing changes..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
  throw "Git add failed (exit code $LASTEXITCODE)."
}
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw "Git commit failed (exit code $LASTEXITCODE)."
}

Write-Host "`n[4/4] Pushing to GitHub..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) {
  throw "Git push failed (exit code $LASTEXITCODE). Check the network or GitHub login, then run the updater again."
}

Write-Host "`nDone. GitHub Pages will update in about 1-3 minutes." -ForegroundColor Green
Write-Host "Site: https://lee520150.github.io/"
