const { app, BrowserWindow, globalShortcut, screen } = require("electron");
const TelegramBot = require("node-telegram-bot-api");
const { publishMessage, connectFunc } = require("./src/connect-mqtt");
const fetchDataFromAPI = require("./src/get-description-bot");
const checkStringFormat = require("./src/check-string-format");
const logToFile = require("./src/writelog");
const checkPing = require("./src/ping-network");
const getValuesUrlVideo = require("./src/read-file");
require("dotenv").config();

const AREA_NAME = process.env.AREA_NAME,
  AREA_TOPIC = process.env.AREA_TOPIC,
  TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN,
  API_DESCRIPTION_BOT = process.env.API_DESCRIPTION_BOT,
  TOPIC_LED = process.env.TOPIC_LED,
  FILE_PATH = process.env.FILE_PATH,
  FILE_PATH_DEFAULT = process.env.FILE_PATH_DEFAULT,
  VIDEO_DEFAULT = process.env.VIDEO_DEFAULT,
  NUMBER_LOOP_VIDEO = process.env.NUMBER_LOOP_VIDEO,
  DISPLAY_SCREEN =
    +process.env.DISPLAY_SCREEN < 1 ? 0 : +process.env.DISPLAY_SCREEN - 1;
let tempValue = "";
let reconnectTimeout = null;
let reconnectInterval = null;
let client = null;
let bot = null;

function createWindow() {
  const displays = screen.getAllDisplays();
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    x: displays[DISPLAY_SCREEN]?.bounds?.x, // Set the x-coordinate for the second screen
    y: displays[DISPLAY_SCREEN]?.bounds?.y,
    fullscreen: true,
    frame: true,
    movable: true,
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
  const listUrlVideoConfig = getValuesUrlVideo(FILE_PATH);
  const data = getValuesUrlVideo(FILE_PATH_DEFAULT);

  if (win && !win.isDestroyed()) {
    const jsonData = JSON.stringify(data);
    win.webContents.executeJavaScript(
      `callValueJsonFile(${jsonData},${NUMBER_LOOP_VIDEO})`
    );
  }

  connectFunc(
    client,
    tempValue,
    reconnectTimeout,
    reconnectInterval,
    BrowserWindow,
    listUrlVideoConfig
  );

  // // Lắng nghe sự kiện nhắn tin với bot
  // bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  // bot.on("message", handleMessage);
}

app.whenReady().then(createWindow);

// Xử lý sự kiện khi có lỗi
process.on("uncaughtException", (error) => {
  logToFile("app bị lỗi" + error);
  // Thêm mã để bỏ qua lỗi nếu cần thiết
});
