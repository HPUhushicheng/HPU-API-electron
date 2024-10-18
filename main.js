const { app, BrowserWindow, ipcMain } = require('electron')
const { getNewToken, getCourseSchedule } = require('./course.js') // 确保导出这些函数

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 监听渲染进程的请求
ipcMain.on('request-course-data', async (event) => {
  const rawPassword = '020812' // 原始密码
  const token = await getNewToken(rawPassword)

  if (token) {
    const courseData = await getCourseSchedule(token)
    event.reply('course-data-response', courseData)
  } else {
    event.reply('course-data-response', { error: '无法获取token' })
  }
})
