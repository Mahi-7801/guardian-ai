@echo off
echo ========================================
echo  Guardian AI — Push to GitHub
echo ========================================
cd /d "d:\guardian-ai-main\guardian-ai-main"
git remote remove origin
git remote add origin https://github.com/Mahi-7801/guardian-ai.git
git branch -M main
git add .
git commit -m "feat: 10 new features + Multilingual + Mobile + Vercel/Render Config"
git push -u origin main
echo.
echo Done! Project is pushed to Mahi-7801/guardian-ai
pause
