const  electron  = require('electron')
const {app, globalShortcut, ipcMain, Menu} = electron
const BrowserWindow = electron.BrowserWindow
const appMenu = require('./menu')
const path = require('path')
const url = require('url')
let mainWindow

function createWindow () {
  Menu.setApplicationMenu(appMenu);
  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: 1080,
      height: 660,
      minWidth: 660,
      minHeight: 660,
      webPreferences: {
          preload: path.join(__dirname, 'browser.js'),
          nodeIntegration: false,
          plugins: true
      },
      titleBarStyle: 'hidden',
      // titleBarStyle: 'hiddenInset',
      // titleBarStyle: 'customButtonsOnHover',
      // transparent: true,
      frame: true,
      icon: path.join(__dirname, 'build/icon.icns')
  })

  mainWindow.loadURL('https://douban.fm');

    mainWindow.webContents.on('did-finish-load', ()=>{
        let isFocus = mainWindow.isVisible(),
            json = JSON.stringify({isFocus: isFocus}),
            operateObj = {
                'CommandOrControl+0': 'window.PubSub.publish("next")',
                'CommandOrControl+9': 'window.PubSub.publish("prev")',
                'CommandOrControl+7': `window.PubSub.publish("toggleLike",${json})`,
                'CommandOrControl+8': 'window.PubSub.publish("togglePlay")',
            }

        let shortcut = (key, code) => {
            globalShortcut.register(key, () => {
                mainWindow.webContents.executeJavaScript(code);
            })
        }
        for(let k in operateObj){
            if(operateObj.hasOwnProperty(k)){
                shortcut(k, operateObj[k])
            }
        }

        ipcMain.on('urlchange', function(event){
            event.sender.send('url', {
                canGoback: mainWindow.webContents.canGoBack()
            });

        })
        ipcMain.on('goback', function(event){
            if(mainWindow.webContents.canGoBack()) mainWindow.webContents.goBack();
        })


    });
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
      app.quit()
  }
})

app.on('activate', function () {
    mainWindow.show()
})
