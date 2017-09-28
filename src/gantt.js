import fs from 'fs';
import path from 'path';
import electron, { remote, ipcRenderer } from 'electron';

// dialog variable
const { dialog } = electron.remote;

// variable used to store if a file has been loaded
let quickSaveFileName;
// variable that will return a current window BroswerWindow object
const win = remote.getCurrentWindow();

// creating a template for the 'buttons' section of the grid
const colHeader = '<div title="Add New Task" class="gantt_grid_head_cell gantt_grid_head_add" onclick="gantt.createTask()"></div>',
  colContent = task => `<i title="Edit Task" class="fa gantt_button_grid gantt_grid_edit fa-pencil" onclick="clickGridButton(${task.id}, 'edit')"></i>
                        <i title="Add Child Task" class="fa gantt_button_grid gantt_grid_add fa-plus" onclick="clickGridButton(${task.id}, 'add')"></i>
                        <i title="Delete Task" class="fa gantt_button_grid gantt_grid_delete fa-times" onclick="clickGridButton(${task.id}, 'delete')"></i>`;

// configuring the columns within the grid
gantt.config.columns = [
  {
    name: 'overdue',
    label: 'Status',
    width: 45,
    template: (obj) => {
      if (obj.deadline) {
        const deadline = gantt.date.parseDate(obj.deadline, 'xml_date');
        if (deadline && obj.end_date > deadline) {
          return '<div class="overdue-indicator" title="Overdue">!</div>';
        }
        if (deadline && obj.end_date <= deadline) {
          return '<div class="not-overdue" title="On Task">!</div>';
        }
      }
      return '<div></div>';
    },
  },
  { name: 'text', label: 'Task Name', width: '*', tree: true, resize: true },
  { name: 'start_date', label: 'Start Time', template: obj => gantt.templates.date_grid(obj.start_date), align: 'center', width: '80' },
  { name: 'deadline', label: 'Deadline', align: 'center', width: '80', template: (obj) => { if (!obj.deadline) { return 'None'; } return obj.deadline; } },
  { name: 'duration', label: 'Duration', align: 'center', width: '50' },
  { name: 'buttons', label: colHeader, width: 75, template: colContent },
];

// configuring task names to appear outside of task if task name is too long
(() => {
  const getTaskFitValue = (task) => {
    const taskStartPos = gantt.posFromDate(task.start_date),
      taskEndPos = gantt.posFromDate(task.end_date);

    const width = taskEndPos - taskStartPos;
    const textWidth = (task.text || '').length * gantt.config.font_width_ratio;

    if (width < textWidth) {
      const ganttLastDate = gantt.getState().max_date;
      const ganttEndPos = gantt.posFromDate(ganttLastDate);
      if (ganttEndPos - taskEndPos < textWidth) {
        return 'left';
      }
      return 'left';
    }
    return 'center';
  };
  gantt.config.font_width_ratio = 7;
  gantt.templates.leftside_text = function leftSideTextTemplate(start, end, task) {
    if (getTaskFitValue(task) === 'left') {
      return task.text;
    }
    return '';
  };
  gantt.templates.task_text = function taskTextTemplate(start, end, task) {
    if (getTaskFitValue(task) === 'center') {
      return task.text;
    }
    return '';
  };
})();

// logic for applying the deadline icon on the task
gantt.addTaskLayer((task) => {
  if (task.deadline) {
    const element = document.createElement('div');
    element.className = 'deadline';
    const sizes = gantt.getTaskPosition(task, task.deadline);

    element.style.left = `${sizes.left}px`;
    element.style.top = `${sizes.top}px`;

    element.setAttribute('title', gantt.templates.task_date(task.deadline));
    return element;
  }
  return false;
});

// displaying progress % on left side of task
gantt.templates.progress_text = (start, end, task) => (
    `<span style='text-align:left;'>${Math.trunc(task.progress * 100)}% </span>`
  );

// logic for determing if a task is overdue
gantt.templates.task_class = (start, end, task) => {
  if (task.deadline && end.valueOf() > task.deadline.valueOf()) {
    return 'overdue';
  }
};

