module.exports = (source, options) => {
  let response;
  options = options || {};

  switch (source) {
    case "/start":
      response = `Hi, ${options.userName}\n/help for more info`;
      break;
    case "/help":
      response =
        "<b>User</b>\n/getid - shows your userID\n\n<b>Class</b>\n/create *className* - creates a class with specified name\n/leaveClass - leave the class you're in\n/classInfo - gives information about the class you're in\n<b>Admin Commands</b>\n/deleteClass - deletes class\n/invite - invites user to your class\n/promote - makes user an admin\n\n<b>Subjects</b>\n<b>AdminCommands</b>\n/addSubject - adds subject on specified day with specified name\n/removeSubject - removes from specified day with specified name\n\n<b>Homework</b>\n/show - shows homework(all, for the day, for the subject)\n<b>AdminCommands</b>\n/note - notes homework on specified day and subject\n/clear - clears homework(all, for the day, for the subject)";
      break;
    case "/getid":
      response = `Your user ID: ${options.userID}\nGive it to the admin of the class so you'll be able to got into the class`;
      break;
    case "/create":
      response = {
        success: `Class has been successfully created!\n\nName: ${options.className}`,
        msgErr:
          "<b>ERROR: please provide className</b>\nName must be without spaces!\n\nExample:\n/create className",
        classErr:
          "<b>ERROR: you are already in the class</b>\n\nTo create a new class you shouldn't be in any class",
      };
      break;
    case "/delete":
      response = {
        success: `Class has been successfully deleted!\n\nName: ${options.className}`,
        confirm: `Are you sure you want to delete class? All subjects and homework will be deleted permanently`,
        permissionErr:
          "<b>ERROR: you don't have permission to delete the class</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
      };
      break;
    case "/leave":
      response = {
        success: `You successfully left the Class!\n\nName: ${options.className}`,
        classErr: "<b>ERROR: you are not in any class </b>",
      };
      break;
    case "/class":
      response = {
        success: `Your class info:\n\nName: ${options.className}\nNumber of users: ${options.usersNum}`,
        classErr: "<b>ERROR: you are not in any class </b>",
      };
      break;
    case "/invite":
      response = {
        success: `User has entered the class!`,
        sendMessage:
          "Please send me ID of the user\nUser can get it with this command /getid\nIf you want to go back, click 'Back'\n\nExample:\n123456789",
        permissionErr:
          "<b>ERROR: you don't have permission to invite users</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
      };
      break;
    case "/promote":
      response = {
        success: "User has been promoted!",
        sendMessage:
          "Please send me ID of the user\nUser can get it with this command /getid\nIf you want to go back, click 'Back'\n\nExample:\n123456789",
        permissionErr:
          "<b>ERROR: you don't have permission to promote users</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        userClassErr: "<b>ERROR: user is not in the class </b>",
      };
      break;
    case "/add":
      response = {
        success: `${options.subjectName} has been added on ${options.day} as a ${options.subjectIndex} class!`,
        selectDay:
          "Please select the day of the week to which you want to add the subject",
        sendMessage:
          "Please send me index number and name of the subject\nIndex number must be in the range 1-12\nIf you want to go back, click 'Back'\n\nExample:\n3.Electrical engineering - this message will add Electrical engineering as the 3-rd class",
        permissionErr:
          "<b>ERROR: you don't have permission to add subjects</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        msgErr: `<b>ERROR: there's a subject with the ${options.subjectIndex} index on ${options.day}\nRemove the subject with the ${options.subjectIndex} index and try again</b>`,
      };
      break;
    case "/remove":
      response = {
        success: `${options.subjectName} has been removed from ${options.day}\n${options.subjectName} was a ${options.subjectIndex} class!`,
        selectDay:
          "Please select the day of the week from which you want to remove the subject",
        sendMessage:
          "Please select the subject\n\nExample:\n3.Electrical engineering - this message will remove Electrical engineering",
        permissionErr:
          "<b>ERROR: you don't have permission to remove subjects</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        msgErr: `<b>ERROR: the ${options.subjectIndex} class is not ${options.subjectName}\nCheck your /schedule and try again</b>`,
      };
      break;
    case "/note":
      response = {
        success: `homework has been added to the ${options.subjectName} on ${options.day}`,
        selectDay:
          "Please select the day of the week to which you want to note homework",
        selectSubject: `Please select the subject of the ${options.day} to which you want to note homework`,
        sendMessage: `Please send me homework for the ${options.subjectName} on ${options.day}\nIf you want to go back, click 'Back'`,
        permissionErr:
          "<b>ERROR: you don't have permission to add subjects</b>",
        classErr: "<b>ERROR: you are not in any class </b>",
        msgErr: `<b>ERROR: there's no ${options.subjectName} on ${options.day}</b>`,
      };
      break;
    case "Back":
      response = [
        `I'm waiting for your orders, ${options.userName}`,
        "If you'll need me, you know where to find me",
        "<b>Joke Time</b>\nWhat's the advantage of living in Switzerland?\nWell, the flag is a big plus.",
        "<b>Joke Time</b>\nOne day my robot friend went to buy some camo pants but couldn’t find any",
        "<b>Joke Time</b>\nWhat's is the robot's favorite kind of music?\nHeavy metal",
        "<b>Joke Time</b>\nThat's my favorite one:\n00110010 00101011 00110010 00111101 00110101\n😂🤣🤣😂🤣😂",
      ];
      break;
  }

  return response;
};
