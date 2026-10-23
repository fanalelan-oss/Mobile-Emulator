const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  fit: (o) => ipcRenderer.invoke('fit', o),
  pin: (v) => ipcRenderer.send('pin', v),
  min: () => ipcRenderer.send('min'),
  close: () => ipcRenderer.send('close'),
  ext: (u) => ipcRenderer.send('ext', u),
  capture: (rect) => ipcRenderer.invoke('capture', rect)
});
