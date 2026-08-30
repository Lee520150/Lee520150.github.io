param(
  [string]$Title
)

$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

Write-Host "== New blog post ==" -ForegroundColor Cyan
Write-Host "Working directory: $PSScriptRoot"

if ([string]::IsNullOrWhiteSpace($Title)) {
  $Title = Read-Host "Post title"
}

if ([string]::IsNullOrWhiteSpace($Title)) {
  Write-Host "Canceled: title is empty." -ForegroundColor Yellow
  exit 1
}

$before = Get-ChildItem -LiteralPath "source\_posts" -Filter "*.md" -File | Select-Object -ExpandProperty FullName

Write-Host "`nCreating post: $Title" -ForegroundColor Cyan
hexo new $Title

$after = Get-ChildItem -LiteralPath "source\_posts" -Filter "*.md" -File | Select-Object -ExpandProperty FullName
$created = Compare-Object -ReferenceObject $before -DifferenceObject $after | Where-Object { $_.SideIndicator -eq "=>" } | Select-Object -First 1 -ExpandProperty InputObject

if (-not $created) {
  $created = Get-ChildItem -LiteralPath "source\_posts" -Filter "*.md" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}

Write-Host "`nCreated:" -ForegroundColor Green
Write-Host $created

Write-Host "`nOpening the post file..." -ForegroundColor Cyan
try {
  Start-Process -FilePath $created
} catch {
  Write-Host "Could not open automatically. Please open this file manually:" -ForegroundColor Yellow
  Write-Host $created
}

Write-Host "`nTip: after writing, double-click update-blog.bat to publish." -ForegroundColor Green
