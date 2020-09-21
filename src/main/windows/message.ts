import * as fs from 'fs';
import * as winston from 'winston';
import { APP_DIALOG_FILE, windowSizes } from '../const';
import { intl } from '../locale';
import { BrowserWindowEx, CreateWindow } from './window';

function saveDialogs(dialogs: string[]) {
  fs.writeFileSync(APP_DIALOG_FILE, JSON.stringify(dialogs, null, '  '), { flag: 'w+' });
}

function getDialogs() {
  let dialogs: string[] = [];

  if (fs.existsSync(APP_DIALOG_FILE)) {
    try {
      const json = fs.readFileSync(APP_DIALOG_FILE).toString();
      dialogs = JSON.parse(json);

      if (!Array.isArray(dialogs)) {
        throw new TypeError('Bad JSON format. Must be Array of strings');
      }
    } catch (e) {
      winston.error(`Cannot parse JSON file ${APP_DIALOG_FILE}`);
      winston.error(e);
    }
  }

  return dialogs;
}

function hasDialog(name: string) {
  return getDialogs().includes(name);
}

function onDialogClose(window: BrowserWindowEx) {
  if (window.params && window.params.id && window.params.showAgainValue) {
    const dialogs = getDialogs();

    dialogs.push(window.params.id);
    saveDialogs(dialogs);
    winston.info(`Disable dialog ${window.params.id}`);
  }
}

let warnWindow: BrowserWindowEx | null = null;

interface ICreateWarningWindowOptions extends ICreateWindowOptions {
  buttonLabel?: string;
}

/**
 * Creates Warning window
 *
 * @param text    Message text
 * @param options modal dialog parameters
 * @param cb    Callback on message close
 * @returns
 */
export function CreateWarningWindow(
  text: string,
  options: ICreateWarningWindowOptions = {},
  cb?: () => void,
) {
  if (options.id && options.showAgain && hasDialog(options.id)) {
    winston.info(`Don't show dialog '${options.id}'. It's disabled`);

    return null;
  }
  // Create the browser window.
  if (warnWindow) {
    warnWindow.show();

    return null;
  }

  warnWindow = CreateWindow({
    ...windowSizes.small,
    app: 'message',
    title: options.title || intl('warning'),
    center: true,
    alwaysOnTop: !!options.alwaysOnTop,
    modal: !!options.parent,
    parent: options.parent,
    dock: options.parent ? false : options.dock,
    params: {
      type: 'warning',
      buttonLabel: options.buttonLabel || intl('close'),
      text,
      id: options.id,
      showAgain: options.showAgain,
      showAgainValue: false,
    },
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  warnWindow.on('closed', () => {
    if (warnWindow) {
      onDialogClose(warnWindow);
    }

    warnWindow = null;

    if (cb) {
      cb();
    }
  });
}

/**
 *
 * @param text
 * @param options
 * @param cb
 * @return {BrowserWindow}
 */
export function CreateQuestionWindow(
  text: string,
  options: ICreateWindowOptions,
  cb?: (result: number) => void,
) {
  if (options.id && options.showAgain && hasDialog(options.id)) {
    winston.info(`Don't show dialog '${options.id}'. It's disabled`);

    return null;
  }

  // Create the browser window.
  const window = CreateWindow({
    ...windowSizes.small,
    app: 'message',
    title: options.title || intl('question'),
    modal: !!options.parent,
    parent: options.parent,
    dock: options.parent ? false : options.dock,
    params: {
      type: 'question',
      text,
      result: 0,
      id: options.id,
      showAgain: options.showAgain,
      showAgainValue: false,
    },
  });

  // Emitted when the window is closed.
  window.on('closed', () => {
    onDialogClose(window);

    if (cb) {
      cb(window.params.result);
    }
  });

  return window;
}

/**
 *
 * @param text
 * @param options
 * @param cb
 * @return {BrowserWindow}
 */
export function CreateTokenWindow(
  text: string,
  options: ICreateWindowOptions,
  cb?: (result: number) => void,
) {
  if (options.id && options.showAgain && hasDialog(options.id)) {
    winston.info(`Don't show dialog '${options.id}'. It's disabled`);

    return null;
  }

  // Create the browser window.
  const window = CreateWindow({
    ...windowSizes.small,
    app: 'message',
    title: options.title || intl('question'),
    modal: !!options.parent,
    parent: options.parent,
    dock: options.parent ? false : options.dock,
    params: {
      type: 'token',
      text,
      result: 0,
      id: options.id,
      showAgain: options.showAgain,
      showAgainValue: false,
    },
  });

  // Emitted when the window is closed.
  window.on('closed', () => {
    onDialogClose(window);

    if (cb) {
      cb(window.params.result);
    }
  });

  return window;
}
