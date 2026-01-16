@echo off
echo ========================================
echo HabitOS - Electron Desktop App
echo ========================================
echo.

:menu
echo Choose an option:
echo.
echo 1. Install Dependencies
echo 2. Run Web Version (Development)
echo 3. Run Electron App (Development)
echo 4. Build Windows App
echo 5. Build All Platforms
echo 6. Start Backend Server
echo 7. Exit
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto web
if "%choice%"=="3" goto electron
if "%choice%"=="4" goto build_win
if "%choice%"=="5" goto build_all
if "%choice%"=="6" goto backend
if "%choice%"=="7" goto end

echo Invalid choice. Please try again.
echo.
goto menu

:install
echo.
echo Installing dependencies...
call npm install
echo.
echo Dependencies installed!
pause
goto menu

:web
echo.
echo Starting web version...
echo Open http://localhost:3000 in your browser
call npm start
goto menu

:electron
echo.
echo Starting Electron app...
call npm run electron:dev
goto menu

:build_win
echo.
echo Building Windows app...
echo This may take 5-10 minutes...
call npm run electron:build:win
echo.
echo Build complete! Check the 'dist' folder.
pause
goto menu

:build_all
echo.
echo Building for all platforms...
echo This may take 10-15 minutes...
call npm run electron:build
echo.
echo Build complete! Check the 'dist' folder.
pause
goto menu

:backend
echo.
echo Starting backend server...
cd backend
call node server.js
goto menu

:end
echo.
echo Goodbye!
exit
