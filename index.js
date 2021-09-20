const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const getResponse = require("./controllers/messageController");
const classController = require("./controllers/classController");
const requestController = require("./controllers/requestController");
const homeworkController = require("./controllers/homeworkController");

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

  // check if the user is a member of the class
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
        request: [],
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

  // check if the user is a member of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true });
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
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

  // check if the user is a member of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true });

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
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

  // check if the user is a member of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true })[0];

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
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

bot.onText(/^\/add$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      keyboard: [
        ["Monday", "Tuesday", "Wednesday"],
        ["Thursday", "Friday"],
        ["Back"],
      ],
      one_time_keyboard: true,
    },
  };
  let response;

  // check if the user is a member of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true })[0];
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await classController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, { permission: false });
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // saving '/add' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  response = getResponse(source, { confirm: true })[0];

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/remove$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      keyboard: [
        ["Monday", "Tuesday", "Wednesday"],
        ["Thursday", "Friday"],
        ["Back"],
      ],
      one_time_keyboard: true,
    },
  };
  let response;

  // check if the user is a member of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true })[0];
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await classController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, { permission: false });
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // saving '/remove' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  response = getResponse(source, { confirm: true })[0];

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/note$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      keyboard: [
        ["Monday", "Tuesday", "Wednesday"],
        ["Thursday", "Friday"],
        ["Back"],
      ],
      one_time_keyboard: true,
    },
  };
  let response;

  // check if the user is a member of the class
  const isUserinClass = await classController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, { validErr: true })[0];
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await classController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, { permission: false });
    options.reply_markup = null;

    return bot.sendMessage(id, response, options);
  }

  // saving '/note' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  response = getResponse(source, { confirm: true })[0];

  bot.sendMessage(id, response, options);
});

bot.onText(/^Back$/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const userName = msg.from.first_name;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  await requestController.clearRequest(userID);

  const response = getResponse(source, { userName });

  bot.sendMessage(
    id,
    response[Math.floor(Math.random() * response.length)],
    options
  );
});

bot.onText(/^Delete сlass$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const source = "/delete";
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (!request.includes("/delete")) return;

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
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (request.includes("/invite")) {
    const source = "/invite";
    // adding user to the class object
    await classController.addUsertoClass(userID, secUserID);

    await requestController.clearRequest(userID);

    response = getResponse(source, {});

    return bot.sendMessage(id, response, options);
  }
  if (request.includes("/promote")) {
    const source = "/promote";

    // adding user to the class object
    const isUsersInTheSameClass = await classController.promoteUser(
      userID,
      secUserID
    );

    if (!isUsersInTheSameClass) {
      response = getResponse(source, { validErr: true })[1];

      return bot.sendMessage(id, response, options);
    }

    await requestController.clearRequest(userID);

    response = getResponse(source, {});

    return bot.sendMessage(id, response, options);
  }
});

bot.onText(
  /^Monday$|^Tuesday$|^Wednesday$|^Thursday$|^Friday$/,
  async (msg, [weekday]) => {
    const { id } = msg.chat;
    const userID = msg.from.id;
    const options = {
      parse_mode: "HTML",
      disable_notification: true,
      reply_markup: {
        hide_keyboard: true,
      },
    };
    let source;

    // check if the user made a request
    const request = await requestController.getRequest(userID);

    if (!request) return;
    if (!request.some((item) => ["/add", "/remove", "/note"].includes(item)))
      return;
    if (request.includes("/add")) source = "/add";
    if (request.includes("/remove")) source = "/remove";
    if (request.includes("/note")) {
      source = "/note";
      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
      };
    }

    // saving weekday to the db to know users request in the future
    await requestController.updateRequest(userID, weekday);

    const response = getResponse(source, { confirm: true, day: weekday })[1];

    return bot.sendMessage(id, response, options);
  }
);

bot.onText(/^[1-9] [A-Za-zА-яа-я]|^10 [A-Za-zА-яа-я]/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };
  let response;

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (!request || request.length !== 2) return;

  const day = request[1];
  const [subjectIndex, ...text] = msg.text.split(" ");
  const subjectName = text.join(" ");

  if (request.includes("/add")) {
    const source = "/add";

    const homeworkDoc = await homeworkController.createSubject(userID, {
      index: subjectIndex,
      name: subjectName,
      day,
    });

    if (!homeworkDoc) {
      response = getResponse(source, {
        validErr: true,
        subjectIndex,
        subjectName,
        day,
      })[1];

      await requestController.clearRequest(userID);

      return bot.sendMessage(id, response, options);
    }

    await requestController.clearRequest(userID);

    response = getResponse(source, {
      subjectIndex,
      subjectName,
      day,
    });

    return bot.sendMessage(id, response, options);
  }
  if (request.includes("/remove")) {
    const source = "/remove";

    const homeworkDoc = await homeworkController.deleteSubject(userID, {
      name: subjectName,
      index: subjectIndex,
      day,
    });

    if (!homeworkDoc) {
      response = getResponse(source, {
        validErr: true,
        subjectIndex,
        subjectName,
      })[1];

      await requestController.clearRequest(userID);

      return bot.sendMessage(id, response, options);
    }

    await requestController.clearRequest(userID);

    response = getResponse(source, {
      subjectIndex,
      subjectName,
      day,
    });

    return bot.sendMessage(id, response, options);
  }
});

bot.on("message", async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };
  let response;
  let source;

  if (
    msg.entities ||
    [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Back",
      "Delete сlass",
    ].includes(msg.text)
  )
    return;

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (!request) return;

  if (request.includes("/note")) {
    const day = request[1];
    source = "/note";

    if (request.length === 2) {
      // user message => SUBJECT
      const subjectName = msg.text.split(".")[1];
      console.log("SUBJECT");

      const isSubjectinDay = await homeworkController.checkSubjectinDay(
        userID,
        day,
        subjectName
      );
      if (!isSubjectinDay) {
        response = getResponse(source, {
          validErr: true,
          subjectName,
          day,
        })[1];

        await requestController.clearRequest(userID);

        return bot.sendMessage(id, response, options);
      }

      // saving subject to the db to know users request in the future
      await requestController.updateRequest(userID, subjectName);

      response = getResponse(source, { confirm: true, subjectName, day })[2];

      return bot.sendMessage(id, response, options);
    }
    if (request.length === 3) {
      // user message => HOMEWORK
      const homeworkText = msg.text;
      const subjectName = request[2];

      await homeworkController.addHomework(
        userID,
        day,
        subjectName,
        homeworkText
      );

      await requestController.clearRequest(userID);

      response = getResponse(source, { subjectName, day });

      return bot.sendMessage(id, response, options);
    }
  }
});
