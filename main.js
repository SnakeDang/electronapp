const { app, BrowserWindow, globalShortcut } = require('electron');
const uuidv4 = require('uuid');
const mqtt = require('mqtt');
require('dotenv').config()

const TOPIC_LED = process.env.TOPIC_LED,
URL_MQTT = process.env.URL_MQTT,
MQTT_USERNAME = process.env.MQTT_USERNAME,
MQTT_PASS = process.env.MQTT_PASS,
TOPIC_CHECK = process.env.TOPIC_CHECK,
DISPLAY_SCREEN = +process.env.DISPLAY_SCREEN;

let tempValue = '';

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    autoHideMenuBar: true, // Hide the menu bar
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');

  const id = uuidv4.v4();
  const options = {
    clientId: id, // Set your client ID
    username: MQTT_USERNAME, // Set your username
    password: MQTT_PASS  // Set your password
  };

  const client = mqtt.connect(URL_MQTT, options); // Change this to your MQTT broker address

  client.on('connect', function () {
    console.log('Connected to MQTT broker');
    client.subscribe(TOPIC_LED); // Subscribe to the topic where the video URL will be published
  });

  client.on('message', function (topic, message) {
    if (topic === TOPIC_LED) {
     
      let win; 
      if(BrowserWindow.getAllWindows() >1)
      {
        win = BrowserWindow.getAllWindows()[DISPLAY_SCREEN];
      }else{
        win = BrowserWindow.getAllWindows()[0];
      }

      if (win && !win.isDestroyed()) {
        const messageValue = message ? message.toString() : ''
        if (tempValue != messageValue)
        {
            win.webContents.executeJavaScript(`updateVideoUrl('${messageValue}')`);
            tempValue = messageValue;
        }
      }
    }
  });

  // Register a global shortcut to quit the app when Ctrl+Q is pressed
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });

  function sendCheckValue() {
    if (!client || client.connected === false) {
      console.log('Client not connected, reconnecting...');
      client.reconnect(); // Reconnect if client is not connected
      client.subscribe(TOPIC_LED); 

      client.on('message', function (topic, message) {
        if (topic === TOPIC_LED) {
         
          let win; 
          if(BrowserWindow.getAllWindows() >1)
          {
            win = BrowserWindow.getAllWindows()[DISPLAY_SCREEN];
          }else{
            win = BrowserWindow.getAllWindows()[0];
          }
    
          if (win && !win.isDestroyed()) {
            const messageValue = message ? message.toString() : ''
            if (tempValue != messageValue)
            {
                win.webContents.executeJavaScript(`updateVideoUrl('${messageValue}')`);
                tempValue = messageValue;
            }
          }
        }
      });
    }

    client.publish(TOPIC_CHECK, 'check', function (err) {
      if (err) {
        console.error('Error publishing message: ', err);
      } else {
        console.log('Message published successfully');
      }
    });
  }

  // Gửi giá trị "check" vào topic sau mỗi giây
  setInterval(sendCheckValue, 1000);
}
try {
  app.whenReady().then(createWindow);

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('will-quit', () => {
    // Unregister all shortcuts before quitting
    globalShortcut.unregisterAll();
});

  
} catch (error) {
  
}
