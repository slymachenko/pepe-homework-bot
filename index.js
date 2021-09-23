const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const getResponse = require("./controllers/messageController");
const classController = require("./controllers/classController");
const requestController = require("./controllers/requestController");
const homeworkController = require("./controllers/homeworkController");
const userController = require("./controllers/userController");

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

bot.onText(/^\/start/, async (msg, [source]) => {
  const { id } = msg.chat;
  const userName = msg.from.first_name;
  const userID = msg.from.id;
  const username = msg.from.username;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  const URL = msg.text.substr(msg.text.indexOf(" ") + 1);

  if (URL === source) {
    const response = getResponse(source, { userName }).start;

    return bot.sendMessage(id, response, options);
  }

  const classDoc = await userController.addUsertoClass(URL, userID, username);
  if (!classDoc) {
    const response = getResponse(source, {}).classErr;

    return bot.sendMessage(id, response, options);
  }

  const className = classDoc.name;
  const response = getResponse(source, { userName, className }).success;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/help$/, (msg, [source]) => {
  const { id } = msg.chat;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };

  const response = getResponse(source);

  bot.sendMessage(id, response, options);
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
  const username = msg.from.username;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
  };
  let response;

  const [source, className, ...text] = msg.text.split(" ");

  // user message validation
  if (!className || text.length > 0) {
    response = getResponse(source, {}).msgErr;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is a member of the class - send an error message
  const isUserinClass = await userController.checkUserinClass(userID);
  if (isUserinClass) {
    response = getResponse(source, {}).classErr;

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
        username,
      },
    ],
  });

  response = getResponse(source, { className }).success;

  await bot.sendMessage(id, response, options);
});

bot.onText(/^\/deleteClass$/, async (msg, [source]) => {
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

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, {}).classErr;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, {}).permissionErr;

    return bot.sendMessage(id, response, options);
  }

  // saving '/deleteClass' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  options.reply_markup = {
    keyboard: [["Back", "Delete сlass"]],
    one_time_keyboard: true,
  };
  response = getResponse(source, {}).confirm;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/leaveClass$/, async (msg, [source]) => {
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
  response = getResponse(source, { className }).success;

  if (!classDoc) response = getResponse(source, {}).classErr;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/classInfo$/, async (msg, [source]) => {
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
    response = getResponse(source, {}).classErr;
    return bot.sendMessage(id, response, options);
  }

  response = getResponse(source, {}).createClassInfoResponse(classDoc);

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/promoteUser$/, async (msg, [source]) => {
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

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, {}).classErr;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, {}).permissionErr;

    return bot.sendMessage(id, response, options);
  }

  // saving '/promoteUser' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  options.reply_markup = {
    inline_keyboard: [[{ text: "Back", callback_data: "Back" }]],
  };
  response = getResponse(source, {}).sendMessage;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/addSubject$/, async (msg, [source]) => {
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

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, {}).classErr;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, {}).permissionErr;

    return bot.sendMessage(id, response, options);
  }

  // saving '/addSubject' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday"],
      ["Back"],
    ],
  };
  response = getResponse(source, {}).selectDay;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/removeSubject$/, async (msg, [source]) => {
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

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, {}).classErr;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, {}).permissionErr;

    return bot.sendMessage(id, response, options);
  }

  // saving '/removeSubject' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday"],
      ["Back"],
    ],
  };
  response = getResponse(source, {}).selectDay;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/note$/, async (msg, [source]) => {
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

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, {}).classErr;

    return bot.sendMessage(id, response, options);
  }

  // check if the user is an admin
  const isUserAdmin = await userController.checkUserAdmin(userID);
  if (!isUserAdmin) {
    response = getResponse(source, {}).permissionErr;

    return bot.sendMessage(id, response, options);
  }

  // saving '/note' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday"],
      ["Back"],
    ],
  };
  response = getResponse(source, {}).selectDay;

  bot.sendMessage(id, response, options);
});

bot.onText(/^\/show$/, async (msg, [source]) => {
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

  // check if the user is a member of the class
  const isUserinClass = await userController.checkUserinClass(userID);
  if (!isUserinClass) {
    response = getResponse(source, {}).classErr;

    return bot.sendMessage(id, response, options);
  }

  // saving '/show' command to the db to know users request in the future
  await requestController.updateRequest(userID, source);

  options.reply_markup = {
    keyboard: [
      ["Monday", "Tuesday", "Wednesday"],
      ["Thursday", "Friday", "All"],
      ["Back"],
    ],
  };
  response = getResponse(source, {}).selectDay;

  bot.sendMessage(id, response, options);
});

