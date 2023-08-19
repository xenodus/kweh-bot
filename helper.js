/******************************
  Variables & Libs
*******************************/

const moment = require("moment");
const config = require('./config').production;
const pool = config.getPool();
const Discord = require("discord.js");
var Hashids = require('hashids');

/******************************
  Helper Functions
*******************************/

const doTyping = function(channel) {
  if( channel.type != "GUILD_VOICE" ) {
    channel.sendTyping();
  }
}

// https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
const handleDiscordError = function(err, message) {
  console.log(err)

  switch (err.code) {
    case 50007:
      message.channel.send("Discord error: " + err.message + "\n" + "Please ensure `Allow direct messages from server members` is enabled in `Settings > Privacy & safety` or in this `server's privacy settings`.");
      break;
    case 50001:
      message.author.send("Discord error: " + err.message + "\n" + "Please ensure " + config.appName + " bot has access to the channel");
      break;
    case 50013:
      message.author.send("Discord error: " + err.message + "\n" + "Please ensure " + config.appName + " bot has permissions to send messages, embed links & attach files to the channel");
      break;
    default:
      break;
  }
}

const sendErrorMsg = function(errorTitle="", errorMsg="", message, ignoreDefaultChannel=false) {
    // Embed
    let embed = new Discord.MessageEmbed()
      .setColor(config.errorEmbedColor)
      .setTitle(errorTitle)
      .setDescription(errorMsg)
      .setThumbnail(config.appErrorImg);

    // Channel
    let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

    if( ignoreDefaultChannel ) channel = message.channel;

    // Send Message
    channel.send({embeds: [embed]}).catch(function(err){
      console.log(err);
    });
}

const sendSuccessMsg = function(successTitle="", successMsg="", message, ignoreDefaultChannel=false) {
    // Embed
    let embed = new Discord.MessageEmbed()
      .setColor(config.successEmbedColor)
      .setTitle(successTitle)
      .setDescription(successMsg)
      .setThumbnail(config.appSuccessImg);

    // Channel
    let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

    if( ignoreDefaultChannel ) channel = message.channel;

    // Send Message
    channel.send({embeds: [embed]}).catch(function(err){
      console.log(err);
    });
}

const sendInfoMsg = function(infoTitle="", infoMsg="", message, ignoreDefaultChannel=false) {
    // Embed
    let embed = new Discord.MessageEmbed()
      .setColor(config.infoEmbedColor)
      .setTitle(infoTitle)
      .setDescription(infoMsg)
      .setThumbnail(config.appSuccessImg);

    // Channel
    let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

    if( ignoreDefaultChannel ) channel = message.channel;

    // Send Message
    channel.send({embeds: [embed]}).catch(function(err){
      console.log(err);
    });
}

const isAdmin = function(member) {
  if (  member.permissions.has('ADMINISTRATOR') ||
        member.permissions.has('MANAGE_CHANNELS') ||
        Object.keys(config.adminIDs).includes(member.id) )
    return true;
  else
    return false;
}

const isSuperAdmin = function(member) {
  if ( Object.keys(config.adminIDs).includes(member.id) )
    return true;
  else
    return false;
}

// Print to console with timestamp
const printStatus = function(text) {
  console.log( "[" + moment().format() + "] " + text );
}

// Log Commands Issued
const logCommands = async function(message, isAdmin, post2logs=false) {

  if( post2logs ) {
    console.log("----------------------------------------------");
    this.printStatus( "Server: " + message.guild.name );
    this.printStatus( "Message: " + message.content );
    this.printStatus( "Author: " + message.author.username );
    this.printStatus( "Language: " + message.serverSettings.language );
    this.printStatus( "Is Admin: " + isAdmin );
    console.log("----------------------------------------------");
  }

  let insertId = 0;

  await pool.query("INSERT INTO commands (command, user_id, username, server_id, date_added) VALUES (?, ?, ?, ?, ?)", [message.content, message.author.id, message.author.username, message.guild.id, moment().format('YYYY-M-D HH:mm:ss')])
  .then(function(res){
    if( res.insertId > 0 ) {
      let hashid = new Hashids('KWEH_BOT', 6, 'abcdefghijklmnopqrstuvwxyz'); // pad to length 10
      pool.query("UPDATE commands SET hash = ? WHERE id = ?", [ hashid.encode(res.insertId), res.insertId ]);

      insertId = res.insertId;
    }
  })
  .catch(function(error){
    console.log(error);
    console.log(message);
  });

  return insertId;
}

