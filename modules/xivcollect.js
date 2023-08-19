/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const helper = require('../helper');
const axios = require('axios');
const Discord = require("discord.js");

/*********************************
  FFXIVCollect Related Functions
**********************************/

const getFFCollectData = async function(lodestone_id) {

  let ffCollectData = {};
  let apiUrl = config.xivcollectApiBaseURL + "characters/" + lodestone_id;

  await axios.get(apiUrl).then(async function(response){

    if( response.status === 200 ) {
      if( response.data ) {
        ffCollectData = response.data;
      }
    }
  })
  .catch(function(err){
    if(err.response.status==404) {
      console.log("FFXIVCollect Profile not found for: " + lodestone_id);
    }
    else {
      console.log(err);
    }
  });

  return ffCollectData;
}

const getBardingData = async function(message, search_str, is_id = false) {

  let lang = "en";

  switch(message.serverSettings["language"]) {
    case("de"):
      lang = "de";
      break;
    case("fr"):
      lang = "fr";
      break;
    case("jp"):
      lang = "ja";
      break;
    case("en"):
    default:
      lang = "en";
  }

  let bardingData = {};
  let apiUrl = config.xivcollectApiBaseURL + "bardings?name_" + lang + "_cont=" + search_str + "&limit=" + config.itemSearchLimit;

  if( is_id ) {
    apiUrl = config.xivcollectApiBaseURL + "mounts/" + search_str;
  }

  await axios.get(apiUrl).then(async function(response){

    if( response.status === 200 ) {
      if( response.data ) {
        bardingData = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return bardingData;
}

const getMountData = async function(message, search_str, is_id = false) {

  let lang = "en";

  switch(message.serverSettings["language"]) {
    case("de"):
      lang = "de";
      break;
    case("fr"):
      lang = "fr";
      break;
    case("jp"):
      lang = "ja";
      break;
    case("en"):
    default:
      lang = "en";
  }

  let mountData = {};
  let apiUrl = config.xivcollectApiBaseURL + "mounts?name_" + lang + "_cont=" + search_str + "&limit=" + config.itemSearchLimit;

  if( is_id ) {
    apiUrl = config.xivcollectApiBaseURL + "mounts/" + search_str;
  }

  await axios.get(apiUrl).then(async function(response){
    if( response.status === 200 ) {
      if( response.data ) {
        mountData = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return mountData;
}

const getMinionData = async function(message, search_str, is_id = false) {

  let lang = "en";

  switch(message.serverSettings["language"]) {
    case("de"):
      lang = "de";
      break;
    case("fr"):
      lang = "fr";
      break;
    case("jp"):
      lang = "ja";
      break;
    case("en"):
    default:
      lang = "en";
  }

  let minionData = {};
  let apiUrl = config.xivcollectApiBaseURL + "minions?name_" + lang + "_cont=" + search_str + "&limit=" + config.itemSearchLimit;

  if( is_id ) {
    apiUrl = config.xivcollectApiBaseURL + "minions/" + search_str;
  }

  await axios.get(apiUrl).then(async function(response){

    if( response.status === 200 ) {
      if( response.data ) {
        minionData = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return minionData;
}

const getTitleData = async function(message, search_str, is_id = false) {

  let lang = "en";

  switch(message.serverSettings["language"]) {
    case("de"):
      lang = "de";
      break;
    case("fr"):
      lang = "fr";
      break;
    case("jp"):
      lang = "ja";
      break;
    case("en"):
    default:
      lang = "en";
  }

  let titleData = {};
  let apiUrl = config.xivcollectApiBaseURL + "titles?name_" + lang + "_cont=" + search_str + "&limit=" + config.itemSearchLimit;

  if( is_id ) {
    apiUrl = config.xivcollectApiBaseURL + "titles/" + search_str;
  }

  await axios.get(apiUrl).then(async function(response){

    if( response.status === 200 ) {
      if( response.data ) {
        titleData = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return titleData;
}

const getEmoteData = async function(message, search_str, is_id = false) {

  let lang = "en";

  switch(message.serverSettings["language"]) {
    case("de"):
      lang = "de";
      break;
    case("fr"):
      lang = "fr";
      break;
    case("jp"):
      lang = "ja";
      break;
    case("en"):
    default:
      lang = "en";
  }

  let emoteData = {};
  let apiUrl = config.xivcollectApiBaseURL + "emotes?name_" + lang + "_cont=" + search_str + "&limit=" + config.itemSearchLimit;

  if( is_id ) {
    apiUrl = config.xivcollectApiBaseURL + "emotes/" + search_str;
  }

  await axios.get(apiUrl).then(async function(response){

    if( response.status === 200 ) {
      if( response.data ) {
        emoteData = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return emoteData;
}

const getAchievementData = async function(message, search_str, is_id = false) {

  let lang = "en";

  switch(message.serverSettings["language"]) {
    case("de"):
      lang = "de";
      break;
    case("fr"):
      lang = "fr";
      break;
    case("jp"):
      lang = "ja";
      break;
    case("en"):
    default:
      lang = "en";
  }

  let achievementData = {};
  let apiUrl = config.xivcollectApiBaseURL + "achievements?name_" + lang + "_cont=" + search_str;

  if( is_id ) {
    apiUrl = config.xivcollectApiBaseURL + "achievements/" + search_str;
  }

  await axios.get(apiUrl).then(async function(response){

    if( response.status === 200 ) {
      if( response.data ) {
        achievementData = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return achievementData;
}

/******************************
  All in one embed
*******************************/

const printItemInfo = async function(item, message) {

  // Embed
  let embed = new Discord.MessageEmbed()
    .setColor(config.defaultEmbedColor)
    .setAuthor({name: item.name})
    .setFooter({text: "Powered by ffxivcollect.com"});

  if( item.icon ) {
    embed.setThumbnail(item.icon);
  }

  let description = item.description;

  if( item.enhanced_description ) {
    description += "\n\n" + item.enhanced_description;
  }

  if( description ) {
    embed.setDescription(description);
  }

  if( item.seats ) {
    embed.addFields({ name: "Riders", value: String(item.seats) });
  }

  if( item.sources && item.sources.length > 0 ) {
    let sources = "";

    for(var i=0; i<item.sources.length; i++) {
      if( item.sources[i].type == "Premium" ) {
        sources += item.sources[i].text + "\n";
      }
      else if( item.sources[i].type == "Achievement" && item.sources[i].related_id ) {
        let achievement = await getAchievementData(message, item.sources[i].related_id, true);

        if( achievement.description ) {
          sources += item.sources[i].type + ": " + item.sources[i].text + " - " + achievement.description + "\n";
        }
      }
      else {
        sources += item.sources[i].type + ": " + item.sources[i].text + "\n";
      }
    }

    if( sources ) {
      embed.addFields({ name: item.sources.length == 1 ? "Source" : "Sources", value: String(sources) });
    }
  }

  // Emote
  if( item.command ) {
    embed.addFields({ name: "Command", value: String(item.command) });

    if( item.category && item.category.name ) {
      embed.addFields({ name: "Category", value: String(item.category.name) });
    }
  }

  // Title
  if( item.female_name && item.female_name != item.name ) {
    embed.addFields({ name: "Male", value: String(item.name) });
    embed.addFields({ name: "Female", value: String(item.female_name) });
  }

  if( item.achievement ) {
    let source = item.achievement.description ? "Achievement: " + item.achievement.description : "";

    if( source ) {
      embed.addFields({ name: "Source", value: String(source) });
    }

    embed.setThumbnail("");
  }

  if( item.owned ) {
    embed.addFields({ name: "Owned", value: String(item.owned) });
  }

  if( item.image ) {
    embed.setImage(item.image);
  }

  // Channel
  let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

  // Send Message
  await channel.send({ embeds: [embed] })
  .catch(function(err){
    console.log(err);
  });
}

/******************************
  Multiple Matched Item
*******************************/

const handleMultipleItems = async function(itemMatchResult, searchedItem, message) {
  // multiple matching results
  let options = await sendMultipleItemsMatchedMsg(itemMatchResult.results, searchedItem, message);

  // Ensure text entered is one of the options in above array
  let multipleItemsfilter = function response(m){
    return options.includes( parseInt(m.content) );
  };

  // Await Reply
  message.response_channel.awaitMessages({ multipleItemsfilter, max: 1, time: config.userPromptsTimeout }).then(async function(collected){
    let specificItem = itemMatchResult.results[ collected.first().content - 1 ];

    await printItemInfo(specificItem, message);

    // Auto Delete
    if( message.serverSettings["auto_delete"] ) {
      collected.first().delete().catch(function(err){
        if( err.code == 50013 ) {
          console.log(err.message);
        }
      });
    }

  }).catch(function(collected){
    helper.sendErrorMsg("Error", "No item was specified", message);
  });
}

/******************************
  Multiple Matched Item Prompt
*******************************/
const sendMultipleItemsMatchedMsg = async function(items, searchedKeyword, message){

  let options = [];

  if(items.length > 0) {
    // Embed
    let embed = new Discord.MessageEmbed()
      .setColor(config.defaultEmbedColor)
      .setAuthor({name: searchedKeyword})
      .setFooter({text: "Powered by ffxivcollect.com"});

    let description = "Which item are you looking for?\n";

    for(var i=0; i<items.length; i++) {
      description+= "\n" + (i+1) + ". " + items[i].name;
      options.push(i+1);
    }

    embed.setDescription(description);

    // Channel
    let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

    // Send Message
    await channel.send({ embeds: [embed] }).catch(function(err){
      console.log(err);
    });
  }

  return options;
}

/******************************
  Exports
*******************************/

module.exports = {
  getFFCollectData,
  getMountData,
  getMinionData,
  getTitleData,
  getAchievementData,
  getEmoteData,
  getBardingData,
  printItemInfo,
  sendMultipleItemsMatchedMsg,
  handleMultipleItems
}