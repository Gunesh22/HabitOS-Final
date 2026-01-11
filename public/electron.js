const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        backgroundColor: '#050505', // Match body bg
        autoHideMenuBar: true,
        titleBarStyle: 'default',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // For simple localStorage access if needed, though React uses browser storage
        },
        icon: path.join(__dirname, 'favicon.ico')
    });

    // In production, load the built index.html
    // In dev, you could load localhost, but we are building for production EXE
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));

    // Open links in external browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });
}

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
