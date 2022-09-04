/******************************
  References
*******************************

// https://xivapi.com/docs
// https://universalis.app/docs
// https://ffxivcollect.com/
// https://discord.js.org/#/docs/main/stable/general/welcome

/******************************
  Prod / Dev
*******************************/

const config = require('./config').production;

/******************************
  Variables & Libs
*******************************/

const { setIntervalAsync } = require('set-interval-async/dynamic')
const { clearIntervalAsync } = require('set-interval-async')
const lodash = require('lodash');
const moment = require("moment");
const Discord = require("discord.js");
const scriptName = __filename.slice(__dirname.length + 1);
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING
  ],
  makeCache: Discord.Options.cacheWithLimits({
    MessageManager: 10,
    PresenceManager: 0,
  }),
  sweepers: {
    messages: {
      lifetime: 1800,
      interval: 3600
    }
  }
});

const pool = ( scriptName == 'dev-bot.js' ) ? config.getStagingPool() : config.getPool();
const readPool = ( scriptName == 'dev-bot.js' ) ? config.getStagingPool() : config.getReadPool();
const redis = config.getRedis();

let fashionCheckIntervals = 600 * 1000;
let lodestoneCheckIntervals = 600 * 1000;

/******************************
  Bot Auth
*******************************/

if( scriptName == 'dev-bot.js' ) {
  client.login(config.devBotToken);
  config.botID = config.devBotID;
  console.log("----- DEVELOPMENT BOT -----");
}
else {
  // New Relic
  require('newrelic');

  client.login(config.discordBotToken);
  console.log("----- PRODUCTION BOT -----");
}

// Modules
const helper = require("./helper.js");
const dcserver = require("./modules/dcserver.js");
const tripletriad = require("./modules/tripletriad.js");
const fflogs = require("./modules/fflogs.js");
const lodestone_news = require("./modules/lodestone_news.js");
const fashion_report = require("./modules/fashion_report.js");
const eorzea_time = require("./modules/eorzea_time.js");
const eorzea_collection = require("./modules/eorzea_collection.js");
const xivcollect = require("./modules/xivcollect.js");
const housing_snap = require("./modules/housing_snap.js");

let character, marketboard, item;

/******************************
  Event Listeners
*******************************/

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("ready", async function() {

  helper.printStatus(config.appName + " bot is ready!");

  client.user.setPresence({ activities: [{ name: '!kweh help', type: "PLAYING"}], status: 'online'});

  // random status message every 10s
  setInterval(function(){
    client.user.setPresence({ activities: [{ name: config.statuses[Math.floor(Math.random() * config.statuses.length)], type: "PLAYING"}], status: 'online'});
  }, 10000);

  // Check Lodestone periodically
  setInterval(lodestone_news.autoCheckPostNews, lodestoneCheckIntervals, client);

  // Check fashion report periodically
  setInterval(fashion_report.autoCheckPostFR, fashionCheckIntervals, client);

  // lodestone_news.manualPostByeMessage(client);
});

/******************************
  Reaction Listener
*******************************/

client.on('messageReactionAdd', async function(reaction, user) {

  if ( user.bot ) return; // Ignore bots

  if( reaction.message.author.id == config.botID ) { // only process kweh messages
    if( reaction.message.embeds.length > 0 ) {

      // Eorzea Collection
      if( reaction.message.embeds[0].hasOwnProperty('author') && reaction.message.embeds[0].author.hasOwnProperty('name') && reaction.message.embeds[0].author.name.includes("Eorzea Collection") ) {

        let numberOptions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

        if(reaction.emoji.name === "⬅️") {
          await eorzea_collection.loadNextImg(reaction, "desc");
        }
        if(reaction.emoji.name === "➡️") {
          await eorzea_collection.loadNextImg(reaction, "asc");
        }
        if(numberOptions.includes(reaction.emoji.name)) {
          await eorzea_collection.loadGlamNo(reaction, reaction.emoji.name);
        }
      }

      // Housing Snap
      if( reaction.message.embeds[0].hasOwnProperty('author') && reaction.message.embeds[0].author.hasOwnProperty('name') && reaction.message.embeds[0].author.name.includes("Housing Snap") ) {

        let numberOptions = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

        if(reaction.emoji.name === "⬅️") {
          await housing_snap.loadNextImg(reaction, "desc");
        }
        if(reaction.emoji.name === "➡️") {
          await housing_snap.loadNextImg(reaction, "asc");
        }
        if(numberOptions.includes(reaction.emoji.name)) {
          await housing_snap.loadItemNo(reaction, reaction.emoji.name);
        }
      }
    }
  }
});

/******************************
  Message Listener
*******************************/

