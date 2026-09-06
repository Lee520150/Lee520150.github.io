param(
  [string]$Title,
  [string]$Section
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

$sections = [ordered]@{
  "1" = @{ Label = "Notes"; Categories = @("Notes"); Tag = "Notes"; Path = "/notes/" }
  "2" = @{ Label = "技术分享 / PCB"; Categories = @("技术分享", "PCB"); Tag = "PCB"; Path = "/categories/PCB/" }
  "3" = @{ Label = "技术分享 / 《单片机基础》助教记录"; Categories = @("技术分享", "《单片机基础》助教记录"); Tag = "《单片机基础》助教记录"; Path = "/categories/《单片机基础》助教记录/" }
  "4" = @{ Label = "Projects"; Categories = @("Projects"); Tag = "Projects"; Path = "/projects/" }
  "5" = @{ Label = "Life"; Categories = @("Life"); Tag = "Life"; Path = "/life/" }
  "6" = @{ Label = "Blog"; Categories = @("Blog"); Tag = "Blog"; Path = "/" }
}

if ([string]::IsNullOrWhiteSpace($Section)) {
  Write-Host ""
  Write-Host "Choose section:" -ForegroundColor Cyan
  foreach ($key in $sections.Keys) {
    Write-Host ("  " + $key + ". " + $sections[$key].Label)
  }
  $Section = Read-Host "Section number"
}

if (-not $sections.Contains($Section)) {
  Write-Host "Canceled: invalid section." -ForegroundColor Yellow
  exit 1
}

$selected = $sections[$Section]
$postsDir = Join-Path $PSScriptRoot "source\_posts"
$before = Get-ChildItem -LiteralPath $postsDir -Filter "*.md" -File | Select-Object -ExpandProperty FullName

Write-Host ""
Write-Host ("Creating post: " + $Title) -ForegroundColor Cyan
hexo new $Title

$after = Get-ChildItem -LiteralPath $postsDir -Filter "*.md" -File | Select-Object -ExpandProperty FullName
$created = Compare-Object -ReferenceObject $before -DifferenceObject $after | Where-Object { $_.SideIndicator -eq "=>" } | Select-Object -First 1 -ExpandProperty InputObject

if (-not $created) {
  $created = Get-ChildItem -LiteralPath $postsDir -Filter "*.md" -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
}

$moreMarker = [string][char]60 + "!-- more --" + [string][char]62
$date = (Get-Date).ToString("yyyy-MM-dd") + "T12:00:00+08:00"
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("---")
$lines.Add("title: " + $Title)
$lines.Add("date: " + $date)
$lines.Add("categories:")
foreach ($category in $selected.Categories) {
  $lines.Add("  - " + $category)
}
$lines.Add("tags:")
$lines.Add("  - " + $selected.Tag)
$lines.Add("---")
$lines.Add("")
$lines.Add("Write the summary here.")
$lines.Add("")
$lines.Add($moreMarker)
$lines.Add("")
$lines.Add("Write the full article here.")

Set-Content -LiteralPath $created -Value $lines -Encoding UTF8

Write-Host ""
Write-Host "Created:" -ForegroundColor Green
Write-Host $created
Write-Host ("Section: " + $selected.Label) -ForegroundColor Green
Write-Host ("It will appear under: " + $selected.Path)

Write-Host ""
Write-Host "Opening the post file..." -ForegroundColor Cyan
try {
  Start-Process -FilePath $created
} catch {
  Write-Host "Could not open automatically. Please open this file manually:" -ForegroundColor Yellow
  Write-Host $created
}

Write-Host ""
Write-Host "Tip: after writing, double-click update-blog.bat to publish." -ForegroundColor Green
