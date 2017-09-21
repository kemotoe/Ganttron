import { app, Menu } from 'electron';

//
const setMainMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Gantt' },
        { label: 'Open Gantt' },
        { type: 'separator' },
        { label: 'Save' },
        { label: 'Save As...' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
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

module.exports = {
  setMainMenu,
};
