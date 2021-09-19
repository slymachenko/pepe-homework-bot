const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const getResponse = require("./controllers/messageController");
const classController = require("./controllers/classController");
const requestController = require("./controllers/requestController");

dotenv.config({ path: "./config.env" });

// connecting to the MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
  webHook: {
    port: process.env.PORT,
  },
});

bot.setWebHook(`${process.env.URL}/bot/${process.env.TOKEN}`);

console.log("Bot have been started...");

// COMMAND LISTENERS

bot.onText(/^\/start$/, (msg, [source]) => {
  const { id } = msg.chat;
  const userName = msg.from.first_name;

  const response = getResponse(source, { userName });

  bot.sendMessage(id, response);
});

bot.onText(/^\/help$/, (msg, [source]) => {
  const { id } = msg.chat;

  const response = getResponse(source);

  bot.sendMessage(id, response);
});

bot.onText(/^\/getid$/, (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;

  const response = getResponse(source, { userID });

  bot.sendMessage(id, response);
});

bot.onText(/^\/create/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  let response;

  const [source, className, ...text] = msg.text.split(" ");

  // checking is user is memeber of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (isUserinClass) {
    response = getResponse(source, { validErr: true });

    return bot.sendMessage(id, response, options);
  }

  // user message validation
  if (!className || text.length > 0) {
    response = getResponse(source, { err: true });

    return bot.sendMessage(id, response, options);
  }

  // creating document for class and homework
  await classController.createClass({
    name: className,
    users: [
      {
        userID,
        isAdmin: true,
        request: "",
      },
    ],
  });

  response = getResponse(source, { className });

  await bot.sendMessage(id, response, options);
});

bot.onText(/^\/delete$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      keyboard: [["Back", "Delete сlass"]],
      one_time_keyboard: true,
    },
  };
  let response;

  // checking is user is memeber of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true });
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // checking is user Admin
  const isUserAdmin = await classController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, { permission: false });
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // saving '/delete' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  response = getResponse(source, { confirm: true });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/leave$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  let response;

  // deleting user from the users array in Class document
  const classDoc = await classController.leaveClass(userID);

  const className = classDoc.name;
  response = getResponse(source, { className });

  if (!classDoc) response = getResponse(source, { validErr: true });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/class$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  let response;

  // retrieving class document from the db
  const classDoc = await classController.findClass(userID);

  // if there's no class with user in, send Error message
  if (!classDoc) {
    response = getResponse(source, { validErr: true });
    return bot.sendMessage(id, response, options);
  }

  const [className, usersNum] = [classDoc.name, classDoc.users.length];

  response = getResponse(source, { className, usersNum });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/invite$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  let response;

  // checking is user is memeber of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true });

    return bot.sendMessage(id, response, options);
  }

  // checking is user Admin
  const isUserAdmin = await classController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, { permission: false });

    return bot.sendMessage(id, response, options);
  }

  // saving '/invite' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  response = getResponse(source, { confirm: true });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/promote$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  let response;

  // checking user is memeber of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true });

    return bot.sendMessage(id, response[0], options);
  }

  // checking user Admin
  const isUserAdmin = await classController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, { permission: false });

    return bot.sendMessage(id, response, options);
  }

  // saving '/promote' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  response = getResponse(source, { confirm: true });

  bot.sendMessage(id, response, options);
});

bot.onText(/^Back$/, async (msg) => {
  await requestController.clearRequest(msg.from.id);
});

bot.onText(/^Delete сlass$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const source = "/delete";
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  // checking is user made a request
  const request = await requestController.checkRequest(userID);
  if (request !== "/delete") return;

  // deleting class document and clearing user request
  const classDoc = await classController.deleteClass(userID);
  await requestController.clearRequest(userID);

  const [className] = [classDoc.name];

  response = getResponse(source, { className });

  bot.sendMessage(id, response, options);
});

bot.onText(/^\d{9,9}$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const secUserID = msg.text;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  // checking if user made a request
  const request = await requestController.checkRequest(userID);
  if (request === "/invite") {
    const source = "/invite";
    // adding user to the class object
    await classController.addUsertoClass(userID, secUserID);

    response = getResponse(source, {});

    return bot.sendMessage(id, response, options);
  }
  if (request === "/promote") {
    const source = "/promote";

    // adding user to the class object
    const isUsersInTheSameClass = await classController.promoteUser(
      userID,
      secUserID
    );

    if (!isUsersInTheSameClass) {
      response = getResponse(source, { validErr: true });

      return bot.sendMessage(id, response[1], options);
    }

    response = getResponse(source, {});

    return bot.sendMessage(id, response, options);
  }
});
