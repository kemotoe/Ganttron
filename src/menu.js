import { app, Menu } from 'electron';

//
export const setMainMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Gantt',
          click: () => {

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
            gantt.undo();
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