// painting overdue text + number of days overdue on the right side of a task
gantt.templates.rightside_text = (start, end, task) => {
  if (task.deadline) {
    if (end.valueOf() > task.deadline.valueOf()) {
      const overdue = Math.ceil(Math.abs((end.getTime() - task.deadline.getTime()) / (24 * 60 * 60 * 1000)));
      const text = `<b>Overdue: ${overdue} day(s)</b>`;
      return text;
    }
  }
};

// template for specifying the message
gantt.templates.link_description = (link) => {
  const from = gantt.getTask(link.source).text;
  const to = gantt.getTask(link.target).text;
  const text = `Delete the link from <br/> ${from} to ${to}`;
  return text;
};

// parses the date of the deadline and if the task has one and returns true
gantt.attachEvent('onTaskLoading', (task) => {
  if (task.deadline) {
    task.deadline = gantt.date.parseDate(task.deadline, '%d, %M, %Y');
  }
  return true;
});

// preventing the default behavior on task double click i.e. lightbox appears
gantt.attachEvent('onTaskDblClick', (task, e) => false);

// triggering a delete link dialog if the user clicks on a link
gantt.attachEvent('onLinkClick', (task, e) => {
  const link = gantt.getLink(task);
  const a = '';
  const i = gantt.templates.link_description(gantt.getLink(task));
  window.setTimeout(() => {
    gantt._dhtmlx_confirm(i, a, () => {
      gantt.deleteLink(link.id);
    });
  }, 300);
});

// validating that the task has both a name and has been assigned
gantt.attachEvent('onLightBoxSave', (id, task) => {
  if (!task.text) {
    gantt.message({ type: 'error', text: 'Please enter a task description' });
    return false;
  }
  if (!task.assigned) {
    gantt.message({ type: 'error', text: 'Task must be assigned' });
    return false;
  }
  return true;
});

// custom labels for the lightbox fields
gantt.locale.labels.deadline_enable_button = 'Set';
gantt.locale.labels.deadline_disable_button = 'Remove';
gantt.locale.labels.section_deadline = 'Deadline';
gantt.locale.labels.section_assigned = 'Assigned To';

// caculating the task duration for the lightbox
const duration = (begin, end, total) => {
  const result = gantt.calculateDuration(
    begin.getDate(false),
    end.getDate(false),
  );
  total.innerHTML = `${result} days`;
  gantt.attachEvent('onAfterLightBox', () => {
    total.innerHTML = '';
  });
};

// initializing the calendar component for time selection
const calendarInit = (id, data, date) => {
  const object = new dhtmlXCalendarObject(id);
  object.disableDays('week', [6, 7]);
  object.setDateFormat(data.date_format ? data.date_format : '');
  object.setDate(date || new Date());
  object.hideTime();
  if (data.skin) {
    object.setSkin(data.skin);
  }
  return object;
};

// creating the custom calendar element
gantt.form_blocks.dhx_calendar = {
  render: () => `<div class='dhx_calendar_cont'><input type='text' readonly='true' id='calendar1'/> &#8211
                  <input type='text' readonly='true' id='calendar2'/><label id='duration'></label></div>`,
  set_value: (node, value, task, data) => {
    let a = (node.calStart = calendarInit('calendar1', data, task.start_date));
    let b = (node.calEnd = calendarInit('calendar2', data, task.end_date));
    const c = node.lastChild;
    b.setInsensitiveRange(null, new Date(a.getDate(false) - 86400000));
    const aClick = a.attachEvent('onClick', (date) => {
      b.setInsensitiveRange(null, new Date(date.getTime() - 86400000));
      duration(a, b, c);
    });

    const bClick = b.attachEvent('onClick', (date) => {
      duration(a, b, c);
    });

    const aTimeClick = a.attachEvent('onChange', (d) => {
      b.setInsensitiveRange(null, new Date(d.getTime() - 86400000));
      duration(a, b, c);
    });

    const bTimeClick = b.attachEvent('onChange', (d) => {
      duration(a, b, c);
    });

    const id = gantt.attachEvent('onAfterLightbox', function detach() {
      a.detachEvent(aClick);
      a.detachEvent(aTimeClick);
      a.unload();
      b.detachEvent(bClick);
      b.detachEvent(bTimeClick);
      b.unload();
      a = b = null;
      this.detachEvent(id);
    });

    document.getElementById('calendar1').value = a.getDate(true);
    document.getElementById('calendar2').value = b.getDate(true);
  },
  get_value: (node, task) => {
    task.start_date = node.calStart.getDate(false);
    task.end_date = gantt.date.date_part(node.calEnd.getDate(false));
    return task;
  },
  focus: (node) => {},
};

