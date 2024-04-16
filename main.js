const { app, BrowserWindow, globalShortcut } = require("electron");

const mqtt = require("mqtt");
const logToFile = require("./writelog");
const reconnectFunc = require("./connect-mqtt");
require("dotenv").config();

const TOPIC_LED = process.env.TOPIC_LED,
  URL_MQTT = process.env.URL_MQTT,
  MQTT_USERNAME = process.env.MQTT_USERNAME,
  MQTT_PASS = process.env.MQTT_PASS,
  TOPIC_CHECK = process.env.TOPIC_CHECK,
  DISPLAY_SCREEN = +process.env.DISPLAY_SCREEN;

let tempValue = "";
let client = null;
let reconnectTimeout = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");

  app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
  });

  globalShortcut.register("CommandOrControl+Q", () => {
    app.quit();
  });

  reconnectFunc(
    mqtt,
    client,
    { TOPIC_LED, URL_MQTT, MQTT_USERNAME, MQTT_PASS, DISPLAY_SCREEN },
    tempValue,
    reconnectTimeout
  );
}

app.whenReady().then(createWindow);
