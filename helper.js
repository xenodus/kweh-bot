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

// Print to console with timestamp prefix
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

const sendHelpMsg = function(message, prefix) {
  // Embed
  let embed = new Discord.MessageEmbed()
    .setDescription("You can also edit your server settings on the official website.")
    .setColor( config.defaultEmbedColor )
    .setAuthor({name: "Kweh! - Help"})
    .setThumbnail( config.appErrorImg );

  embed.addField("Prefix for " + message.guild.name, prefix);
  embed.addField("Website", "["+config.websiteLink+"]("+config.websiteLink+")");
  embed.addField("Full Command List", "["+config.websiteCommandLink+"]("+config.websiteCommandLink+")");

  embed.addField("Commands", "--------------------");

  let i = 1;

  // !register
  let registerCommands = [
    "`" + prefix + "register server firstname lastname`"
  ];
  embed.addField((i++)+". Link FFXIV Character", registerCommands.join("\n"));

  // !me
  let selfProfileCommands = [
    "`" + prefix + "me`",
  ];
  embed.addField((i++)+". View Character Profile (Self)", selfProfileCommands.join("\n"));

  // !profile @xenodus
  let otherProfileCommands = [
    "`" + prefix + "profile server firstname lastname`",
    "`" + prefix + "profile @user`",
    "`" + prefix + "profile`",
  ];
  embed.addField((i++)+". View Character Profile (Others)", otherProfileCommands.join("\n"));

  // !glam
  let glamCommands = [
    "`" + prefix + "glam server firstname lastname`",
    "`" + prefix + "glam @user`",
    "`" + prefix + "profile`",
  ];
  embed.addField((i++)+". View Glamour Report", glamCommands.join("\n"));

  // !ec
  let ecCommands = [
    "`" + prefix + "ec`",
    "`" + prefix + "ec latest/loved/male/female`",
    "`" + prefix + "ec author author_name`",
    "`" + prefix + "ec search search_string`",
  ];
  embed.addField((i++)+". Eorzea Collection", ecCommands.join("\n"));

  // !hs
  let hsCommands = [
    "`" + prefix + "hs`",
    "`" + prefix + "hs search_string`",
  ];
  embed.addField((i++)+". Housing Snap", hsCommands.join("\n"));

  // !logs @xenodus
  let logsCommands = [
    "`" + prefix + "fflogs server firstname lastname`",
    "`" + prefix + "fflogs @user`",
    "`" + prefix + "fflogs`",
  ];
  embed.addField((i++)+". FF Logs", logsCommands.join("\n"));

  // !mb
  let mbCommands = [
    "`" + prefix + "mb datacenter/server item_name`",
  ];
  embed.addField((i++)+". Marketboard", mbCommands.join("\n"));

  // !item / mount / minion / emote / title / barding
  let itemCommands = [
    "`" + prefix + "item item_name`",
  ];
  embed.addField((i++)+". Item Search", itemCommands.join("\n"));

  // !mount / minion / emote / title / barding
  let xivCollectCommands = [
    "`" + prefix + "mount search_string`",
    "`" + prefix + "minion search_string`",
    "`" + prefix + "emote search_string`",
    "`" + prefix + "title search_string`",
    "`" + prefix + "barding search_string`",
  ];
  embed.addField((i++)+". FFXIV Collect Search", xivCollectCommands.join("\n"));

  // !timers
  let timersCommands = [
    "`" + prefix + "timers`",
  ];
  embed.addField((i++)+". Timers", timersCommands.join("\n"));

  // !maint
  let maintCommands = [
    "`" + prefix + "maint`",
  ];
  embed.addField((i++)+". Maintenance", maintCommands.join("\n"));

  // !tt
  let ttCommands = [
    "`" + prefix + "tt`",
    "`" + prefix + "tt @user`",
  ];
  embed.addField((i++)+". Triple Triad", ttCommands.join("\n"));

  // !news
  let newsCommands = [
    "`" + prefix + "news add`",
    "`" + prefix + "news add na/eu/jp/de/fr`",
    "`" + prefix + "news remove`",
  ];
  embed.addField((i++)+". Subscribe To Receive Lodestone News - Admin Only", newsCommands.join("\n"));

  // !fashion
  let frCommands = [
    "`" + prefix + "fashion add`",
    "`" + prefix + "fashion remove`",
  ];
  embed.addField((i++)+". Subscribe To Receive Fashion Report - Admin Only", frCommands.join("\n"));

  // !kweh language
  let langCommands = [
    "`" + prefix + "kweh language jp/en/fr/de`",
  ];
  embed.addField((i++)+". Change Server Language - Admin Only", langCommands.join("\n"));

  // !kweh channel
  let defaultChannelCommands = [
    "`" + prefix + "kweh channel #your-channel-name`",
    "`" + prefix + "kweh channel remove`",
  ];
  embed.addField((i++)+". Set Default Channel - Admin Only", defaultChannelCommands.join("\n"));

  // !kweh autodelete
  let autoDeleteCommands = [
    "`" + prefix + "kweh autodelete on`",
    "`" + prefix + "kweh autodelete off`",
  ];
  embed.addField((i++)+". Auto Deletion of Commands - Admin Only", autoDeleteCommands.join("\n"));

  // !kweh prefix
  let prefixCommands = [
    "`" + prefix + "kweh prefix ?`",
  ];
  embed.addField((i++)+". Change Server Prefix - Admin Only", prefixCommands.join("\n"));

  embed.addField("Support Kweh!", "["+config.donationLink+"]("+config.donationLink+")");

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
  sendHelpMsg,
  sendDonateMsg,
  handleDiscordError,
  doTyping
}