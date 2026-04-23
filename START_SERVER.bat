@echo off
echo ====================================
echo  Starting BookSphere Server...
echo ====================================
cd /d "%~dp0server"
node server.js
pause
