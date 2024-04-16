const { app, BrowserWindow, globalShortcut } = require("electron");
const TelegramBot = require('node-telegram-bot-api');
const mqtt = require("mqtt");
const {publishMessage,connectFunc} = require("./connect-mqtt");
require("dotenv").config();
const uuidv4 = require("uuid");

const TOPIC_LED = process.env.TOPIC_LED,
  URL_MQTT = process.env.URL_MQTT,
  MQTT_USERNAME = process.env.MQTT_USERNAME,
  MQTT_PASS = process.env.MQTT_PASS,
  TOPIC_CHECK = process.env.TOPIC_CHECK,
  DISPLAY_SCREEN = +process.env.DISPLAY_SCREEN;
  TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let tempValue = "";
let reconnectTimeout = null;
let reconnectInterval = null;

let client =  mqtt.connect(URL_MQTT, {
  clientId: uuidv4.v4(),
  username: MQTT_USERNAME,
  password: MQTT_PASS,
});

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

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
    mqtt,
    client,
    { TOPIC_LED, URL_MQTT, MQTT_USERNAME, MQTT_PASS, DISPLAY_SCREEN,TOPIC_CHECK },
    tempValue,
    reconnectTimeout,
    reconnectInterval,
    BrowserWindow
  );
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    if(messageText.includes('publish:::')){
      const value = messageText.split('publish:::')[1];
      const promiseCheck = new Promise((resolve,reject)=>{
        resolve(publishMessage(client,TOPIC_LED,value))
      })
      promiseCheck.then(()=>{
      
        bot.sendMessage(chatId, `Bạn vừa gửi xuống mqqt tại topic ${TOPIC_LED} thành công với giá trị: ${value}`);
    }).catch(()=>{
        bot.sendMessage(chatId, `Bạn vừa gửi xuống mqqt tại topic ${TOPIC_LED} thất bại với giá trị: ${value}`);
    })
    }
    else{
      // Phản hồi lại tin nhắn
      bot.sendMessage(chatId, `Bạn vừa nói: ${messageText}`);
    }
    
});
}

app.whenReady().then(createWindow);