// renders a calendar for deadline input
gantt.form_blocks.dhx_calendar2 = {
  render: () => `<div class='dhx_calendar_cont'><input type='text' readonly='true' id='calendar3'/>
                </div>`,
  set_value: (node, value, task, data) => {
    let a = (node.calStart = calendarInit('calendar3', data, task.deadline === null ? task.end_date : task.deadline));
    const id = gantt.attachEvent('onAfterLightbox', function detach() {
      a.unload();
      a = null;
      this.detachEvent(id);
    });

    document.getElementById('calendar3').value = a.getDate(true);
  },
  get_value: (node, task) => {
    task.deadline = gantt.date.date_part(node.calStart.getDate(false));
    return task;
  },
  focus: (node) => {},
};

// configuring the lightbox fields
gantt.config.lightbox.sections = [
  { name: 'description', height: 50, map_to: 'text', type: 'textarea', focus: true },
  { name: 'assigned', height: 35, map_to: 'assigned', type: 'textarea' },
  { name: 'time', map_to: 'auto', type: 'dhx_calendar', skin: '', date_format: '%d %M %Y' },
  { name: 'deadline', map_to: 'auto', type: 'dhx_calendar2', skin: '', date_format: '%d %M %Y' },
];


// configuring the time scale for the gantt chart
// top level month, year
gantt.config.scale_unit = 'month';
gantt.config.step = 1;
gantt.config.date_scale = '%F, %Y';
// second level day, numeric day number
gantt.config.subscales = [{ unit: 'day', step: 1, date: '%D, %d' }];
// scale the height of the time scale
gantt.config.scale_height = 80;

// configuration to make the chart time scale scale as tasks are added
gantt.config.fit_tasks = true;

// configuration that allows tasks in the grid to be DnD and reconfigurable
gantt.config.order_branch = true;

// removes non-working time from calculation and hides non working time in the chart
gantt.config.work_time = true;
gantt.config.skip_off_time = true;

// custom grid width
gantt.config.grid_width = 500;

// initialize the configured gantt chart
gantt.init('gantt');

// Ignoring weekends from time scale
gantt.ignore_time = (date) => {
  if (date.getDay() === 0 || date.getDay() === 6) return true;
  return false;
};

// handlers for when a user clicks on one of the buttons in the grid
const clickGridButton = (id, action) => {
  switch (action) {
    case 'edit':
      gantt.showLightbox(id);
      break;
    case 'add':
      gantt.createTask(null, id);
      break;
    case 'delete':
      gantt.confirm({
        title: gantt.locale.labels.confirm_deleting_title,
        text: gantt.locale.labels.confirm_deleting,
        callback: (res) => {
          if (res) gantt.deleteTask(id);
        },
      });
      break;
    default:
  }
};

// function that takes a name parameter from onclick and loads the correct stylesheet
// and replaces it
const changeSkin = (name) => {
  const link = document.createElement('link');
  link.onload = () => {
    gantt.resetSkin();
    gantt.config.scale_height = 80;
    gantt.render();
  };
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.id = 'skin';
  link.href = `../src/codebase/skins/dhtmlxgantt_${name}.css`;
  document.head.replaceChild(link, document.querySelector('#skin'));
};

