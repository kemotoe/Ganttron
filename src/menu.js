import { app, Menu, BrowserWindow } from 'electron';


//
export const setMainMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Gantt...',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('new-gantt');
          },
        },
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('open-new');
          },
        },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('close');
          },
        },
        { type: 'separator' },
        {
          label: 'Open File...',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('open-file');
          },
        },
        {
          label: 'Open Recent',
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdorCtrl+S',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('save');
          },
        },
        {
          label: 'Save As...',
          accelerator: 'CmdorCtrl+Shift+S',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('save-as');
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('undo');
          },
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Y',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            focusedWindow.webContents.send('redo');
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { role: 'resetzoom' },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
