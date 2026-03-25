@echo off
cd /d "c:\Users\Asus\OneDrive\Desktop\acharya_ways_new"
echo === Git Status Check ===
git rev-parse --is-inside-work-tree
if errorlevel 1 (
    echo Not a git repo. Initializing...
    git init
    git remote add origin https://github.com/akashiti/Acharya-Web.git
) else (
    echo Already a git repo.
    git remote -v
)
echo === Adding all files ===
git add .
echo === Committing ===
git commit -m "Initial commit: Acharya Ways project"
echo === Setting branch to main ===
git branch -M main
echo === Pushing to GitHub ===
git push -u origin main
echo === Done ===
pause
