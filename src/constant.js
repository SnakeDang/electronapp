require("dotenv").config();
const CONFIG_MQTT = {
  TOPIC_LED: process.env.TOPIC_LED,
  TOPIC_STOP: process.env.TOPIC_STOP,
  URL_MQTT: process.env.URL_MQTT,
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASS: process.env.MQTT_PASS,
  TOPIC_CHECK: process.env.TOPIC_CHECK,
  TOPIC_LED_PHOTO: process.env.TOPIC_LED_PHOTO,
};

const CONFIG_BOT = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  API_DESCRIPTION_BOT: process.env.API_DESCRIPTION_BOT,
};
const CONFIG_APP = {
  DISPLAY_SCREEN:
    +process.env.DISPLAY_SCREEN < 1 ? 0 : +process.env.DISPLAY_SCREEN - 1,
  NUMBER_LOOP_VIDEO: +process.env.NUMBER_LOOP_VIDEO,
  VIDEO_DEFAULT: process.env.VIDEO_DEFAULT,
  API_URL: process.env.API_URL,
};
const CONFIG_FILE = {
  FILE_PATH: process.env.FILE_PATH,
  FILE_PATH_DEFAULT: process.env.FILE_PATH_DEFAULT,
};

const CONFIG_SQL_SERVER = {
  user: process.env.SQL_USER || "sa",
  password: process.env.SQL_PASS || "thaco@1234",
  server: process.env.SQL_SERVER || "localhost",
  database: process.env.SQL_DATABASE || "RobotTiar01_v3",
  options: {
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 5000,
  },
};

const CONFIG_PROCEDURE = {
  GET_LIST_VIDEO_FROM_MQTT:
    process.env.GET_LIST_VIDEO_FROM_MQTT || "PR_GET_VIDEO_FROM_MQTT",
};

class Singleton {
  static list = [];
}
module.exports = {
  CONFIG_MQTT,
  CONFIG_APP,
  CONFIG_BOT,
  CONFIG_FILE,
  CONFIG_SQL_SERVER,
  Singleton,
};
