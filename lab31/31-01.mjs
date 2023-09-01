import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

const bot = new Telegraf("6531139546:AAFCJSGhG6qJyOMLRo8Xj62Uop8Z0jsWiiY");

bot.on(message("text"), (ctx) => ctx.reply(`echo: ${ctx.message.text}`));

bot.launch();