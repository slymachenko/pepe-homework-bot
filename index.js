const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

console.log("Bot have been started...");

// COMMAND LISTENERS

bot.on("polling_error", (err) => console.log(err));

// Sending an empty HTTP response on request
require("http")
  .createServer()
  .listen(process.env.PORT || 5000)
  .on("request", function (req, res) {
    res.end("");
  });
