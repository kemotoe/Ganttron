import { app, BrowserWindow, ipcMain } from 'electron';

import { setMainMenu } from './menu';

require('electron-context-menu')({
  showInpsectElement: true,
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let newWindow;

const createWindow = () => {
  // Create the browser window set show to false and load our icon
  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 1366,
    minHeight: 768,
    title: 'Ganttron',
    icon: `${__dirname}/img/gantt.ico`,
  });

  mainWindow.webContents.openDevTools();

  // Load the index.html of the app maximize the window before loading the page
  mainWindow.maximize();
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  setMainMenu(mainWindow);
  // Wait for window to load before we show
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });


  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Opens new window
ipcMain.on('open-new', () => {
  // Create the browser window set show to false and load our icon
  newWindow = new BrowserWindow({
    show: false,
    minWidth: 1366,
    minHeight: 768,
    title: 'Ganttron',
    icon: `${__dirname}/img/gantt.ico`,
  });

  // Load the index.html of the app maximize the window before loading the page
  newWindow.loadURL(`file://${__dirname}/index.html`);
  setMainMenu(newWindow);
  // Wait for window to load before we show
  newWindow.on('ready-to-show', () => {
    newWindow.show();
    newWindow.focus();
  });


  // Emitted when the window is closed.
  newWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    newWindow = null;
  });
});

