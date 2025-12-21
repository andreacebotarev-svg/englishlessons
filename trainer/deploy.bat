@echo off
REM Simple deploy script for Windows
REM Usage: deploy.bat "commit message"

echo Building trainer...
call npm run build

echo Adding dist to git...
git add dist\

if "%~1"=="" (
  set MESSAGE=build: update trainer dist
) else (
  set MESSAGE=%~1
)

echo Committing: %MESSAGE%
git commit -m "%MESSAGE%"

echo Pushing to GitHub...
git push origin main

echo Done! Wait 1-2 minutes and check:
echo https://andreacebotarev-svg.github.io/englishlessons/trainer/
pause