// function that clears all tasks from current gantt
ipcRenderer.on('new-gantt', () => {
  dialog.showMessageBox(
    win,
    {
      type: 'warning',
      title: 'Ganttron',
      message: 'This will clear the gantt chart and erase all data',
      buttons: ['Cancel', 'OK'],
    },
    (response) => {
      if (response === 1) {
        gantt.clearAll();
        quickSaveFileName = null;
      }
    },
  );
});

// dirty quicksave
const quickSave = () => {
  let saveData = gantt.serialize();
  saveData = JSON.stringify(saveData, null, '\t');
  if (quickSaveFileName === undefined || quickSaveFileName === null) {
    dialog.showSaveDialog(
      win,
      {
        defaultPath: `C:\\Users\\${process.env.USERNAME}\\Documents\\`,
        filters: [
          {
            name: 'json',
            extensions: ['json'],
          },
        ],
      },
      (filename) => {
        if (filename === undefined) {
          return;
        }
        fs.writeFile(filename, content, (error) => {
          if (error) {
            dialog.showErrorBox(
              win,
              'Save Failed',
              `An error occured saving the file ${error.message}`,
            );
            return;
          }
          dialog.showMessageBox(
            win,
            {
              type: 'none',
              title: 'Ganttron',
              message: 'The chart was successfully saved',
              buttons: ['OK'],
            },
          );
        });
      });
  } else {
    fs.writeFile(quickSaveFileName, saveData, (error) => {
      if (error) {
        dialog.showErrorBox(
          win,
          'Save Failed',
          `An error occured saving the file ${error.message}`,
        );
      }
      dialog.showMessageBox(
        win,
        {
          type: 'none',
          title: 'Ganttron',
          message: 'The chart was successfully saved',
          buttons: ['OK'],
        },
      );
    });
  }
};

// function for saving a gantt project projects are serialized into a JSON file
// the JSON is then stringified for human readiblity then thru the dialog api is saved to
// users computer
const saveGantt = () => {
  let content = gantt.serialize();
  content = JSON.stringify(content, null, '\t');
  dialog.showSaveDialog(
    win,
    {
      defaultPath: `C:\\Users\\${process.env.USERNAME}\\Documents\\`,
      filters: [
        {
          name: 'json',
          extensions: ['json'],
        },
      ],
    },
    (filename) => {
      if (filename === undefined) {
        return;
      }
      fs.writeFile(filename, content, (err) => {
        if (err) {
          dialog.showErrorBox(
            win,
            'Save Failed',
            `An error occured saving the file ${err.message}`,
          );
          return;
        }
        dialog.showMessageBox(
          win,
          {
            type: 'none',
            title: 'Ganttron',
            message: 'The chart was successfully saved',
            buttons: ['OK'],
          },
        );
      });
    },
  );
};

// function that loads a gantt project uses the dialog api to open a JSON file from
// the users computer then it is parsed to return a JSON object that is then parsed by
// the gantt api
ipcRenderer.on('open-gantt', () => {
  dialog.showMessageBox(
    win,
    {
      type: 'warning',
      title: 'Ganttron',
      message: 'This will clear the gantt chart and load new data',
      buttons: ['Cancel', 'OK'],
    },
    (response) => {
      if (response === 1) {
        gantt.clearAll();
        dialog.showOpenDialog(
          win,
          {
            defaultPath: `C:\\Users\\${process.env.USERNAME}\\Documents`,
            filters: [
              {
                name: 'json',
                extensions: ['json'],
              },
            ],
          },
          (fileName) => {
            if (fileName === undefined) {
              return;
            }
            fs.readFile(fileName[0], 'utf-8', (err, data) => {
              quickSaveFileName = fileName[0].toString();
              if (err) {
                dialog.showErrorBox(
                  win,
                  'Load Failed',
                  `Cannot read file ${err.message}`,
                );
              }
              const loadedData = JSON.parse(data);
              gantt.parse(loadedData);
            });
          },
        );
      }
    },
  );
});

ipcRenderer.on('open-new', () => {
  ipcRenderer.send('open-new');
});

