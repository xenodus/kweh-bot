/******************************
  Variables & Libs
*******************************/

const config = require('../../config').production;
const axios = require('axios');
const Discord = require("discord.js");
const lodash = require('lodash');
const moment = require("moment");

const pool = config.getPool();

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

  // Check if data in own DB first
  let itemFrDB = await pool.query("SELECT * FROM items WHERE item_id = ? AND type = ?", [itemID, type]).then(function(res){
    if( res.length > 0 ) {
      return res[0];
    }
  });

  if( itemFrDB ) {
    itemInfo = JSON.parse(itemFrDB.data);
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
        }
      }
    })
    .catch(function(err){
      console.log(err);
    });

    if( itemInfo && !itemFrDB ) {

      let curr_datetime = moment().format('YYYY-M-D HH:mm:ss');

      pool.query(`INSERT INTO items
        (item_id, type, data, date_added) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE type = VALUES(type), data = VALUES(data), date_added = VALUES(date_added)`, [itemID, type, JSON.stringify(itemInfo), curr_datetime]);
    }
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
  sendMultipleItemsMatchedMsg
}