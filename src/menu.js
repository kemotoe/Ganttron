import { app, Menu } from 'electron';


//
export const setMainMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Clear Gantt',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            console.log('clear');
          },
        },
        { label: 'Open Gantt' },
        { type: 'separator' },
        { label: 'Save' },
        { label: 'Save As...' },
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
            console.log('undo');
          },
        },
        { role: 'redo' },
        { type: 'separator' },
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
