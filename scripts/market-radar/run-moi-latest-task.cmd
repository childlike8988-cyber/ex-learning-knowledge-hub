@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-moi-latest.ps1"
exit /b %ERRORLEVEL%
