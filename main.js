const { app, BrowserWindow, ipcMain, screen, shell, clipboard, session } = require('electron');

app.commandLine.appendSwitch('enable-features', 'OverlayScrollbar');
app.commandLine.appendSwitch('touch-events', 'enabled');
app.commandLine.appendSwitch('use-fake-device-for-media-stream');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream');

let win;
app.whenReady().then(() => {
  // Auto-grant mobile web permissions (Camera, Mic, Geolocation, Notifications, Clipboard)
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(true);
  });
  session.defaultSession.setPermissionCheckHandler(() => true);

  win = new BrowserWindow({
    width: 480, height: 900,
    frame: false, transparent: true, resizable: false,
    hasShadow: false, alwaysOnTop: true, skipTaskbar: false,
    title: 'محاكي الجوال',
    webPreferences: { preload: __dirname + '/preload.js', webviewTag: true }
  });
  win.loadFile('index.html');
});

// renderer asks for a window size; we return scale that fits the screen
ipcMain.handle('fit', (_e, { w, h, extraW, extraH }) => {
  const wa = screen.getDisplayMatching(win.getBounds()).workArea;
  const scale = Math.min(1, (wa.height - 30) / h, (wa.width - extraW - 30) / w);
  const W = Math.round(w * scale + extraW), H = Math.round(h * scale + extraH);
  const b = win.getBounds();
  win.setResizable(true);
  win.setBounds({
    x: Math.min(Math.max(b.x, wa.x), wa.x + wa.width - W),
    y: Math.min(Math.max(b.y, wa.y), wa.y + wa.height - H),
    width: W, height: H
  });
  win.setResizable(false);
  return scale;
});

// Native ultra-fast screen capture directly to clipboard
ipcMain.handle('capture', async (_e, rect) => {
  if (!win) return false;
  try {
    const img = await win.capturePage(rect);
    clipboard.writeImage(img);
    return true;
  } catch (err) {
    console.error('Capture error:', err);
    return false;
  }
});

ipcMain.on('pin', (_e, v) => win.setAlwaysOnTop(v));
ipcMain.on('min', () => win.minimize());
ipcMain.on('close', () => app.quit());
ipcMain.on('ext', (_e, u) => shell.openExternal(u));
app.on('window-all-closed', () => app.quit());
