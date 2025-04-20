const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const https = require('https'); // 👈 agregado para consultar bloqueo

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 318,
    height: 468,
    x: 0,
    y: 0,
    icon: path.join(__dirname, 'icon.png'),
    frame: true,
    resizable: false,
    transparent: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      icon: path.join(__dirname, 'icon.png'),
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  });

  mainWindow.on('blur', () => {
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    }, 1000);
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.restore();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 🔒 Función para verificar si la app está bloqueada remotamente
function checkIfBlocked(callback) {
  const url = "https://raw.githubusercontent.com/ErikSanzana/calcuralorarisk/refs/heads/main/status.json?token=GHSAT0AAAAAADCKVCKW3VGSESGKBS4337HU2AE3A6Q"; // 👈 URL corregida

  https.get(url, res => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        if (json.blocked === true) {
          dialog.showErrorBox("Aplicación bloqueada", json.message || "Esta aplicación ha sido deshabilitada por el administrador.");
          app.quit();
        } else {
          callback(); // si no está bloqueada, ejecuta la app
        }
      } catch (err) {
        console.error("Error al analizar el estado remoto:", err);
        callback(); // ante error, continúa
      }
    });
  }).on("error", err => {
    console.error("No se pudo verificar el estado remoto:", err);
    callback(); // si hay error de red, continúa también
  });
}

app.whenReady().then(() => {
  // 👇 Verificamos si la app está bloqueada antes de crear la ventana
  checkIfBlocked(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    const template = [
      // tu menú aquí si lo tienes
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
