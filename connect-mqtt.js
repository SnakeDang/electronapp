const logToFile = require("./writelog");
const uuidv4 = require("uuid");
const {logErrorToTelegram} = require("./bot-telegram")
function connectFunc(mqtt, client, configMqtt, tempValue, reconnectTimeout,reconnectInterval,BrowserWindow) {
  
  if (!client || !client.connected) {
    clearInterval(reconnectInterval);
    logToFile("Attempting to connect...");
    logErrorToTelegram("Attempting to connect")
    client = mqtt.connect(configMqtt.URL_MQTT, {
      clientId: uuidv4.v4(),
      username: configMqtt.MQTT_USERNAME,
      password: configMqtt.MQTT_PASS,
    });

    client.on("connect", function () {
      logToFile("Reconnected to MQTT broker");
      logErrorToTelegram("Reconnected to MQTT broker")
      client.subscribe(configMqtt.TOPIC_LED);
    });

    client.on("message", function (topic, message) {
      if (topic === configMqtt.TOPIC_LED) {
        let win;
        if (BrowserWindow.getAllWindows().length > 1) {
          win = BrowserWindow.getAllWindows()[configMqtt.DISPLAY_SCREEN];
        } else {
          win = BrowserWindow.getAllWindows()[0];
        }

        if (win && !win.isDestroyed()) {
          const messageValue = message ? message.toString() : "";
          if (tempValue != messageValue) {
            win.webContents.executeJavaScript(
              `updateVideoUrl('${messageValue}')`
            );
            tempValue = messageValue;
          }
        }
      }
    });

    client.on("error", function (error) {
      logToFile(`MQTT error: ${error}`);
      logErrorToTelegram("Reconnected to MQTT broker")
    });

    client.on("close", function () {
      logToFile("Connection to MQTT broker closed");
      logErrorToTelegram("Connection to MQTT broker closed")
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(connectFunc, 5000); // Retry after 5 seconds
    });
    reconnectInterval = setInterval(() => {
      try {
        client.publish(configMqtt.TOPIC_CHECK, "check", function (err) {
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

function publishMessage(client,TOPIC_LED,message)
{
  try {
    client.publish(TOPIC_LED,message, function (err) {
      if (err) {
        throw err
      } else {
       return true
      }
    });
  } catch (error) {
    throw error
  }
}
module.exports = {publishMessage,connectFunc};
