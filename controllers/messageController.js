module.exports = (type, options) => {
  let response;

  switch (type) {
    case "/start":
      response = `Hi, ${options.username}\n/help for more info`;
      break;
    case "/help":
      response = "Help info";
      break;
    case "/getid":
      response = `Your user ID: ${options.userID}\nGive it to the admin of the class so you'll be able to got into the class`;
      break;
    case "/create":
      response = options.err
        ? "<b>ERROR: please provide className</b>\nName must be without spaces!\n\nExample:\n/create className"
        : `Class has been successfully created!\n\nName: ${options.className}`;
      if (options.validErr)
        response =
          "<b>ERROR: you are already in the class</b>\n\nTo create a new class you shouldn't be in any class";
      break;
    case "/delete":
      response = `Class has been successfully deleted!\n\nName: ${options.className}`;
      if (options.confirm)
        response = `Are you sure you want to delete class? All subjects and homework will be deleted permanently`;
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      if (options.permission === false)
        response =
          "<b>ERROR: you don't have permission to delete the class</b>";
      break;
    case "/leave":
      response = `You successfully left the Class!\n\nName: ${options.className}`;
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      break;
    case "/class":
      response = `Your class info:\n\nName: ${options.className}\nNumber of users: ${options.usersNum}`;
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      break;
    case "/invite":
      response = `User has entered the class!`;
      if (options.confirm)
        response =
          "Please send me ID of the user\nUser can get it with this command /getid\n\nExample:\n123456789";
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      if (options.permission === false)
        response = "<b>ERROR: you don't have permission to invite users</b>";
      break;
    case "/promote":
      response = `User has been promoted!`;
      if (options.confirm)
        response =
          "Please send me ID of the user\nUser can get it with this command /getid\n\nExample:\n123456789";
      if (options.validErr)
        response = [
          "<b>ERROR: you are not in any class </b>",
          "<b>ERROR: user is not in the class </b>",
        ];
      if (options.permission === false)
        response = "<b>ERROR: you don't have permission to promote users</b>";
      break;
    case "/add":
      response = `${options.subjectName} has been added on ${options.day} as a ${options.subjectIndex} class!`;
      if (options.confirm)
        response = [
          "Please select the day of the week to which you want to add the subject",
          "Please send me index number and name of the subject\nIndex number must be in the range 1-12\n\nExample:\n3 Electrical engineering - this message will add Electrical engineering the 3-rd class",
        ];
      if (options.validErr)
        response = "<b>ERROR: you are not in any class </b>";
      if (options.permission === false)
        response = "<b>ERROR: you don't have permission to add subjects</b>";
      break;
  }

  return response;
};
