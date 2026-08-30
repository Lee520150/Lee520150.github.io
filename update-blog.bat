@echo off
chcp 65001 >nul
title Update COLOR Blog

cd /d "%~dp0"

echo == Blog update ==
echo Working directory: %cd%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-blog.ps1" %*

echo.
if errorlevel 1 (
  echo Update failed. Please check the messages above.
) else (
  echo Update finished. GitHub Pages will update in about 1-3 minutes.
  echo Site: https://lee520150.github.io/
)

echo.
pause
