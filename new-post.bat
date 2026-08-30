@echo off
chcp 65001 >nul
title New Blog Post

cd /d "%~dp0"

echo == New blog post ==
echo Working directory: %cd%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0new-post.ps1" %*

echo.
pause
