import {
  app,
  BrowserWindow,
  globalShortcut,
  clipboard,
  ipcMain,
  shell,
  systemPreferences,
  dialog,
  Tray,
  Menu,
  nativeImage,
} from 'electron';
import path from 'path';
import { exec, spawn, ChildProcess } from 'child_process';

app.setName('Turn-Over');

const isDev = !app.isPackaged;
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

let mainWindow: BrowserWindow | null = null;
let popupWindow: BrowserWindow | null = null;
let nextProcess: ChildProcess | null = null;
let tray: Tray | null = null;
let isQuitting = false;
// Holds the http://localhost:3000/auth/callback?code=... URL to navigate to
// once the main window is ready (used when the app was closed during OAuth).
let pendingAuthUrl: string | null = null;

// Register turnover:// as a custom URL scheme so the OS can route deep links
// back into the app after the user authenticates in the external browser.
// In dev mode Electron is launched via its own binary, so the entry script
// path must be passed explicitly for the registration to work.
if (isDev && process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('turnover', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('turnover');
}

// After external-browser OAuth the OS will redirect to turnover://auth?code=…
// Extract the code and load the Next.js callback URL in the main window so the
// PKCE verifier that was stored in Electron's session completes the exchange.
function handleAuthDeepLink(url: string) {
  if (!url.startsWith('turnover://auth')) return;
  try {
    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    if (!code) return;

    const callbackUrl = `${BASE_URL}/auth/callback?${parsed.searchParams.toString()}`;

    if (mainWindow) {
      if (process.platform === 'darwin') app.dock?.show();
      mainWindow.show();
      mainWindow.focus();
      mainWindow.loadURL(callbackUrl);
    } else {
      pendingAuthUrl = callbackUrl;
      showMainWindow();
    }
  } catch (e) {
    console.error('handleAuthDeepLink error:', e);
  }
}

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

app.on('second-instance', (_event, commandLine) => {
  // On Windows/Linux the deep-link URL is passed as a CLI argument.
  const url = commandLine.find((arg) => arg.startsWith('turnover://'));
  if (url) handleAuthDeepLink(url);

  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    app.dock?.show();
  }
});

// On macOS the OS fires this event when the app is opened via the custom scheme.
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleAuthDeepLink(url);
});

// Production: Start the Next.js standalone server
function startNextServer(): Promise<void> {
  return new Promise((resolve) => {
    if (isDev) {
      resolve();
      return;
    }

    const serverPath = path.join(process.resourcesPath, 'app', 'server.js');

    nextProcess = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        PORT: String(PORT),
        NODE_ENV: 'production',
        HOSTNAME: '127.0.0.1',
      },
    });

    nextProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log('[Next.js]', output);
      if (
        output.includes('Ready') ||
        output.includes('started server') ||
        output.includes('Listening')
      ) {
        resolve();
      }
    });

    nextProcess.stderr?.on('data', (data: Buffer) => {
      console.error('[Next.js Error]', data.toString());
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
      resolve();
    });

    setTimeout(resolve, 5000);
  });
}

function getIconPath() {
  return isDev
    ? path.join(__dirname, '..', 'electron', 'tray-icon.png')
    : path.join(process.resourcesPath, 'tray-icon.png');
}

function getDockIconPath() {
  return isDev
    ? path.join(__dirname, '..', 'electron', 'dock-icon.png')
    : path.join(process.resourcesPath, 'dock-icon.png');
}

function createTray() {
  const iconPath = getIconPath();

  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    icon = nativeImage.createEmpty();
  }
  const trayIcon = icon.resize({ width: 16, height: 16 });
  trayIcon.setTemplateImage(true);

  tray = new Tray(trayIcon);
  tray.setToolTip('Turn-Over');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Turn-Over',
      click: () => showMainWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit Turn-Over',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

