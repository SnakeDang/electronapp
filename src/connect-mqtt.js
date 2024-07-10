const logToFile = require("./writelog");
const uuidv4 = require("uuid");
const mqtt = require("mqtt");
const { logErrorToTelegram } = require("./bot-telegram");
const getUrlVideoByValueMQTT = require("./get-url-by-value");
const {
  Singleton,
  CONFIG_MQTT: {
    MQTT_PASS,
    MQTT_USERNAME,
    TOPIC_CHECK,
    TOPIC_LED,
    URL_MQTT,
    TOPIC_STOP,
    TOPIC_LED_PHOTO,
  },
  CONFIG_APP: { API_URL },
} = require("./constant");
const { getListVideoFromMqtt } = require("./connect-sql-server");
require("dotenv").config();

TEMP_ARR_LOG_ERROR = [];
function connectFunc(
  client,
  tempValue,
  reconnectTimeout,
  reconnectInterval,
  win
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
      client.subscribe(TOPIC_STOP);
      client.subscribe(TOPIC_LED_PHOTO);
    });

    client.on("message", async function (topic, message) {
      // topic led
      switch (topic) {
        case TOPIC_LED:
          if (win && !win.isDestroyed()) {
            const _value = message ? message.toString() : "";
            try {
              const messageValue = await getListVideoFromMqtt(+_value);

              // if (tempValue != _value) {
              if (messageValue?.length > 0) {
                messageValue.forEach((element) => {
                  element.url = API_URL + element?.url;
                });

                win.webContents.executeJavaScript(
                  `callValueMqtt(${JSON.stringify(messageValue)})`
                );
              }
            } catch (error) {}
          }
          break;
        case TOPIC_STOP:
          if (win && !win.isDestroyed()) {
            const _value = message ? message.toString() : "";

            // if (tempValue != _value) {
            if (_value === "stop")
              win.webContents.executeJavaScript(
                `callValueJsonFile(${JSON.stringify(Singleton.list)},'${true}')`
              );
            tempValue = _value;
            // }
          }
          break;
        case TOPIC_LED_PHOTO:
          if (win && !win.isDestroyed()) {
            const _value = message ? message.toString() : "";
            try {
              const messageValue = await getListVideoFromMqtt(+_value);
              console.log(messageValue);
              // if (tempValue != _value) {
              if (messageValue?.length > 0) {
                messageValue.forEach((element) => {
                  element.url = API_URL + element?.url;
                });

                win.webContents.executeJavaScript(
                  `callValueMqttPhoto(${JSON.stringify(messageValue)})`
                );
              }
            } catch (error) {}
          }
        default:
          break;
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
