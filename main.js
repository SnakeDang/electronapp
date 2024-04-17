const { app, BrowserWindow, globalShortcut } = require("electron");
const TelegramBot = require("node-telegram-bot-api");
const { publishMessage, connectFunc } = require("./src/connect-mqtt");
const fetchDataFromAPI = require("./src/get-description-bot");
const checkStringFormat = require("./src/check-string-format");
const logToFile = require("./src/writelog");
const checkPing = require("./src/ping-network");
require("dotenv").config();

const AREA_NAME = process.env.AREA_NAME,
  AREA_TOPIC = process.env.AREA_TOPIC,
  TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN,
  API_DESCRIPTION_BOT = process.env.API_DESCRIPTION_BOT,
  TOPIC_LED = process.env.TOPIC_LED;
let tempValue = "";
let reconnectTimeout = null;
let reconnectInterval = null;
let client = null;
let bot = null;

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

  connectFunc(
    client,
    tempValue,
    reconnectTimeout,
    reconnectInterval,
    BrowserWindow
  );

  // Lắng nghe sự kiện nhắn tin với bot
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  bot.on("message", handleMessage);
}

function handleMessage(msg) {
  const chatId = msg.chat.id;
  const messageText = msg.text.trim();
  const nameBot = messageText.split(":::")[0];
  if (nameBot === `[${AREA_NAME}] - [${AREA_TOPIC}]`) {
    const checkMessage = checkStringFormat(messageText);

    if (checkMessage) {
      const value = messageText.split(":::")[1];

      switch (value) {
        case "restart":
          connectFunc(
            client,
            tempValue,
            reconnectTimeout,
            reconnectInterval,
            BrowserWindow
          );

          break;
        default:
          if (value.includes("sendMQTT=")) {
            const valueMQTT = value.split("sendMQTT=")[1];
            publishMessage(client, TOPIC_LED, valueMQTT)
              .then(() => {
                bot.sendMessage(
                  chatId,
                  `Bạn vừa gửi xuống mqqt ${AREA_NAME} tại topic ${TOPIC_LED} thành công với giá trị: ${valueMQTT}`
                );
              })
              .catch(() => {
                bot.sendMessage(
                  chatId,
                  `Bạn vừa gửi xuống mqqt ${AREA_NAME} tại topic ${TOPIC_LED} thất bại với giá trị: ${valueMQTT}`
                );
              });
          } else {
            bot.sendMessage(
              chatId,
              `Bạn giá trị bạn vừa gửi chưa có trong kịch bản thực hiện: ${messageText}`
            );
          }
          break;
      }
    } else {
      let description = "description";
      fetchDataFromAPI(API_DESCRIPTION_BOT).then((data) => {
        if (data) {
          description = data;
          bot.sendMessage(chatId, description).catch((error) => {
            logToFile(
              `Gửi log thất bại mô tả từ [${AREA_NAME}] - [${AREA_TOPIC}]`
            );
          });
        } else {
          description = "Thất bại trong việc lấy mô tả từ api";
          bot.sendMessage(chatId, description).catch((error) => {
            logToFile(
              `Gửi log thất bại mô tả từ [${AREA_NAME}] - [${AREA_TOPIC}]`
            );
          });
        }
      });
    }
  }
}

app.whenReady().then(createWindow);

// Xử lý sự kiện khi có lỗi
process.on("uncaughtException", (error) => {
  logToFile('app bị lỗi' + error);
  // Thêm mã để bỏ qua lỗi nếu cần thiết
});
