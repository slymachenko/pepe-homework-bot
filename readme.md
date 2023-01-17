# **pepe-homework-bot :frog:**

[![Node version](https://img.shields.io/badge/Node-v12.9.0-green)](https://nodejs.org/en/)
[![Node-telegram-bot-api](https://img.shields.io/badge/Node_Telegram_Bot_Api-v0.50.0-blue)](https://github.com/yagop/node-telegram-bot-api)
[![Mongoose](https://img.shields.io/badge/Mongoose-v6.4.6-red)](https://mongoosejs.com/)
[![Dot-env](https://img.shields.io/badge/DotEnv-v10.0.0-yellow)](https://github.com/motdotla/dotenv)

Telegram bot for easy access to homework for week  
**Created with** [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)

# Setup
- Clone git repository:  
`git clone https://github.com/slymachenko/pepe-homework-bot.git`
- Open project root directory.
- Create `config.env` file that must contain:
```
TOKEN=*Telegram bot token*
MONGO_URL=*MongoDB connection string*
PORT=*PORT*
URL=*Webhook URL*
```
- Download all dependencies:  
`npm install`
- Start ngrok:  
`npx ngrok http *PORT*`
- Start bot with  
`npm start`  
or  
`npm run start-dev`

# Usage
- Find **@`your bot id`** in telegram search
- Click **Start**

# Command list
For new users:  
`/start` - start the bot  
`/help` - help information  
`/create *className*` - creates class with specified name  

For class members:  
`/leaveclass` - leave the class  
`/classinfo` - get information about the class (name, members, invite link)  
`/show` - shows homework (all, for the day, for the specific subject)  

For class admins:  
`/deleteclass` - delete the class  
`/promoteuser` - promote user to an admin  
`/demoteuser` - demote user to a regular class member  
`/addsubject` - add subject on specified day with specified name and index  
`/removesubject` - remove subject from specified day  
`/note` - note homework on specified subject  
`/clear` - clear homework on specified subject  
