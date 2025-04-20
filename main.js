const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 318,
    height: 468,
    x: 0,
    y: 0,
    icon: path.join(__dirname, 'icon.png'),
    frame: true, // Mantiene el marco visible
    resizable: false, // No permite redimensionar la ventana
    transparent: false, // Evita problemas con la captura de pantalla
    skipTaskbar: true, // No muestra la ventana en la barra de tareas
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      icon: path.join(__dirname, 'icon.png'),
    }
  });

  mainWindow.loadFile('index.html');

  // Esperar hasta que la ventana esté lista para mostrar
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true, 'screen-saver'); // Mantiene la ventana encima sin interferencias
  });

  // Si la ventana pierde el foco, la vuelve a traer al frente después de un segundo
  mainWindow.on('blur', () => {
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    }, 1000);
  });

  // Si la ventana se minimiza, la restaura automáticamente
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.restore();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Definir el menú (sin cambios)
  const template = [
    // ... tu menú aquí
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});