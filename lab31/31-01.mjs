import TelegramBot from "node-telegram-bot-api";
const token = "6531139546:AAFCJSGhG6qJyOMLRo8Xj62Uop8Z0jsWiiY";

const bot = new TelegramBot(token, {polling: true});
bot.on("message", (msg) => {
    bot.sendMessage(msg.chat.id, `echo: ${msg.text}`);
});

