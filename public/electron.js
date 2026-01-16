const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false // Allow loading local resources
        },
        icon: path.join(__dirname, 'logo512.png'),
        backgroundColor: '#0a0a0a',
        show: false, // Don't show until ready
        frame: true,
        titleBarStyle: 'default'
    });

    // Load the app
    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Check for updates on startup (only in production)
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers for license management
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('open-external', (event, url) => {
    shell.openExternal(url);
});

// ==================== AUTO UPDATER ====================
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Logging
log.transports.file.level = 'info';
autoUpdater.logger = log;

// Events
autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
    log.info('Update available.');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'available', info });
});

autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'not-available', info });
});

autoUpdater.on('error', (err) => {
    log.info('Error in auto-updater. ' + err);
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'error', error: err.message });
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    log.info(log_message);
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'downloading', progress: progressObj });
});

autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded');
    if (mainWindow) mainWindow.webContents.send('update_status', { status: 'downloaded', info });

    // Instantly quit and install
    // You might want to ask the user first, but you said "hassle free"
    // autoUpdater.quitAndInstall(); 
});

ipcMain.handle('check-for-updates', () => {
    if (!isDev) {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
});
// ======================================================
