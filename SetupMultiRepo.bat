@echo off
echo Setting up Git remotes...

git remote add all https://github.com/ILFforever/SE-NNN-CarRental-FE
git remote set-url --add --push all https://github.com/ILFforever/SE-NNN-CarRental-FE
git remote set-url --add --push all https://github.com/2110503-2564/se-project-21_nnn-community/
git branch -u origin/main
git remote -v

echo Git remotes setup complete.
pause