# **pepe-homework-bot :frog:**

Telegram bot for easy access to homework for week  
**Created with** [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)

[![Node version](https://img.shields.io/badge/Node-v12.9.0-green)](https://nodejs.org/en/)
[![Node-telegram-bot-api](https://img.shields.io/badge/Node_Telegram_Bot_Api-v0.50.0-blue)](https://github.com/yagop/node-telegram-bot-api)
[![Mongoose](https://img.shields.io/badge/Mongoose-v5.11.8-red)](https://mongoosejs.com/)
[![Dot-env](https://img.shields.io/badge/DotEnv-v8.2.0-yellow)](https://github.com/motdotla/dotenv)

# Usage 

**(Currently off)**
- Find **@pepe_homework_bot** in telegram search
- Click **Start**

# Command list

`/start` - start the bot  
`/help` - help info  
`/show *day*` - shows homework for the day  
`/show *day* *subject*` - shows homework for the specific subject  
`/note *day* *subject* *homework*` - notes homework for specific subject  

`*day*` - num that represents the day of the week  
`*subject*` - subject name that exists on the selected day  
`*homework*` - text you want to attach to the selected subject and day  

# Example

![1-example](https://raw.githubusercontent.com/SENYa-408/pepe-homework-bot/master/readme-imgs/1-example.png)
![2-example](https://raw.githubusercontent.com/SENYa-408/pepe-homework-bot/master/readme-imgs/2-example.png)

# Install

1. Clone git repository  
   `git clone https://github.com/SENYa-408/pepe-homework-bot.git`
2. Go to directory with project
3. Download all dependencies with cmd  
   `npm install`
4. Create config.env file in root directory with environment variables:  
   `TOKEN=...` @BotFather TOKEN  
   `MONGO_URL=...` URL of Mongo DataBase created on [MongoDB.com](https://www.mongodb.com/)

# Technologies used

**Framework** - `Nodejs`  
 **API** - `node-telegram-bot-api`  
 **MongoDB Module** - `Mongoose`  
 **Module for env vars** - `dotenv`
