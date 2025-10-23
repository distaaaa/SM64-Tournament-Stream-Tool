const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

// Creat the main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'TTT Tool',
        width: 584,
        height: 410,

        minWidth: 584,
        minHeight: 410,
        // maxWidth: 584,
        // maxHeight: 378,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
        }
    });

    mainWindow.removeMenu();
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

    // const debugWindow = new BrowserWindow({
    //     title: 'debug',
    //     width: isDev ? 1200 : 600,
    //     height: 340,

    //     // minWidth: 590,
    //     // minHeight: 340,
    //     // maxWidth: 590,
    //     // maxHeight: 340,

    //     webPreferences: {
    //         preload: path.join(__dirname, 'preload.js'),
    //         nodeIntegration: true,
    //     }
    // });

    // Open devtools if in dev env
    if (isDev){
        mainWindow.webContents.openDevTools();
        //debugWindow.webContents.openDevTools();
    }

    //debugWindow.removeMenu();

    // Swap comments of mainwindow loads to switch between the html files
    // this html file wont load properly in your web browser so it's better
    // to test it in the electron app if you need to look at the console

    //debugWindow.loadFile(path.join('resources', 'Stream Tool', 'Game Scoreboard.html'));
}

// App is ready
app.whenReady().then(() => {
    createMainWindow();

    // Remove mainWindow from memory on close

    mainWindow.on('closed', () => { mainWindow = null })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})