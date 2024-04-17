const fs = require('fs');
const path = require('path');
const moment = require('moment');

function logToFile(message) {
    const dateTime = moment().format('HH:mm:ss DD/MM/YYYY');
    const logMessage = `${dateTime} - ${message}\n`;
    const logFilePath = path.join(__dirname, '..', 'logs', 'log.txt');
    
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

module.exports = logToFile;
