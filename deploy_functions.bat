@echo off
echo === Firebase Functions Deploy ===
firebase deploy --only functions
echo === Exit code: %ERRORLEVEL% ===
pause
