@echo off
cd /d "c:\Users\Asus\OneDrive\Desktop\acharya_ways_new"

echo [1] Initializing git repo...
git init -b main > git_result.txt 2>&1

echo [2] Setting remote...
git remote add origin https://github.com/akashiti/Acharya-Web.git >> git_result.txt 2>&1

echo [3] Adding all files...
git add . >> git_result.txt 2>&1

echo [4] Committing...
git commit -m "Initial commit: Acharya Ways project" >> git_result.txt 2>&1

echo [5] Pushing to GitHub...
git push -u origin main >> git_result.txt 2>&1

echo [Done] >> git_result.txt 2>&1
