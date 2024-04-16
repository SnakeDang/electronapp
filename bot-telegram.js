const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config();
// Thông tin cấu hình bot Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const AREA_NAME = process.env.AREA_NAME 
// const BOT_COLOR = process.env.BOT_COLOR 
// Tạo một instance của bot Telegram
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Phản hồi lại tin nhắn
    bot.sendMessage(chatId, `Bạn vừa nói: ${messageText}`);
});
// Hàm ghi log lỗi vào Telegram
function logErrorToTelegram(errorMsg) {
    // Tạo nội dung tin nhắn
        const message = `<b>[${AREA_NAME}]</b>\n<code>${errorMsg}</code>`;

        // Gửi tin nhắn đến chat ID đã cấu hình
        bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: 'HTML' } )
            .then(() => {
                console.log('Đã gửi log lỗi thành công vào Telegram');
            })
            .catch((error) => {
                console.error('Gửi log lỗi vào Telegram thất bại:', error);
            });

   
}


module.exports = {logErrorToTelegram}