bot.onText(/^Back$|^back$/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const userName = msg.from.first_name;
  const source = "Back";
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
  const source = "/deleteClass";
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  // check if the user made a request
  const request = await requestController.getRequest(userID);
  if (!request.includes("/deleteClass")) return;

  // deleting class document and clearing user request
  const classDoc = await classController.deleteClass(userID);
  await requestController.clearRequest(userID);

  const [className] = [classDoc.name];

  response = getResponse(source, { className }).success;

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
  if (request.includes("/promoteUser")) {
    const source = "/promoteUser";

    // adding user to the class object
    const isUsersInTheSameClass = await userController.promoteUser(
      userID,
      secUserID
    );

    if (!isUsersInTheSameClass) {
      response = getResponse(source, {}).userClassErr;

      return bot.sendMessage(id, response, options);
    }

    await requestController.clearRequest(userID);

    response = getResponse(source, {}).success;

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
    if (
      !request.some((item) =>
        ["/addSubject", "/removeSubject", "/note", "/show"].includes(item)
      )
    )
      return;
    if (request.includes("/addSubject")) {
      source = "/addSubject";
      options.reply_markup = {
        inline_keyboard: [[{ text: "Back", callback_data: "Back" }]],
      };
    }
    if (request.includes("/removeSubject")) {
      source = "/removeSubject";
      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
      };
    }
    if (request.includes("/note")) {
      source = "/note";

      // check if day has at least one subject
      const isSubjectinDay = await homeworkController.checkDayhasSubjects(
        userID,
        weekday
      );
      if (!isSubjectinDay) {
        response = getResponse(source, { day: weekday }).subjectsErr;

        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response, options);
      }

      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
        one_time_keyboard: true,
      };
    }
    if (request.includes("/show")) {
      source = "/show";

      // check if day has at least one subject
      const isSubjectinDay = await homeworkController.checkDayhasSubjects(
        userID,
        weekday
      );
      if (!isSubjectinDay) {
        response = getResponse(source, { day: weekday }).subjectsErr;

        await requestController.clearRequest(userID);
        return bot.sendMessage(id, response, options);
      }

      options.reply_markup = {
        keyboard: await homeworkController.getSubjectsButtons(userID, weekday),
      };

      options.reply_markup.keyboard.splice(
        options.reply_markup.keyboard.length - 2,
        0,
        ["All Day"]
      );
    }

    // saving weekday to the db to know users request in the future
    await requestController.updateRequest(userID, weekday);

    response = getResponse(source, { day: weekday }).sendMessage;
    if (["/note", "/show"].includes(request[0]))
      response = getResponse(source, { day: weekday }).selectSubject;

    return bot.sendMessage(id, response, options);
  }
);

bot.onText(/^[1-9].[A-Za-zА-яа-я]|^10.[A-Za-zА-яа-я]/, async (msg) => {
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
  const [subjectIndex, ...text] = msg.text.split(".");
  const subjectName = text.join(" ");

  if (request.includes("/addSubject")) {
    const source = "/addSubject";

    const homeworkDoc = await homeworkController.createSubject(userID, {
      index: subjectIndex,
      name: subjectName,
      day,
    });

    if (!homeworkDoc) {
      response = getResponse(source, {
        subjectIndex,
        subjectName,
        day,
      }).msgErr;

      await requestController.clearRequest(userID);

      return bot.sendMessage(id, response, options);
    }

    await requestController.clearRequest(userID);

    response = getResponse(source, {
      subjectIndex,
      subjectName,
      day,
    }).success;

    return bot.sendMessage(id, response, options);
  }
  if (request.includes("/removeSubject")) {
    const source = "/removeSubject";

    const homeworkDoc = await homeworkController.deleteSubject(userID, {
      name: subjectName,
      index: subjectIndex,
      day,
    });

    if (!homeworkDoc) {
      response = getResponse(source, {
        subjectIndex,
        subjectName,
      }).msgErr;

      await requestController.clearRequest(userID);

      return bot.sendMessage(id, response, options);
    }

    await requestController.clearRequest(userID);

    response = getResponse(source, {
      subjectIndex,
      subjectName,
      day,
    }).success;

    return bot.sendMessage(id, response, options);
  }
  if (request.includes("/show") && request.length === 2) {
    const source = "/show";
    const [subjectIndex, subject] = msg.text.split(".");

    const subjectDoc = await homeworkController.getSubjectHomework(
      userID,
      day,
      subjectIndex,
      subject
    );

    response = getResponse(source, {}).createSubjectHomeworkResponse(
      subjectDoc
    );

    await requestController.clearRequest(userID);
    bot.sendMessage(id, response, options);
  }
});

bot.onText(/^All/, async (msg) => {
  const { id } = msg.chat;
  const userID = msg.from.id;
  const source = "/show";
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };
  let response;

  const request = await requestController.getRequest(userID);
  if (!request) return;
  if (!request.includes(source)) return;

  const [, text] = msg.text.split(" ");

  if (text === "Day") {
    // All Day
    const homework = await homeworkController.getDayHomework(
      userID,
      request[1]
    );

    response = getResponse(source, {
      day: request[1],
    }).createDayHomeworkResponse(homework);

    await requestController.clearRequest(userID);
    bot.sendMessage(id, response, options);
  } else {
    // All
    const homework = await homeworkController.getAllHomework(userID);

    response = getResponse(source, {}).createAllHomeworkResponse(homework);

    await requestController.clearRequest(userID);
    bot.sendMessage(id, response, options);
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
      "back",
      "Delete сlass",
      "All",
      "All Day",
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
      options.reply_markup = {
        inline_keyboard: [[{ text: "Back", callback_data: "Back" }]],
      };

      const isSubjectinDay = await homeworkController.checkSubjectinDay(
        userID,
        day,
        subjectName
      );
      if (!isSubjectinDay) {
        response = getResponse(source, {
          subjectName,
          day,
        }).selectSubject;

        await requestController.clearRequest(userID);

        return bot.sendMessage(id, response, options);
      }

      // saving subject to the db to know users request in the future
      await requestController.updateRequest(userID, subjectName);

      response = getResponse(source, { subjectName, day }).sendMessage;

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

      response = getResponse(source, { subjectName, day }).success;

      return bot.sendMessage(id, response, options);
    }
  }
});

bot.on("callback_query", async (data) => {
  const { id } = data.message.chat;
  const userID = data.from.id;
  const userName = data.from.first_name;
  const callback_query_id = data.id;
  const options = {
    parse_mode: "HTML",
    disable_notification: true,
    reply_markup: {
      hide_keyboard: true,
    },
  };

  if (data.data === "Back") {
    await requestController.clearRequest(userID);

    const response = getResponse(data.data, { userName });

    bot.answerCallbackQuery(callback_query_id);

    bot.sendMessage(
      id,
      response[Math.floor(Math.random() * response.length)],
      options
    );
  }
});