const sendNewHelpMsg = function(message) {
  // Embed
  let embed = new Discord.MessageEmbed()
    .setDescription("You can also edit your server settings on the official website.")
    .setColor( config.defaultEmbedColor )
    .setAuthor({name: "Kweh! - Help"})
    .setThumbnail( config.appErrorImg );

  embed.addFields(
    { name: "Website", value: "["+config.websiteLink.replace("https://", "")+"]("+config.websiteLink+")" },
    { name: "Full Command List", value: "["+config.websiteCommandLink.replace("https://", "")+"]("+config.websiteCommandLink+")" },
    { name: "Commands", value: "--------------------" }
  );

  let i = 1;

  // !register
  let registerCommands = [
    "`@kweh register server firstname lastname`"
  ];
  embed.addFields({ name: (i++)+". Link FFXIV Character", value: registerCommands.join("\n") });

  // !me
  let selfProfileCommands = [
    "`@kweh me`",
  ];
  embed.addFields({ name: (i++)+". View Character Profile (Self)", value: selfProfileCommands.join("\n") });

  // !profile @xenodus
  let otherProfileCommands = [
    "`@kweh profile server firstname lastname`",
    "`@kweh profile @user`",
    "`@kweh profile`",
  ];
  embed.addFields({ name: (i++)+". View Character Profile (Others)", value: otherProfileCommands.join("\n") });

  // !glam
  let glamCommands = [
    "`@kweh glam server firstname lastname`",
    "`@kweh glam @user`",
    "`@kweh profile`",
  ];
  embed.addFields({ name: (i++)+". View Glamour Report", value: glamCommands.join("\n") });

  // !ec
  let ecCommands = [
    "`@kweh ec`",
    "`@kweh ec latest/loved/male/female`",
    "`@kweh ec author author_name`",
    "`@kweh ec search search_string`",
  ];
  embed.addFields({ name: (i++)+". Eorzea Collection", value: ecCommands.join("\n") });

  // !hs
  let hsCommands = [
    "`@kweh hs`",
    "`@kweh hs search_string`",
  ];
  embed.addFields({ name: (i++)+". Housing Snap", value: hsCommands.join("\n") });

  // !logs @xenodus
  let logsCommands = [
    "`@kweh fflogs server firstname lastname`",
    "`@kweh fflogs @user`",
    "`@kweh fflogs`",
  ];
  embed.addFields({ name: (i++)+". FF Logs", value: logsCommands.join("\n") });

  // !mb
  let mbCommands = [
    "`@kweh mb region/datacenter/server item_name`",
  ];
  embed.addFields({ name: (i++)+". Marketboard", value: mbCommands.join("\n") });

  // !item / mount / minion / emote / title / barding
  let itemCommands = [
    "`@kweh item item_name`",
  ];
  embed.addFields({ name: (i++)+". Item Search", value: itemCommands.join("\n") });

  // !mount / minion / emote / title / barding
  let xivCollectCommands = [
    "`@kweh mount search_string`",
    "`@kweh minion search_string`",
    "`@kweh emote search_string`",
    "`@kweh title search_string`",
    "`@kweh barding search_string`",
  ];
  embed.addFields({ name: (i++)+". FFXIV Collect Search", value: xivCollectCommands.join("\n") });

  // !timers
  let timersCommands = [
    "`@kweh timers`",
  ];
  embed.addFields({ name: (i++)+". Timers", value: timersCommands.join("\n") });

  // !maint
  let maintCommands = [
    "`@kweh maint`",
  ];
  embed.addFields({ name: (i++)+". Maintenance", value: maintCommands.join("\n") });

  // !tt
  let ttCommands = [
    "`@kweh tt`",
    "`@kweh tt @user`",
  ];
  embed.addFields({ name: (i++)+". Triple Triad", value: ttCommands.join("\n") });

  // !news
  let newsCommands = [
    "`@kweh news add`",
    "`@kweh news add na/eu/jp/de/fr`",
    "`@kweh news remove`",
  ];
  embed.addFields({ name: (i++)+". Subscribe To Receive Lodestone News - Admin Only", value: newsCommands.join("\n") });

  // !fashion
  let frCommands = [
    "`@kweh fashion add`",
    "`@kweh fashion remove`",
  ];
  embed.addFields({ name: (i++)+". Subscribe To Receive Fashion Report - Admin Only", value: frCommands.join("\n") });

  // !kweh language
  let langCommands = [
    "`@kweh language jp/en/fr/de`",
  ];
  embed.addFields({ name: (i++)+". Change Server Language - Admin Only", value: langCommands.join("\n") });

  // !kweh channel
  let defaultChannelCommands = [
    "`@kweh channel #your-channel-name`",
    "`@kweh channel remove`",
  ];
  embed.addFields({ name: (i++)+". Set Default Channel - Admin Only", value: defaultChannelCommands.join("\n") });

  // !kweh autodelete
  let autoDeleteCommands = [
    "`@kweh autodelete on`",
    "`@kweh autodelete off`",
  ];
  embed.addFields({ name: (i++)+". Auto Deletion of Commands - Admin Only", value: autoDeleteCommands.join("\n") });

  embed.addFields({ name: "Support Kweh!", value: "["+config.donationLink.replace("https://", "")+"]("+config.donationLink+")" });

  message.author.send({embeds: [embed]}).catch(function(err){
    handleDiscordError(err, message);
  });
}

const sendDonateMsg  = function(message) {

  let embed = new Discord.MessageEmbed()
    .setTitle("Help support " + config.appName + "!")
    .setColor( config.defaultEmbedColor )
    .setThumbnail( config.appLogo )
    .setURL( config.donationLink )
    .setDescription("If you've found the bot useful and would like to donate, you can do so via the link below. Donations will be used to cover server hosting fees. Kwehhhh (Thanks)!");

  message.author.send({embeds: [embed]});
  message.author.send("Patreon link: <"+config.donationLink+">");
}

/******************************
  Exports
*******************************/

module.exports = {
  isAdmin,
  isSuperAdmin,
  printStatus,
  logCommands,
  sendErrorMsg,
  sendSuccessMsg,
  sendInfoMsg,
  sendNewHelpMsg,
  sendDonateMsg,
  handleDiscordError,
  doTyping
}