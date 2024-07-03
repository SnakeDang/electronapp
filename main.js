const { app, BrowserWindow, globalShortcut, screen } = require("electron");
const TelegramBot = require("node-telegram-bot-api");
const { publishMessage, connectFunc } = require("./src/connect-mqtt");

const logToFile = require("./src/writelog");
const getValuesUrlVideo = require("./src/read-file");
const {
  CONFIG_APP: { DISPLAY_SCREEN, NUMBER_LOOP_VIDEO, VIDEO_DEFAULT },
  CONFIG_FILE: { FILE_PATH, FILE_PATH_DEFAULT },
  Singleton
} = require("./src/constant");

const { getListVideoFromMqtt } = require("./src/connect-sql-server");
let tempValue = "";
let reconnectTimeout = null;
let reconnectInterval = null;
let client = null;

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
    fullscreen: false,
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
  Singleton.list = data
  if (win && !win.isDestroyed()) {
    const jsonData = JSON.stringify(data);
    win.webContents.executeJavaScript(
      `callValueJsonFile(${jsonData})`
    );
  }

  connectFunc(
    client,
    tempValue,
    reconnectTimeout,
    reconnectInterval,
    win
  );

  // // Lắng nghe sự kiện nhắn tin với bot
  // bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  // bot.on("message", handleMessage);
}

app.whenReady().then(createWindow);
getListVideoFromMqtt(1).then((data) => {
  console.log(data);
});
// Xử lý sự kiện khi có lỗi
process.on("uncaughtException", (error) => {
  logToFile("app bị lỗi" + error);
  // Thêm mã để bỏ qua lỗi nếu cần thiết
});
