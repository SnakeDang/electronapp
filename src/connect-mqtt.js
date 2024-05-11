const logToFile = require("./writelog");
const uuidv4 = require("uuid");
const mqtt = require("mqtt");
const { logErrorToTelegram } = require("./bot-telegram");
const getUrlVideoByValueMQTT = require("./get-url-by-value");
require("dotenv").config();
const TOPIC_LED = process.env.TOPIC_LED,
  URL_MQTT = process.env.URL_MQTT,
  MQTT_USERNAME = process.env.MQTT_USERNAME,
  MQTT_PASS = process.env.MQTT_PASS,
  TOPIC_CHECK = process.env.TOPIC_CHECK,
  DISPLAY_SCREEN = +process.env.DISPLAY_SCREEN;

TEMP_ARR_LOG_ERROR = [];
function connectFunc(
  client,
  tempValue,
  reconnectTimeout,
  reconnectInterval,
  BrowserWindow,
  listUrlVideoConfig
) {
  if (!client?.connected) {
    client = mqtt.connect(URL_MQTT, {
      clientId: uuidv4.v4(),
      username: MQTT_USERNAME,
      password: MQTT_PASS,
    });
  }
  if (!client || !client.connected) {
    clearInterval(reconnectInterval);
    TEMP_ARR_LOG_ERROR.length = 0;
    logToFile("Attempting to connect...");

    // logErrorToTelegram("Attempting to connect");

    client.on("connect", function () {
      logToFile("Reconnected to MQTT broker");

      // logErrorToTelegram("Reconnected to MQTT broker");

      client.subscribe(TOPIC_LED);
    });

    client.on("message", function (topic, message) {
      if (topic === TOPIC_LED) {
        let win;
        if (BrowserWindow.getAllWindows().length > 1) {
          win = BrowserWindow.getAllWindows()[DISPLAY_SCREEN];
        } else {
          win = BrowserWindow.getAllWindows()[0];
        }

        if (win && !win.isDestroyed()) {
          const _value = message ? message.toString() : "";

          const messageValue = getUrlVideoByValueMQTT(
            _value,
            listUrlVideoConfig
          );

          if (tempValue != _value) {
            win.webContents.executeJavaScript(
              `updateVideoUrl('${messageValue}')`
            );
            tempValue = _value;
          }
        }
      }
    });

    client.on("error", function (error) {
      const errorMessage = `MQTT error: ${error}`;
      if (!TEMP_ARR_LOG_ERROR.includes(errorMessage)) {
        TEMP_ARR_LOG_ERROR.push(errorMessage);
        logToFile(`MQTT error: ${error}`);
      }

      // logErrorToTelegram("Reconnected to MQTT broker when error" + error);
    });

    client.on("close", function () {
      const errorMessage = "Connection to MQTT broker closed";
      if (!TEMP_ARR_LOG_ERROR.includes(errorMessage)) {
        TEMP_ARR_LOG_ERROR.push(errorMessage);
        logToFile(errorMessage);
      }

      // logErrorToTelegram("Connection to MQTT broker closed");
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(connectFunc, 5000); // Retry after 5 seconds
    });
    reconnectInterval = setInterval(() => {
      try {
        client.publish(TOPIC_CHECK, "check", function (err) {
          if (err) {
            console.log("Error publishing message: " + err);
          } else {
            console.log("Message published successfully");
          }
        });
      } catch (error) {
        logToFile(
          "Error occurred while attempting to publish message: " + error
        );
      }
    }, 1000);
  }
}

function publishMessage(client, TOPIC_LED, message) {
  try {
    if (!client?.connected) {
      client = mqtt.connect(URL_MQTT, {
        clientId: uuidv4.v4(),
        username: MQTT_USERNAME,
        password: MQTT_PASS,
      });
    }
    client.publish(TOPIC_LED, message, function (err) {
      if (err) {
        throw err;
      } else {
        return true;
      }
    });
  } catch (error) {
    throw error;
  }
}
module.exports = { publishMessage, connectFunc };
