import { app, BrowserWindow, ipcMain } from 'electron'
import { forwardToRenderer, replayActionMain } from 'electron-redux'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { reducer, GET_APPS } from '../reducer'
import { getElectronApps, startDebugging } from './utils'

const store = createStore(reducer, applyMiddleware(thunk, forwardToRenderer))
replayActionMain(store)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', async () => {
  createWindow()

  const apps = await getElectronApps()
  store.dispatch({ type: GET_APPS, payload: apps })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on(
  'startDebugging',
  async (e: Electron.Event, payload: { id?: string; path?: string }) => {
    startDebugging(payload, store)
  },
)