async function showMainWindow() {
  if (process.platform === 'darwin') {
    const dockIcon = nativeImage.createFromPath(getDockIconPath());
    if (!dockIcon.isEmpty()) {
      app.dock?.setIcon(dockIcon);
    }
    await app.dock?.show();
  }
  if (!mainWindow) {
    createMainWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Turn-Over',
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:main',
    },
  });

  mainWindow.loadURL(BASE_URL);

  // If a deep-link arrived before the window was created, navigate to the auth
  // callback URL as soon as the initial page finishes loading.
  mainWindow.webContents.once('did-finish-load', () => {
    if (pendingAuthUrl) {
      mainWindow?.loadURL(pendingAuthUrl);
      pendingAuthUrl = null;
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(BASE_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Hide to tray instead of closing (unless the app is quitting)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      app.dock?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Check macOS accessibility permission and prompt the user if not granted
function checkAccessibilityPermission(): boolean {
  if (process.platform !== 'darwin') return true;

  const trusted = systemPreferences.isTrustedAccessibilityClient(false);
  if (!trusted) {
    dialog
      .showMessageBox({
        type: 'warning',
        title: '접근성 권한 필요',
        message:
          '선택한 텍스트를 자동으로 가져오려면 접근성 권한이 필요합니다.',
        detail:
          '시스템 설정 → 개인 정보 보호 및 보안 → 손쉬운 사용에서 Turn-Over(또는 Electron)를 허용하고 앱을 재시작해주세요.\n\n권한 없이도 팝업을 열 수 있지만, 텍스트를 직접 입력해야 합니다.',
        buttons: ['시스템 설정 열기', '나중에'],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0) {
          systemPreferences.isTrustedAccessibilityClient(true);
        }
      });
  }
  return trusted;
}

async function getSelectedText(): Promise<string> {
  if (process.platform === 'darwin') {
    const trusted = systemPreferences.isTrustedAccessibilityClient(false);
    if (!trusted) {
      checkAccessibilityPermission();
      return '';
    }

    return new Promise((resolve) => {
      exec(
        `osascript` +
        ` -e 'try'` +
        ` -e '  tell application "System Events"'` +
        ` -e '    set frontProc to first application process whose frontmost is true'` +
        ` -e '    set focusedEl to value of attribute "AXFocusedUIElement" of frontProc'` +
        ` -e '    return value of attribute "AXSelectedText" of focusedEl'` +
        ` -e '  end tell'` +
        ` -e 'on error'` +
        ` -e '  return ""'` +
        ` -e 'end try'`,
        (err, stdout) => {
          if (err) {
            console.error('osascript AX error:', err.message);
            resolve('');
            return;
          }
          resolve(stdout.trim());
        },
      );
    });
  }

  if (process.platform === 'win32') {
    const prev = clipboard.readText();
    return new Promise((resolve) => {
      exec(
        `powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^c')"`,
        async (err) => {
          if (err) {
            console.error('PowerShell error:', err.message);
            resolve('');
            return;
          }
          const startTime = Date.now();
          const interval = setInterval(() => {
            const current = clipboard.readText();
            if (current !== prev) {
              clearInterval(interval);
              clipboard.writeText(prev);
              resolve(current);
            } else if (Date.now() - startTime >= 1000) {
              clearInterval(interval);
              resolve('');
            }
          }, 30);
        },
      );
    });
  }

  return '';
}

function createPopupWindow(selectedText: string) {
  if (popupWindow) {
    popupWindow.focus();
    popupWindow.webContents.send('update-selected-text', selectedText);
    return;
  }

  popupWindow = new BrowserWindow({
    width: 480,
    height: 520,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:main',
    },
  });

  const url = `${BASE_URL}/popup?text=${encodeURIComponent(selectedText)}`;
  popupWindow.loadURL(url);

  popupWindow.on('closed', () => {
    popupWindow = null;
  });
}

app.whenReady().then(async () => {
  // Auto-start at login (only in production builds)
  if (app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true, // Start silently in tray
    });
  }

  // Hide from dock on startup — the app lives in the menu bar
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  await startNextServer();
  createTray();

  const registered = globalShortcut.register(
    'Alt+Shift+A',
    async () => {
      const selectedText = await getSelectedText();
      createPopupWindow(selectedText);
    },
  );

  if (!registered) {
    console.warn(
      'Global shortcut Alt+Shift+A could not be registered.',
    );
  }

  app.on('activate', () => {
    // Clicking the dock icon (when visible) should show the window
    showMainWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (nextProcess) {
    nextProcess.kill();
  }
});

// Keep the app running even when all windows are closed (lives in tray)
app.on('window-all-closed', () => {
  // Do nothing — the app stays alive in the menu bar
});

ipcMain.on('close-popup', () => {
  popupWindow?.close();
});

// Open the Google OAuth URL in the system browser instead of inside Electron.
// This lets the OS handle passkeys, Touch ID, and other platform authenticators.
ipcMain.on('open-external-auth', (_event, url: string) => {
  shell.openExternal(url);
});
