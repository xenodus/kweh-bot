/******************************
  Variables & Libs
*******************************/

const config = require('../../config').production;
const axios = require('axios');
const Discord = require("discord.js");
const lodash = require('lodash');
const moment = require("moment");

const pool = config.getPool();
const readPool = config.getReadPool();

const redis = config.getRedis();

/******************************
  Functions
*******************************/

async function searchItemByName(itemName) {

  let itemInfo = [];
  let apiUrl = config.xivApiBaseURL + "search";
  apiUrl += "?string=" + encodeURIComponent(itemName);
  // apiUrl += "&string_algo=match";
  apiUrl += "&indexes=Item";
  apiUrl += "&limit=" + config.itemSearchLimit;
  apiUrl += "&private_key=" + config.xivApiToken
  apiUrl += "&language=fr";

  await axios.get(apiUrl).then(async function(response){
    if( response.status === 200 ) {
      if( response.data && response.data.Pagination.Results > 0 ) {
        itemInfo = response.data.Results;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return itemInfo;
}

async function getItemByID(itemID, type="item") {

  let itemInfo = {};

  // Check redis first before api
  let redisKey = "kweh_item:" + itemID;
  let itemFrRedis = await redis.get(redisKey).then(function (result) {
    return result;
  });

  if( itemFrRedis ) {
    itemInfo = JSON.parse(itemFrRedis);
    console.log("Found in redis: " + itemID);
  }
  // Else fetch from xivapi
  else {
    let apiUrl = config.xivApiBaseURL + type + "/";
    apiUrl += itemID;
    apiUrl += "?private_key=" + config.xivApiToken;

    await axios.get(apiUrl).then(async function(response){
      if( response.status === 200 ) {
        if( response.data ) {
          itemInfo = response.data;

          console.log("Found in xivapi: " + itemID);
          redis.set(redisKey, JSON.stringify(itemInfo), "EX", config.redisExpiry);
        }
      }
    })
    .catch(function(err){
      console.log(err);
    });
  }

  return itemInfo;
}

async function displayItem(item, message) {

  // console.log(item);

  // Embed
  let embed = new Discord.MessageEmbed()
    .setColor(config.defaultEmbedColor)
    .setAuthor(item.Name_fr, config.xivApiLogo)
    .setThumbnail(config.xivApiBaseURL + item.Icon)
    .setFooter("Powered by xivapi.com");

  let linksTxt = "[Teamcraft](" + config.teamcraftBaseURL + "fr/item/" + item.ID + ")";

  if( item.Description_ja ) {
    embed.setDescription(item.Description_fr.replace(/\r?\n|\r/g, ' '));
  }

  // Is equipment
  if( item.EquipSlotCategoryTargetID > 0 ) {

    if( item.LevelItem ) {
      embed.addField("ilvl", item.LevelItem);
    }

    if( item.LevelEquip ) {
      embed.addField("Niveau", item.LevelEquip);
    }

    embed.addField("Teintable", item.IsDyeable == 0 ? 'Non' : 'Oui');
  }

  if( item.Recipes && item.Recipes.length > 0 ) {
    // Get Recipe
    let recipe = await getItemByID(item.Recipes[0].ID, "recipe");

    // Process Recipe
    if( lodash.isEmpty(recipe) == false ) {

      let ingredientsExhausted = false;
      let i = 0;
      let ingredientsTxt = "";

      while(ingredientsExhausted == false) {
        if( recipe["ItemIngredient" + i] ) {
          ingredientsTxt += "\n[" + recipe["ItemIngredient" + i].Name_fr + "]("+config.teamcraftBaseURL + "fr/item/" + recipe["ItemIngredient"+i].ID + ") x " + recipe["AmountIngredient" + i];
          i++;
        }
        else {
          ingredientsExhausted = true;
        }
      }

      if( recipe.ClassJob && recipe.ClassJob.Name_fr ) {
        embed.addField("Job", recipe.ClassJob.Name_fr);
      }

      if( ingredientsTxt ) {
        embed.addField("Recettes", ingredientsTxt);
      }

      if( recipe["SecretRecipeBook"] ) {
        embed.addField("Livre de recettes", recipe["SecretRecipeBook"].Name_fr );
      }
    }
  }

  // Delete Self Recipe
  if( item.GameContentLinks.Recipe && "ItemResult" in item.GameContentLinks.Recipe ) {
    delete item.GameContentLinks.Recipe["ItemResult"];
  }

  if( item.GameContentLinks && item.GameContentLinks.Recipe && lodash.isEmpty(item.GameContentLinks.Recipe) == false ) {
    let usedForTxt = ":hourglass_flowing_sand:";
    embed.addField("Fabrication", usedForTxt);
  }

  if( linksTxt ) {
    embed.addField("Liens", linksTxt);
  }

  // Channel
  let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

  // Send Message
  await channel.send( embed )
  .then(async function(m){
    if( item.GameContentLinks && item.GameContentLinks.Recipe && lodash.isEmpty(item.GameContentLinks.Recipe) == false ) {
      await displayUsedFor(m, item);
    }
  })
  .catch(function(err){
    console.log(err);
  });
}

async function displayUsedFor(message, item) {

  let usedForTxt = "";
  let limit = 5;
  let itemsProcessed = 0;
  let totalItems = 0;

  for(var key in item.GameContentLinks.Recipe) {

    let itemIDs = item.GameContentLinks.Recipe[key];
    totalItems += item.GameContentLinks.Recipe[key].length;

    if( itemIDs.length && itemsProcessed < limit ) {

      for(var i=0; i<itemIDs.length; i++) {

        if( itemsProcessed == limit ){
          break;
        }

        let craftedItem = await getItemByID( itemIDs[i], "recipe" );
        let newItemTxt = "\n[" + craftedItem.Name_fr + "](" + config.teamcraftBaseURL + "fr/item/" + craftedItem.ID + ")";

        if( (usedForTxt.length + usedForTxt.length) < 1024 ) {
          usedForTxt += newItemTxt;
        }

        itemsProcessed++;
      }
    }
  }

  if( totalItems > limit ) {
    usedForTxt += "\n [ + " + (totalItems - limit) + " articles](" + config.teamcraftBaseURL + "fr/item/" + item.ID + ")";
  }

  let embed = message.embeds[0];

  for(var i=0; i<embed.fields.length; i++) {
    if(embed.fields[i].name == "Fabrication") {
      embed.fields[i].value = usedForTxt;
    }
  }

  message.edit( embed );
}

/******************************
  Multiple Matched Item
*******************************/

const handleMultipleItems = async function(itemMatchResult, searchedItem, message) {
  // multiple matching results
  let options = await sendMultipleItemsMatchedMsg(itemMatchResult, searchedItem, message);

  // Ensure text entered is one of the options in above array
  let multipleItemsfilter = function response(m){
    return options.includes( parseInt(m.content) );
  };

  // Await Reply
  message.response_channel.awaitMessages(multipleItemsfilter, { max: 1, time: config.userPromptsTimeout }).then(async function(collected){
    let specificItem = itemMatchResult[ collected.first().content - 1 ];
    let specificItemInfo = await getItemByID( specificItem.ID );
    // print result
    displayItem(specificItemInfo, message);

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
      .setAuthor(searchedKeyword, config.xivApiLogo);

    let description = "Quel article recherchez-vous?\n";

    for(var i=0; i<items.length; i++) {
      description+= "\n" + (i+1) + ". " + items[i].Name;
      options.push(i+1);
    }

    embed.setDescription(description);

    // Channel
    let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

    // Send Message
    await channel.send(embed).catch(function(err){
      console.log(err);
    });
  }

  return options;
}

/******************************
  Exports
*******************************/

module.exports = {
  searchItemByName,
  getItemByID,
  displayItem,
  sendMultipleItemsMatchedMsg,
  handleMultipleItems,
  displayUsedFor
}