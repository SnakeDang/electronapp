const fs = require('fs');
const moment = require('moment');
function logToFile(message) {
    const dateTime = moment().format('HH:mm:ss DD/MM/YYYY');
    const logMessage = `${dateTime} - ${message}\n`;
    fs.appendFile('log.txt', logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

module.exports = logToFile;
