import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,

  closePopup: () => {
    ipcRenderer.send('close-popup')
  },

  onUpdateSelectedText: (callback: (text: string) => void) => {
    ipcRenderer.on('update-selected-text', (_event, text) => callback(text))
  },

  openExternalAuth: (url: string) => {
    ipcRenderer.send('open-external-auth', url)
  },
})