client.on("messageCreate", async function(message) {

  if ( message.author.bot ) return; // Ignore bots
  if ( !message.channel.guild ) return; // Ignore dm

  // Work-around for message intent removal
  // Must have @bot in message
  message.content = message.content.replace('<@'+config.botID+'>', '')
  // Remove bot from mentioned used collection
  message.mentions.users = message.mentions.users.filter(user => user.id != config.botID);

  if ( message.content === '' ) return; // Ignore empty messages

  const args = message.content.trim().split(/ +/g).map(args => args.toLowerCase());
  const command = args.shift().toLowerCase();

  if( config.commands.includes(command) == false ) return; // Ignore commands not in "commands" array

  const serverSettings = await getServerSettings(message.guild.id, client);
  const language = serverSettings["language"];
  const auto_delete = serverSettings["auto_delete"];
  const default_channel_id = serverSettings["default_channel_id"];
  const default_channel = serverSettings["default_channel"];

  const isAdmin = helper.isAdmin(message.member);
  const isSuperAdmin = helper.isSuperAdmin(message.member);

  message.serverSettings = serverSettings;
  message.logCommandID = await helper.logCommands(message, isAdmin, true);
  message.client = client;
  message.response_channel = default_channel ? default_channel : message.channel;

  updateServerInfo(message.guild.id, message.guild.name);

  // Throttle Check
  let msgThrottleCheck = await throttleCheck(message.guild.id);

  if( msgThrottleCheck == false ) {
    helper.sendErrorMsg("Slow down!", "Too many commands received in the last 5s.", message);
    return;
  }

  /***********************************
  ****  LOCALIZATIONS
  ************************************/

  if( language == "jp" ) {
    item = require("./modules/jp/item.js");
    character = require("./modules/jp/character.js");
    marketboard = require("./modules/jp/marketboard.js");
  }
  else if( language == "fr" ) {
    item = require("./modules/fr/item.js");
    character = require("./modules/fr/character.js");
    marketboard = require("./modules/marketboard.js");
  }
  else if( language == "de" ) {
    item = require("./modules/de/item.js");
    character = require("./modules/de/character.js");
    marketboard = require("./modules/marketboard.js");
  }
  else {
    item = require("./modules/item.js");
    character = require("./modules/character.js");
    marketboard = require("./modules/marketboard.js");
  }

  /*******************************************
  ****  SERVER SETTINGS
  ****  PREFIX / LANGUAGE / DEFAULT CHANNEL
  ********************************************/
  if ( command === "kweh" && args.length > 0 ) {

    if( args[0] == 'prefix' ) {
      if( args.length == 1 ) {
        helper.sendInfoMsg("Info", "The server prefix for "+config.appName+" bot is: `" + prefix+"`", message);
      }
      else {

        if( isAdmin ) {
          if( args[1].length == 1 ) {
            setServerPrefix(message.guild.id, args[1]);
            helper.sendSuccessMsg("Success", "The server's prefix for "+config.appName+" bot is now: `" + args[1]+"`", message);
          }
          else {
            helper.sendErrorMsg("Error", "Changing server's prefix to `" + args[1] + "` failed. You can only set the server's prefix to a single character. Example: !, @, #, $", message);
          }
        }
        else {
          helper.sendErrorMsg("Error", "Only admins are allowed to change server settings", message);
        }
      }
    }

    else if( args[0] == 'language' ) {

      if( args.length == 1 ) {
        helper.sendInfoMsg("Info", "The server's language is `" + language + "`", message);
      }
      else {
        if( isAdmin ) {
          if( config.languageOptions.includes(args[1]) ) {
            setServerLanguage(message.guild.id, args[1]);
            helper.sendSuccessMsg("Success", "The server's language is now: `" + args[1]+"`", message);
          }
          else {
            helper.sendErrorMsg("Error", "Changing server's language to `" + args[1] + "` failed. \nValid options are `" + config.languageOptions.join(", ") + "`", message);
          }
        }
        else {
          helper.sendErrorMsg("Error", "Only admins are allowed to change server settings", message);
        }
      }
    }

    else if( args[0] == 'autodelete' ) {

      if( args.length == 1 ) {
        if( auto_delete ) {
          helper.sendInfoMsg("Info", "Auto deletion of commands is enabled. \n\nDisable it with `" + prefix + "kweh autodelete off`", message);
        }
        else {
          helper.sendInfoMsg("Info", "Auto deletion of commands is disabled. \n\nEnable it with `" + prefix + "kweh autodelete on`", message);
        }
      }
      else {
        if( isAdmin ) {
          if( args[1] == 'on' ) {
            enableAutoDelete(message.guild.id);
            helper.sendSuccessMsg("Success", "Auto deletion is enabled.", message);

            // Delete Msg
            message.delete().catch(function(err){
              if( err.code == 50013 ) {
                console.log(err.message);
              }
            });
          }
          else if( args[1] == 'off' ) {
            disableAutoDelete(message.guild.id);
            helper.sendSuccessMsg("Success", "Auto deletion is disabled.", message);
          }
          else {
            if( auto_delete ) {
              helper.sendInfoMsg("Info", "Auto deletion of commands is enabled. \n\nDisable it with `" + prefix + "kweh autodelete off`", message);
            }
            else {
              helper.sendInfoMsg("Info", "Auto deletion of commands is disabled. \n\nEnable it with `" + prefix + "kweh autodelete on`", message);
            }
          }
        }
        else {
          helper.sendErrorMsg("Error", "Only admins are allowed to change server settings", message);
        }
      }
    }

    else if( args[0] == 'channel' ) {

      if( args.length == 1 ) {
        if( default_channel ) {
          helper.sendInfoMsg("Info", "The default channel for " + config.appName + " is #" + default_channel.name, message);
        }
        else {
          helper.sendInfoMsg("Info", "No default bot response channel has been set. \n\nForce all bot messages to be sent to a specific channel with \n`" +prefix+"kweh channel #your-channel-name`", message);
        }
      }
      else {
        if( isAdmin ) {
          // Set channel
          let targetChannel = message.mentions.channels.first();

          if( targetChannel && args[1] != 'remove' && args[1] != 'rm' ) {
            await setDefaultChannel(message.guild.id, targetChannel.id);
            helper.sendSuccessMsg("Success", "The default response channel for " + config.appName + " bot has been set to #" + targetChannel.name, message);
          }
          else {
            // Remove channel
            if( args[1] == 'remove' || args[1] == 'rm' ) {
              if( default_channel ) {
                removeDefaultChannel(message.guild.id);
                helper.sendInfoMsg("Info", "The default response channel #" + default_channel.name + " has been removed.", message, true);
              }
              else {
                helper.sendInfoMsg("Info", "No default bot response channel has been set. \n\nForce all bot messages to be sent to a specific channel with \n`" +prefix+"kweh channel #your-channel-name`", message);
              }
            }
            else {
              helper.sendInfoMsg("Info", "No default bot response channel has been set. \n\nForce all bot messages to be sent to a specific channel with \n`" +prefix+"kweh channel #your-channel-name`", message);
            }
          }
        }
        else {
          helper.sendErrorMsg("Error", "Only admins are allowed to change server settings", message);
        }
      }
    }
  }

  /*************************************************
  **** PING
  *************************************************/
  else if ( command === "ping" ) {

    client.shard.fetchClientValues('guilds.cache.size')
      .then(results => console.log(`${results.reduce((prev, val) => prev + val, 0)} total guilds`))
      .catch(console.error);

    const message_timestamp = message.createdTimestamp;
    const curr_timestamp = Date.now();
    const pong_time = curr_timestamp - message_timestamp;

    message.response_channel.send("Pong in " +pong_time+ " ms" + " on shard " + message.guild.shardId);
  }

  /*************************************************
  **** REGISTER CHARACTER
  *************************************************/
  else if ( command === "register" || command === "iam" ) {

    helper.doTyping(message.response_channel);

    // server, firstname, lastname
    if( args.length == 3 ) {
      let server = args[0];
      let firstname = args[1];
      let lastname = args[2];

      let isValidServer = await dcserver.isServer(server);

      if( isValidServer == false ) {
        helper.sendErrorMsg("Error", "Invalid server `"+server+"`", message);
      }
      else {
        let characterSearchResult = await character.searchCharacter(server, firstname, lastname);

        if( lodash.isEmpty(characterSearchResult) ) {
          characterSearchResult = await character.searchCharacterOwnServer(server, firstname, lastname);
        }

        if( lodash.isEmpty(characterSearchResult) == false ) {

          let characterInfo = await character.getCharacterInfoOwnServer(characterSearchResult, language);

          let region = dcserver.getDCregion(characterInfo.datacenter);
          characterInfo.discordID = message.author.id;

          if( lodash.isEmpty(characterInfo) == false ) {
            character.printCharacterInfo(characterInfo, message);
          }

          // Update Profile
          character.setUserInfo(message.author.id, characterInfo.datacenter, characterInfo.server, region, characterSearchResult.firstname, characterSearchResult.lastname, characterSearchResult.lodestone_id);
        }
        else {
          helper.sendErrorMsg("Error", "Character not found", message);
        }
      }
    }
    // lodestone id
    else if( args.length == 1 ) {
      let lodestone_id = args[0];
      let characterSearchResult = {
        'lodestone_id': lodestone_id
      };

      let characterInfo = await character.getCharacterInfoOwnServer(characterSearchResult, language);

      if( lodash.isEmpty(characterInfo) == false ) {
        let region = dcserver.getDCregion(characterInfo.datacenter);
        characterInfo.discordID = message.author.id;
        character.printCharacterInfo(characterInfo, message);

        characterSearchResultNameArr = characterInfo.name.split(" ");
        characterSearchResult.firstname = characterSearchResultNameArr[0];
        characterSearchResult.lastname = characterSearchResultNameArr[1];

        // Update Profile
        character.setUserInfo(message.author.id, characterInfo.datacenter, characterInfo.server, region, characterSearchResult.firstname, characterSearchResult.lastname, characterSearchResult.lodestone_id);
      }
      else {
        helper.sendErrorMsg("Error", "Character not found", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Register your character with \n`@kweh "+command+" server firstname lastname`", message);
    }
  }

  /*************************************************
  **** GET CHARACTER
  *************************************************/
  else if ( command === "me" || command === "whoami" ) {
    helper.doTyping(message.response_channel);

    let userInfo = await character.getUserInfo(message.author.id);

    if( lodash.isEmpty(userInfo) == false ) {

      let characterInfo = await character.getCharacterInfoOwnServer(userInfo, language); // await character.getCharacterInfo(userInfo);

      if( lodash.isEmpty(characterInfo) == false ) {
        characterInfo.discordID = message.author.id;
        character.printCharacterInfo(characterInfo, message);
      }
      else {
        helper.sendErrorMsg("Error", "Profile not found. \n\nRegister your character with \n`@kweh register server firstname lastname`", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Profile not found. \n\nRegister your character with \n`@kweh register server firstname lastname`", message);
    }
  }

  /*************************************************
  **** GET CHARACTER OF TARGET / MENTIONED
  *************************************************/
  else if ( command === "whois" || command === "profile" ) {
    helper.doTyping(message.response_channel);

    // Self
    if( args.length == 0 ) {
      let userInfo = await character.getUserInfo(message.author.id);

      if( lodash.isEmpty(userInfo) == false ) {
        let characterInfo = await character.getCharacterInfoOwnServer(userInfo, language);

        if( characterInfo ) {
          characterInfo.discordID = message.author.id;
          character.printCharacterInfo(characterInfo, message);
        }
        else {
          helper.sendErrorMsg("Error", "Character not found", message);
        }
      }
      else {
        helper.sendErrorMsg("Error", "Profile not found", message);
      }
    }
    // Specific User
    else if( args.length == 3 ) {
      let server = args[0];
      let firstname = args[1];
      let lastname = args[2];

      let isValidServer = await dcserver.isServer(server);

      if( isValidServer == false ) {
        helper.sendErrorMsg("Error", "Invalid server `"+server+"`", message);
      }
      else {
        let characterSearchResult = await character.searchCharacter(server, firstname, lastname);

        if( lodash.isEmpty(characterSearchResult) ) {
          characterSearchResult = await character.searchCharacterOwnServer(server, firstname, lastname);
        }

        if( lodash.isEmpty(characterSearchResult) == false ) {

          let characterInfo = await character.getCharacterInfoOwnServer(characterSearchResult, language);

          if( lodash.isEmpty(characterInfo) == false ) {
            character.printCharacterInfo(characterInfo, message);
          }
          else {
            helper.sendErrorMsg("Error", "Character not found", message);
          }
        }
        else {
          helper.sendErrorMsg("Error", "Profile not found", message);
        }
      }
    }
    // Mentioned User
    else if( args.length > 0 ) {

      if( message.mentions.users.first() ) {

        let userInfo = await character.getUserInfo(message.mentions.users.first().id);

        if( lodash.isEmpty(userInfo) == false ) {
          let characterInfo = await character.getCharacterInfoOwnServer(userInfo, language);

          if( lodash.isEmpty(characterInfo) == false ) {
            characterInfo.discordID = message.mentions.users.first().id;
            character.printCharacterInfo(characterInfo, message);
          }
          else {
            helper.sendErrorMsg("Error", "Character not found", message);
          }
        }
        else {
          helper.sendErrorMsg("Error", "Profile not found", message);
        }
      }
      // By Lodestone ID
      else if(args.length == 1) {
        let lodestone_id = args[0];
        let characterSearchResult = {
          'lodestone_id': lodestone_id
        };

        let characterInfo = await character.getCharacterInfoOwnServer(characterSearchResult, language);

        if( lodash.isEmpty(characterInfo) == false ) {
          character.printCharacterInfo(characterInfo, message);
        }
        else {
          helper.sendErrorMsg("Error", "Character not found", message);
        }
      }
      else {
        helper.sendErrorMsg("Error", "View character profile with \n`@kweh "+command+" server firstname lastname`", message);
      }
    }
  }

  /*************************************************
  **** GET GLAMS OF TARGET / MENTIONED
  *************************************************/
  else if ( command === "glam" || command === "glamour" ) {
    helper.doTyping(message.response_channel);

    // Self
    if( args.length == 0 ) {
      let userInfo = await character.getUserInfo(message.author.id);

      if( lodash.isEmpty(userInfo) == false ) {
        let characterInfo = await character.getCharacterInfoXIVAPI(userInfo, false);

        if( characterInfo ) {
          character.printGlamInfo(characterInfo, message);
        }
        else {
          helper.sendErrorMsg("Error", "Character not found", message);
        }
      }
      else {
        helper.sendErrorMsg("Error", "Profile not found", message);
      }
    }
    // Specific User
    else if( args.length == 3 ) {
      let server = args[0];
      let firstname = args[1];
      let lastname = args[2];

      let isValidServer = await dcserver.isServer(server);

      if( isValidServer == false ) {
        helper.sendErrorMsg("Error", "Invalid server `"+server+"`", message);
      }
      else {
        let characterSearchResult = await character.searchCharacter(server, firstname, lastname);

        if( lodash.isEmpty(characterSearchResult) ) {
          characterSearchResult = await character.searchCharacterOwnServer(server, firstname, lastname);
        }

        if( lodash.isEmpty(characterSearchResult) == false ) {

          let characterInfo = await character.getCharacterInfoXIVAPI(characterSearchResult, false);

          if( lodash.isEmpty(characterInfo) == false ) {
            character.printGlamInfo(characterInfo, message);
          }
          else {
            helper.sendErrorMsg("Error", "Character not found", message);
          }
        }
        else {
          helper.sendErrorMsg("Error", "Profile not found", message);
        }
      }
    }
    // Mentioned User
    else if( args.length > 0 ) {

      if( message.mentions.users.first() ) {

        let userInfo = await character.getUserInfo(message.mentions.users.first().id);

        if( lodash.isEmpty(userInfo) == false ) {
          let characterInfo = await character.getCharacterInfoXIVAPI(userInfo, false);

          if( lodash.isEmpty(characterInfo) == false ) {
            characterInfo.discordID = message.mentions.users.first().id;
            character.printGlamInfo(characterInfo, message);
          }
          else {
            helper.sendErrorMsg("Error", "Character not found", message);
          }
        }
        else {
          helper.sendErrorMsg("Error", "Profile not found", message);
        }
      }
      else if(args.length == 1) {
        let lodestone_id = args[0];
        let characterSearchResult = {
          'lodestone_id': lodestone_id
        };

        let characterInfo = await character.getCharacterInfoXIVAPI(characterSearchResult, false);

        if( lodash.isEmpty(characterInfo) == false ) {
          character.printGlamInfo(characterInfo, message);
        }
        else {
          helper.sendErrorMsg("Error", "Character not found", message);
        }
      }
      else {
        helper.sendErrorMsg("Error", "View character glamours with \n`@kweh "+command+" server firstname lastname`", message);
      }
    }
  }

  /*************************************************
  **** GET FFLOGS FOR CHARACTER
  *************************************************/

  else if ( command === "logs" || command === "fflogs" || command === "parses" ) {
    helper.doTyping(message.response_channel);

    // Self
    if( args.length == 0 ) {
      let userInfo = await character.getUserInfo(message.author.id);

      if( lodash.isEmpty(userInfo) == false ) {

        let name = userInfo.firstname + " " + userInfo.lastname;
        let logsResults = await fflogs.getFFLogsGQL(name, userInfo.server, userInfo.region);

        fflogs.printFFLogsGQL(logsResults, message);
      }
      else {
        helper.sendErrorMsg("Error", "Profile not found", message);
      }
    }
    // Specific User
    else if( args.length == 3 ) {
      let server = args[0];
      let firstname = args[1];
      let lastname = args[2];

      let isValidServer = await dcserver.isServer(server);

      if( isValidServer == false ) {
        helper.sendErrorMsg("Error", "Invalid server `"+server+"`", message);
      }
      else {
        let characterSearchResult = await character.searchCharacter(server, firstname, lastname);

        if( lodash.isEmpty(characterSearchResult) ) {
          characterSearchResult = await character.searchCharacterOwnServer(server, firstname, lastname);
        }

        if( lodash.isEmpty(characterSearchResult) == false ) {

          let characterInfo = await character.getCharacterInfoOwnServer(characterSearchResult, language);

          if( lodash.isEmpty(characterInfo) == false ) {

            let name = firstname + " " + lastname;
            let region = dcserver.getDCregion(characterInfo.datacenter);
            let logsResults = await fflogs.getFFLogsGQL(name, characterInfo.server, region);

            fflogs.printFFLogsGQL(logsResults, message);
          }
          else {
            helper.sendErrorMsg("Error", "Character not found", message);
          }
        }
        else {
          helper.sendErrorMsg("Error", "Profile not found", message);
        }
      }
    }
    // Mentioned User
    else if( args.length > 0 ) {

      if( message.mentions.users.first() ) {

        let userInfo = await character.getUserInfo(message.mentions.users.first().id);

        if( lodash.isEmpty(userInfo) == false ) {

          let name = userInfo.firstname + " " + userInfo.lastname;
          let logsResults = await fflogs.getFFLogsGQL(name, userInfo.server, userInfo.region);

          fflogs.printFFLogsGQL(logsResults, message);
        }
        else {
          helper.sendErrorMsg("Error", "Profile not found", message);
        }
      }
      else {
        helper.sendErrorMsg("Error", "View FFLogs with \n`@kweh "+command+" server firstname lastname`", message);
      }
    }
  }

  /*************************************************
  **** Market Board Search
  *************************************************/
  else if ( command === "mb" || command === "market" || command == "marketboard" ) {
    helper.doTyping(message.response_channel);

    // dc + item name
    if( args.length > 0 ) {

      let dcOrServer = args[0];
      let searchedItem = args.slice(1).join(' ');

      let isDCSupplied = await dcserver.isDC(dcOrServer);
      let isServerSupplied = await dcserver.isServer(dcOrServer);

      // Try to get DC from user profile if not specified
      if( !isServerSupplied && !isDCSupplied ) {
        let userInfo = await character.getUserInfo(message.author.id);

        if( lodash.isEmpty(userInfo) == false ) {
          dcOrServer = userInfo.dc;
          isDCSupplied = true;
          searchedItem = args.join(' ');
        }
      }

      if( isDCSupplied || isServerSupplied ) {

        let itemMatchResult = await item.searchItemByName(searchedItem);

        if( itemMatchResult.length == 0 ) {
          helper.sendErrorMsg("Error", "Item "+searchedItem+" not found", message);
        }
        else if( itemMatchResult.length == 1 ) {
          let itemInfo = itemMatchResult[0];
          await marketboard.printMarketboardResult(itemInfo, dcOrServer, isDCSupplied, message);
        }
        else if( itemMatchResult.length > 1 ) {
          await marketboard.handleMultipleItems(itemMatchResult, searchedItem, dcOrServer, isDCSupplied, message);
        }
      }
      else {
        helper.sendErrorMsg("Error", "Invalid datacenter or server", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Lookup marketboard prices with \n`@kweh "+command+" datacenter/server itemname`", message);
    }
  }

  /*************************************************
  **** ITEM SEARCH
  *************************************************/
  else if ( command === "item" ) {

    helper.doTyping(message.response_channel);

    if( args.length > 0 ) {
      let searchedItem = args.join(' ');
      let itemMatchResult = await item.searchItemByName(searchedItem);

      if( itemMatchResult.length == 0 ) {
        helper.sendErrorMsg("Error", "Item "+searchedItem+" not found", message);
      }
      else if( itemMatchResult.length == 1 ) {
        let specificItemInfo = await item.getItemByID( itemMatchResult[0].ID );
        // print result
        item.displayItem(specificItemInfo, message);
      }
      else if( itemMatchResult.length > 1 ) {
        await item.handleMultipleItems(itemMatchResult, searchedItem, message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Lookup items with \n`@kweh "+command+" itemname`", message);
    }
  }

  /*************************************************
  **** MOUNT SEARCH ON XIVCOLLECT
  *************************************************/

  else if ( command === "mount" ) {
    helper.doTyping(message.response_channel);

    if( args.length > 0 ) {
      let searchedItem = args.join(' ');
      let itemMatchResult = await xivcollect.getMountData(message, searchedItem);

      if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length == 1 ) {
        await xivcollect.printItemInfo(itemMatchResult.results[0], message);
      }
      else if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length > 1 ) {
        await xivcollect.handleMultipleItems(itemMatchResult, searchedItem, message);
      }
      else {
        helper.sendErrorMsg("Error", "Mount "+searchedItem+" not found", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Lookup mounts with \n`@kweh "+command+" search_string`", message);
    }
  }

  /*************************************************
  **** MINION SEARCH ON XIVCOLLECT
  *************************************************/

  else if ( command === "minion" ) {
    helper.doTyping(message.response_channel);

    if( args.length > 0 ) {
      let searchedItem = args.join(' ');
      let itemMatchResult = await xivcollect.getMinionData(message, searchedItem);

      if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length == 1 ) {
        await xivcollect.printItemInfo(itemMatchResult.results[0], message);
      }
      else if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length > 1 ) {
        await xivcollect.handleMultipleItems(itemMatchResult, searchedItem, message);
      }
      else {
        helper.sendErrorMsg("Error", "Minion "+searchedItem+" not found", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Lookup minions with \n`@kweh "+command+" search_string`", message);
    }
  }

  /*************************************************
  **** TITLE SEARCH ON XIVCOLLECT
  *************************************************/

  else if ( command === "title" ) {
    helper.doTyping(message.response_channel);

    if( args.length > 0 ) {
      let searchedItem = args.join(' ');
      let itemMatchResult = await xivcollect.getTitleData(message, searchedItem);

      if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length == 1 ) {
        await xivcollect.printItemInfo(itemMatchResult.results[0], message);
      }
      else if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length > 1 ) {
        await xivcollect.handleMultipleItems(itemMatchResult, searchedItem, message);
      }
      else {
        helper.sendErrorMsg("Error", "Title "+searchedItem+" not found", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Lookup titles with \n`@kweh "+command+" search_string`", message);
    }
  }

  /*************************************************
  **** EMOTE SEARCH ON XIVCOLLECT
  *************************************************/

  else if ( command === "emote" ) {
    helper.doTyping(message.response_channel);

    if( args.length > 0 ) {
      let searchedItem = args.join(' ');
      let itemMatchResult = await xivcollect.getEmoteData(message, searchedItem);

      if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length == 1 ) {
        await xivcollect.printItemInfo(itemMatchResult.results[0], message);
      }
      else if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length > 1 ) {
        await xivcollect.handleMultipleItems(itemMatchResult, searchedItem, message);
      }
      else {
        helper.sendErrorMsg("Error", "Emote "+searchedItem+" not found", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Lookup emotes with \n`@kweh "+command+" search_string`", message);
    }
  }

  /*************************************************
  **** BARDING SEARCH ON XIVCOLLECT
  *************************************************/

  else if ( command === "barding" ) {
    helper.doTyping(message.response_channel);

    if( args.length > 0 ) {
      let searchedItem = args.join(' ');
      let itemMatchResult = await xivcollect.getBardingData(message, searchedItem);

      if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length == 1 ) {
        await xivcollect.printItemInfo(itemMatchResult.results[0], message);
      }
      else if( lodash.isEmpty(itemMatchResult) == false && itemMatchResult.results.length > 1 ) {
        await xivcollect.handleMultipleItems(itemMatchResult, searchedItem, message);
      }
      else {
        helper.sendErrorMsg("Error", "Barding "+searchedItem+" not found", message);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Lookup bardings with \n`@kweh "+command+" search_string`", message);
    }
  }

  /*************************************************
  **** GET TRIPLE TRIAD FOR CHARACTER
  *************************************************/
  else if ( command === "tt" || command === "ttcollection" || command === "cards" ) {
    helper.doTyping(message.response_channel);

    if( args.length == 0 ) {

      let tripleTriadData = await tripletriad.getFFTripleTriadData(message.author.id);

      if( lodash.isEmpty(tripleTriadData) == false ) {
        tripletriad.printTripleTriadData(tripleTriadData, message, message.author);
      }
      else {
        helper.sendErrorMsg("Error", "Triple triad profile not found\nRegister at [https://triad.raelys.com](https://triad.raelys.com)", message);
      }
    }
    // Mentioned User
    else if( args.length > 0 ) {

      if( message.mentions.users.first() ) {

        let tripleTriadData = await tripletriad.getFFTripleTriadData(message.mentions.users.first().id);

        if( lodash.isEmpty(tripleTriadData) == false ) {
          tripletriad.printTripleTriadData(tripleTriadData, message, message.mentions.users.first());
        }
        else {
          helper.sendErrorMsg("Error", "Triple triad profile not found for <@" + message.mentions.users.first().id + ">", message);
        }
      }
    }
  }

  /*************************************************
  **** SUBSCRIBE TO LODESTONE NEWS NOTIFICATIONS
  *************************************************/

  else if ( command === "news" || command === "lodestone" ) {

    if( isAdmin ) {

      if( args.length > 0 ) {

        if( helper.isSuperAdmin(message.author) ) {
          if( args[0] == "bye"  ) {
            lodestone_news.manualPostByeMessage(client);
          }
        }

        if( args[0] == "latest"  ) {
          await lodestone_news.manualPostNews2Channel(message);
        }

        if( args[0] == "add" || args[0] == "sub" || args[0] == "subscribe" ) {

          let categories = config.newsCategories.join(",");
          let existingSub = await lodestone_news.newsChannelGet(message.guild.id);
          let locale = "na";

          switch(language) {
            case("jp"):
              locale = "jp";
              break;
            case("de"):
              locale = "de";
              break;
            case("fr"):
              locale = "fr";
              break;
            case("en"):
            default:
              locale = "na";
          }

          // Overwrite locale
          if( args.length > 1 ) {
            switch(args[1]) {
              case("jp"):
                locale = "jp";
                break;
              case("de"):
                locale = "de";
                break;
              case("fr"):
                locale = "fr";
                break;
              case("eu"):
                locale = "eu";
                break;
              case("na"):
              default:
                locale = "na";
            }
          }

          if( lodash.isEmpty(existingSub) ) {
            await lodestone_news.newsChannelAdd(message, categories, locale);
            helper.sendSuccessMsg("Success", "Future Lodestone news ("+locale.toUpperCase()+") will be automatically posted to this channel", message, true);
            await lodestone_news.sendManualPostNews2ChannelPrompt(message, locale);
          }
          else {
            if( existingSub.channel_id == message.channel.id ) {
              helper.sendErrorMsg("Error", "This channel has already been configured to automatically receive Lodestone news", message, true);
            }
            // Already subscribed in another channel
            else {
              await lodestone_news.newsChannelAdd(message, categories, locale);
              await lodestone_news.updatePostedNewsNewChannel(existingSub.channel_id, message.channel.id);
              helper.sendSuccessMsg("Success", "Future Lodestone news ("+locale.toUpperCase()+") will be automatically posted to this channel instead of `#" + existingSub.channel_name + "`", message, true);
              await lodestone_news.sendManualPostNews2ChannelPrompt(message, locale);
            }
          }
        }

        else if( args[0] == "rm" || args[0] == "remove" || args[0] == "unsub" ) {

          let existingSub = await lodestone_news.newsChannelGet(message.guild.id);

          if( lodash.isEmpty(existingSub) ) {
            helper.sendErrorMsg("Error", "This channel has not been configured to receive Lodestone news", message, true);
          }
          else {
            await lodestone_news.newsChannelRemove(message);
            helper.sendErrorMsg("Unsubscribed!", config.appName + " will no longer post Lodestone news in this channel", message, true);
          }
        }
      }
      else {
        helper.sendErrorMsg("Error", "Subscribe for Lodestone news notifications on this channel with \n`@kweh "+command+" add` \n\nRemove subscription from this channel with \n `@kweh "+command+" remove` \n\nOnly server admins are permitted to execute these commands", message, true);
      }
    }
    else {
      helper.sendErrorMsg("Error", "Only server admins are allowed to change the news settings", message, true);
    }
  }

  /*************************************************
  **** SUBSCRIBE TO FASHION REPORT NOTIFICATION
  *************************************************/

  else if ( command === "fr" || command === "fashion" ) {

    if( args.length > 0 ) {

      if( isAdmin ) {

        if( args[0] == "add" || args[0] == "sub" || args[0] == "subscribe" ) {

          let existingSub = await fashion_report.frChannelGet(message.guild.id);

          if( lodash.isEmpty(existingSub) ) {
            await fashion_report.frChannelAdd(message);
            helper.sendSuccessMsg("Success", "Future fashion reports will be automatically posted to this channel", message, true);
            await fashion_report.sendManualPostFR2ChannelPrompt(message);
          }
          else {
            if( existingSub.channel_id == message.channel.id ) {
              helper.sendErrorMsg("Error", "This channel has already been configured to automatically receive fashion reports", message, true);
            }
            // Already subscribed in another channel
            else {
              await fashion_report.frChannelAdd(message);
              await fashion_report.updateFRNewChannel(existingSub.channel_id, message.channel.id);
              helper.sendSuccessMsg("Success", "Future fashion reports will be automatically posted to this channel instead of `#" + existingSub.channel_name + "`", message, true);
              await fashion_report.sendManualPostFR2ChannelPrompt(message);
            }
          }
        }

        else if( args[0] == "rm" || args[0] == "remove" || args[0] == "unsub" ) {

          let existingSub = await fashion_report.frChannelGet(message.guild.id);

          if( lodash.isEmpty(existingSub) ) {
            helper.sendErrorMsg("Error", "This channel has not been configured to receive fashion reports", message, true);
          }
          else {
            await fashion_report.frChannelRemove(message);
            helper.sendErrorMsg("Unsubscribed!", config.appName + " will no longer post fashion reports in this channel", message, true);
          }
        }

        else {
          helper.sendErrorMsg("Error", "Subscribe for fashion report notifications on this channel with \n`@kweh "+command+" add` \n\nRemove subscription from this channel with \n `@kweh "+command+" remove` \n\nOnly server admins are permitted to execute these commands", message, true);
        }
      }
      else {
        helper.sendErrorMsg("Error", "Only server admins are allowed to change the fashion report settings", message, true);
      }
    }
    else {
      helper.doTyping(message.channel);
      await fashion_report.manualPostFR2Channel(message);
    }
  }

  /*************************************************
  **** Timers
  *************************************************/
  else if ( command === "timer" || command === "reset" || command === "timers" ) {
    eorzea_time.printTimers(message);
  }

  /*************************************************
  **** Maint
  *************************************************/
  else if ( command === "maint" || command === "maintenance" ) {
    eorzea_time.printMaint(message);
  }

  /*************************************************
  **** Eorzea Collection
  *************************************************/
  else if ( command === "eorzeacollection" ||  command === "ec" ) {
    helper.doTyping(message.response_channel);

    if( args.length == 0 ) {
      let eorzea_collection_results = await eorzea_collection.getEorzeaCollection("featured");
      eorzea_collection.printEorzeaCollection(eorzea_collection_results, message);
    }
    else {
      if( args[0] == "latest" ) {
        let eorzea_collection_results = await eorzea_collection.getEorzeaCollection("latest");
        eorzea_collection.printEorzeaCollection(eorzea_collection_results, message);
      }
      else if( args[0] == "loved" || args[0] == "liked" ) {
        let eorzea_collection_results = await eorzea_collection.getEorzeaCollection("loved");
        eorzea_collection.printEorzeaCollection(eorzea_collection_results, message);
      }
      else if( args[0] == "male" ) {
        let eorzea_collection_results = await eorzea_collection.getEorzeaCollection("male");
        eorzea_collection.printEorzeaCollection(eorzea_collection_results, message);
      }
      else if( args[0] == "female" ) {
        let eorzea_collection_results = await eorzea_collection.getEorzeaCollection("female");
        eorzea_collection.printEorzeaCollection(eorzea_collection_results, message);
      }
      else if( args[0] == "author" ) {
        let searchTerm = args.slice(1).join(' ');
        let eorzea_collection_results = await eorzea_collection.getEorzeaCollection("", "", searchTerm);
        eorzea_collection.printEorzeaCollection(eorzea_collection_results, message);
      }
      else if( args[0] == "search" || args[0] == "keyword" ) {
        let searchTerm = args.slice(1).join(' ');
        let eorzea_collection_results = await eorzea_collection.getEorzeaCollection("", searchTerm, "");
        eorzea_collection.printEorzeaCollection(eorzea_collection_results, message);
      }
      else {
        helper.sendErrorMsg("Error", "Lookup Eorzea Collection with \n`@kweh "+command+"` \n`@kweh "+command+" latest` \n`@kweh "+command+" loved` \n`@kweh "+command+" male` \n`@kweh "+command+" female` \n\nLookup by keywords with \n `@kweh "+command+" keyword your_keywords` \n\nLookup by author with \n `@kweh "+command+" author author_name`", message, true);
      }
    }
  }

  /*************************************************
  **** Eorzea Collection
  *************************************************/
  else if ( command === "housingsnap" ||  command === "hs" ) {

    let tag = "";

    if( args.length > 0 ) {
      tag = args.join(' ');
    }

    helper.doTyping(message.response_channel);

    let housing_snap_results = await housing_snap.getHousingSnap(tag);
    housing_snap.printHousingSnap(housing_snap_results, message);
  }

  /*************************************************
  **** DONATE
  *************************************************/
  else if ( command === "donate" ) {
    helper.sendDonateMsg(message);

    message.delete().catch(function(err){
      if( err.code == 50013 ) {
        console.log(err.message);
      }
    });

    return;
  }

  /*************************************************
  **** HELPPPPPP
  *************************************************/
  else if ( command === "help" ) {
    helper.sendHelpMsg(message, prefix);

    message.delete().catch(function(err){
      if( err.code == 50013 ) {
        console.log(err.message);
      }
    });

    return;
  }

  /*************************************************
  **** AUTO DELETION
  *************************************************/
  if( auto_delete ) {
    message.delete().catch(function(err){
      if( err.code == 50013 ) {
        console.log(err.message);
      }
    });
  }
});

/******************************
  Server Settings
*******************************/

function updateServerInfo(serverID, name) {
  pool.query("INSERT INTO servers (server_id, name, date_added, last_active) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), last_active = VALUES(last_active)", [serverID, name, moment().format('YYYY-M-D HH:mm:ss'), moment().format('YYYY-M-D HH:mm:ss')]);
}

function setServerPrefix(serverID, prefix) {
  pool.query("UPDATE servers SET prefix = ? WHERE server_id = ?", [prefix, serverID]);
  resetServerRedisKey(serverID);
}

async function setDefaultChannel(serverID, channelID) {
  await pool.query("INSERT INTO server_default_channel (server_id, channel_id, date_added) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE channel_id = VALUES(channel_id), date_added = VALUES(date_added)", [serverID, channelID, moment().format('YYYY-M-D HH:mm:ss')]);
  resetServerRedisKey(serverID);
}

function removeDefaultChannel(serverID) {
  pool.query("DELETE FROM server_default_channel WHERE server_id = ?", [serverID]);
  resetServerRedisKey(serverID);
}

function enableAutoDelete(serverID) {
  pool.query("UPDATE servers SET auto_delete = 1 WHERE server_id = ?", [serverID]);
  resetServerRedisKey(serverID);
}

function disableAutoDelete(serverID) {
  pool.query("UPDATE servers SET auto_delete = 0 WHERE server_id = ?", [serverID]);
  resetServerRedisKey(serverID);
}

function resetServerRedisKey(serverID) {
  let redisKey = "kweh_server:" + serverID;
  redis.del(redisKey);
}

async function getServerSettings(serverID) {

  let settings = {
    'prefix': config.prefix,
    'language': config.language,
    'default_channel_id': '',
    'default_channel': null,
    'auto_delete': false
  };

  // Check redis first before db
  let redisKey = "kweh_server:" + serverID;
  let serverFrRedis = await redis.get(redisKey).then(function (result) {
    return result;
  });

  if( serverFrRedis ) {
    settings = JSON.parse(serverFrRedis);
  }
  else {
    await readPool.query("SELECT * FROM servers LEFT JOIN server_default_channel ON servers.server_id = server_default_channel.server_id WHERE servers.server_id = ?", [serverID]).then(function(res){
      if( res.length > 0 ) {
        settings['prefix'] = res[0].prefix.length > 0 ? res[0].prefix : settings['prefix'];
        settings['language'] = res[0].language ? res[0].language : settings['language'];
        settings['default_channel_id'] = res[0].channel_id ? res[0].channel_id : '';
        settings['auto_delete'] = res[0].auto_delete == 1 ? true : false;

        redis.set(redisKey, JSON.stringify(settings), "EX", config.redisExpiry);
      }
    })
    .catch(function(err){
      console.log(err);
    });
  }

  if( settings['default_channel_id'] ) {
    let channel = await client.channels.cache.get( settings['default_channel_id'] );

    if( channel ) {
      settings['default_channel'] = channel;
    }
  }

  return settings;
}

function setServerLanguage(serverID, language) {
  pool.query("UPDATE servers SET language = ? WHERE server_id = ?", [language, serverID]);
  resetServerRedisKey(serverID);
}

/******************************
  Server Throttling
*******************************/

async function getCommandsLast5s(serverID) {

  let cmds = 0;
  let curr_datetime = moment().subtract(5, 'seconds').format('YYYY-M-D HH:mm:ss');

  cmds = await readPool.query("SELECT count(*) as cmds FROM commands WHERE server_id = ? AND date_added >= ?", [serverID, curr_datetime]).then(function(res){
    if( res.length > 0 ) {
      return res[0].cmds;
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return cmds;
}

async function throttleCheck(serverID) {

  let cmds = await getCommandsLast5s(serverID);

  helper.printStatus( "Throttle Check No: " + cmds );

  if( cmds > config.throttleLimit )
    return false;
  else
    return true;
}