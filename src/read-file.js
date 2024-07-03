const fs = require("fs");
const logToFile = require("./writelog");
const {CONFIG_APP:{NUMBER_LOOP_VIDEO}} = require('./constant')
function getValuesUrlVideo(filePath) {
  let outputValues = [];
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    // Parsing the JSON data
    outputValues = JSON.parse(jsonData);
    outputValues?.forEach(element => {
      element.repeat = NUMBER_LOOP_VIDEO
    });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    logToFile(`Gửi đọc file thất bại [lỗi] - [${error}]`);
  }

  return outputValues;
}

module.exports = getValuesUrlVideo;
