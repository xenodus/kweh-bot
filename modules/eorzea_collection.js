/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const Discord = require("discord.js");
const axios = require('axios');
const lodash = require('lodash');
const helper = require('../helper');

/******************************
  Eorzea Collection Functions
*******************************/

const loadNextImg = async function(reaction, direction="asc") {

  // Determine current slide with footer text
  if( reaction.message.embeds[0].footer &&
      reaction.message.embeds[0].fields.length > 0 &&
      reaction.message.embeds[0].footer.text &&
      reaction.message.embeds[0].footer.text.includes(".") ) {

    let currFooter = reaction.message.embeds[0].footer.text;
    let currSlide = currFooter.split(".").length > 0 ? currFooter.split(".")[0] : null;
    let nextIndex = null;

    if( direction == "asc" ) {
      if( currSlide < reaction.message.embeds[0].fields.length-1 ) {
        nextIndex = currSlide; // display # is -1 of index so no need to +1
      }
      else {
        nextIndex = 0; // reset
      }
    }
    // desc
    else {
      if( currSlide == 1 ) {
        nextIndex = reaction.message.embeds[0].fields.length-2;
      }
      else {
        nextIndex = currSlide-2;
      }
    }

    // Get Next Slide's URL + Image
    let nextSlideURLMatch = reaction.message.embeds[0].fields[nextIndex].value.match(/\(.*?\)/g);
    let nextSlideURL = null;
    let nextSlideImg = null;

    if( nextSlideURLMatch.length == 2 ) {
      nextSlideURL = nextSlideURLMatch[0].slice(1, nextSlideURLMatch[0].length-1);
      nextSlideImg = nextSlideURLMatch[1].slice(1, nextSlideURLMatch[1].length-1);
    }

    // Update Img + Footer
    reaction.message.embeds[0].footer.text = reaction.message.embeds[0].fields[nextIndex].name;

    // Remove "Showing" from currSlide
    reaction.message.embeds[0].fields[currSlide-1].name = reaction.message.embeds[0].fields[currSlide-1].name.slice(0, -10);
    reaction.message.embeds[0].fields[nextIndex].name += " (Showing)";

    if( nextSlideImg ) {
      let itemInfo = await getGlamDetails(nextSlideURL, reaction.message);
      await updateEquipmentInfo(itemInfo, reaction.message, nextSlideImg);
      await reaction.message.reactions.removeAll();
      await resetReactions(reaction.message);
    }
  }
}

const loadGlamNo = async function(reaction, emoji_name) {

  let no = null;

  switch(emoji_name) {
    case '1️⃣':
      no = 1;
      break;
    case '2️⃣':
      no = 2;
      break;
    case '3️⃣':
      no = 3;
      break;
    case '4️⃣':
      no = 4;
      break;
    case '5️⃣':
      no = 5;
      break;
  }

  // Determine current slide with footer text
  if( no &&
      reaction.message.embeds[0].footer &&
      reaction.message.embeds[0].fields.length > 2 &&
      reaction.message.embeds[0].footer.text &&
      reaction.message.embeds[0].footer.text.includes(".") ) {

    let currFooter = reaction.message.embeds[0].footer.text;
    let currSlide = currFooter.split(".").length > 0 ? currFooter.split(".")[0] : null;
    let nextIndex = no - 1;

    if( no <= (reaction.message.embeds[0].fields.length - 1) ) {
      // Get Next Slide's URL + Image
      let nextSlideURLMatch = reaction.message.embeds[0].fields[nextIndex].value.match(/\(.*?\)/g);
      let nextSlideURL = null;
      let nextSlideImg = null;

      if( nextSlideURLMatch.length == 2 ) {
        nextSlideURL = nextSlideURLMatch[0].slice(1, nextSlideURLMatch[0].length-1);
        nextSlideImg = nextSlideURLMatch[1].slice(1, nextSlideURLMatch[1].length-1);
      }

      // Update Img + Footer
      reaction.message.embeds[0].footer.text = reaction.message.embeds[0].fields[nextIndex].name;

      // Remove "Showing" from currSlide
      reaction.message.embeds[0].fields[currSlide-1].name = reaction.message.embeds[0].fields[currSlide-1].name.slice(0, -10);
      reaction.message.embeds[0].fields[nextIndex].name += " (Showing)";

      if( nextSlideImg ) {
        let itemInfo = await getGlamDetails(nextSlideURL, reaction.message);
        await updateEquipmentInfo(itemInfo, reaction.message, nextSlideImg);
        await reaction.message.reactions.removeAll();
        await resetReactions(reaction.message);
      }
    }
  }
}

const getGlamDetails = async function(url, message) {

  let item = {};
  let apiUrl = "https://kwehbot.xyz/api/eorzeacollection/getByURL?url=" + url;

  await axios.get(apiUrl).then(async function(response){
    if( response.status === 200 ) {
      if( response.data ) {
        item = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return item;
}

const printEorzeaCollection = async function(eorzeaCollectionResult, message) {

  if( eorzeaCollectionResult.results.length > 0 ) {

    let limit = 5;

    if( eorzeaCollectionResult.results.length >= limit ) {
      eorzeaCollectionGlams = eorzeaCollectionResult.results.slice(0, limit);
    }
    else {
      eorzeaCollectionGlams = eorzeaCollectionResult.results;
    }

    // Embed
    let embed = new Discord.MessageEmbed()
      .setColor(config.defaultEmbedColor);

    if( eorzeaCollectionResult.title && eorzeaCollectionResult.url ) {
      embed.setAuthor({name: eorzeaCollectionResult.title, iconURL: config.eorzeaCollectionLogo, url: encodeURI(eorzeaCollectionResult.url)});
    }

    let description = "";

    if( eorzeaCollectionResult.description ) {
      description += eorzeaCollectionResult.description;
    }

    if( eorzeaCollectionGlams.length > 1 ) {
      description += "\nUse the :arrow_left: :arrow_right: reaction buttons below to select which glamour details to be displayed.";
    }

    embed.setDescription(description);

    let randomIndex;
    let randomItem;

    if( eorzeaCollectionGlams[0].img ) {
      randomIndex = Math.floor(Math.random() * eorzeaCollectionGlams.length);
      randomItem = eorzeaCollectionGlams[randomIndex];
      embed.setImage(randomItem.img);

      // No need footer label with # if only 1 result
      if( eorzeaCollectionGlams.length > 1 ) {
        embed.setFooter({text: (randomIndex+1) + '. ' + randomItem.title});
      }
      else {
        embed.setFooter({text: randomItem.title});
      }
    }

    for(let i=0; i<eorzeaCollectionGlams.length; i++) {
      let fieldTitle = "";

      if( eorzeaCollectionGlams.length > 1 ) {
        fieldTitle += (i+1) + ". ";
      }

      fieldTitle += eorzeaCollectionGlams[i].title;

      if( eorzeaCollectionGlams.length > 1 && randomIndex == i ) {
        fieldTitle += " (Showing)";
      }

      let fieldDescription = eorzeaCollectionGlams[i].author + " «" + eorzeaCollectionGlams[i].server + "»";

      fieldDescription += "\n["+eorzeaCollectionGlams[i].link+"]("+eorzeaCollectionGlams[i].link+")"

      // Invisible link to image
      fieldDescription += "[\u200B]("+eorzeaCollectionGlams[i].img+")";

      embed.addField(fieldTitle, fieldDescription);
    }

    // Equipment Placeholder
    embed.addField("Details", "...");

    // Channel
    let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

    // Send Message
    channel.send({ embeds: [embed] })
    .then(async function(m){
      // Equipment Listing
      if( randomItem ) {

        // Missing embed
        if( lodash.isEmpty(m.embeds) || m.embeds.length == 0 ) {
          console.log("Recovering missing embed");
          m.embeds = [embed];
        }

        let itemInfo = await getGlamDetails(randomItem.link, m);
        await updateEquipmentInfo(itemInfo, m);
      }

      if( eorzeaCollectionGlams.length > 1 ) {
        await resetReactions(m);
      }
    })
    .catch(function(err){
      console.log(err);
    });
  }
  else {
    helper.sendErrorMsg("Error", "No results found", message);
  }
}

const updateEquipmentInfo = async function(itemInfo, m, nextSlideImg="") {

  if( lodash.isEmpty(itemInfo) || lodash.isEmpty(m.embeds) ) {
    console.log("Missing itemInfo or embed");
    console.log("Item Info", itemInfo);
    console.log("Message", m);
    return;
  }

  let equipmentTxt = "";

  for(let slot in itemInfo.equipment) {

    if( slot == "rings" ) {
      for(let i=0; i <itemInfo.equipment[slot].length; i++) {
        if( itemInfo.equipment[slot][i] ) {

          let newEquipmentTxt = "";

          if( itemInfo.link[slot][i] ) {
            // Custom redirect to reduce character count
            itemInfo.link[slot][i] = itemInfo.link[slot][i].replace('https://na.finalfantasyxiv.com/lodestone/playguide/db/item/', 'https://kwehbot.xyz/ls/');
            newEquipmentTxt += "\nRing " + (i+1) + ": ["+itemInfo.equipment[slot][i]+"](" + itemInfo.link[slot][i] + ")";
          }
          else {
            newEquipmentTxt += "\nRing " + (i+1) + ": " + itemInfo.equipment[slot][i];
          }

          // Field length limit
          if( (equipmentTxt.length + newEquipmentTxt.length) <= 1024 ) {
            equipmentTxt += newEquipmentTxt;
          }
        }
      }
    }
    else {
      if( itemInfo.equipment[slot] ) {

        let newEquipmentTxt = "";

        if( itemInfo.link[slot] ) {
          // Custom redirect to reduce character count
          itemInfo.link[slot] = itemInfo.link[slot].replace('https://na.finalfantasyxiv.com/lodestone/playguide/db/item/', 'https://kwehbot.xyz/ls/');
          equipmentTxt += "\n" + lodash.capitalize(slot) + ": ["+itemInfo.equipment[slot]+"](" + itemInfo.link[slot] + ")";
        }
        else {
          equipmentTxt += "\n" + lodash.capitalize(slot) + ": " + itemInfo.equipment[slot];
        }

        if( itemInfo.dye[slot] && itemInfo.dye[slot]!= 'Undyed' ) {
          equipmentTxt += " :paintbrush: " + itemInfo.dye[slot] + " Dye"; // »
        }

        // Field length limit
        if( (equipmentTxt.length + newEquipmentTxt.length) <= 1024 ) {
          equipmentTxt += newEquipmentTxt;
        }
      }
    }
  }

  // Output
  if( equipmentTxt ) {
    m.embeds[0].fields[ m.embeds[0].fields.length-1 ].value = equipmentTxt;
  }
  else {
    m.embeds[0].fields.pop();
  }

  let messageEmbed = m.embeds[0];

  if( nextSlideImg ) {
    messageEmbed.setImage(nextSlideImg);
  }

  m.edit({ embeds: [messageEmbed] });
}

const resetReactions = async function(message) {
  if ( lodash.isEmpty(message.embeds) == false ) {
    await message.react('⬅️');
    await message.react('➡️');

    if( message.embeds[0].fields.length > 1 ) {
      for( x = 0; x < message.embeds[0].fields.length; x++ ) {
        switch(x) {
          case 0:
            await message.react('1️⃣');
            break;
          case 1:
            await message.react('2️⃣');
            break;
          case 2:
            await message.react('3️⃣');
            break;
          case 3:
            await message.react('4️⃣');
            break;
          case 4:
            await message.react('5️⃣');
            break;
        }
      }
    }
  }
}

const getEorzeaCollection = async function(type="", searchStr="", author="") {

  let eorzeaCollectionResult = {
    title: 'Eorzea Collection',
    url: 'https://ffxiv.eorzeacollection.com',
    description: '',
    results: []
  };

  let apiUrl = "https://kwehbot.xyz/api/eorzeacollection";

  if( type ) {
    apiUrl += "/" + type;
  }

  apiUrl += "?kweh=1"

  if(searchStr) {
    apiUrl += "&search=" + searchStr;
    eorzeaCollectionResult.description += "\nKeyword: \"" + searchStr + "\"";
  }

  if(author) {
    apiUrl += "&author=" + author;
    eorzeaCollectionResult.description += "\nAuthor: \"" + author + "\"";
  }

  console.log("EorzeaCollection API Request: " + apiUrl);

  await axios.get(apiUrl).then(async function(response){
    if( response.status === 200 ) {
      if( response.data && response.data.results ) {
        eorzeaCollectionResult.results = response.data.results;
        eorzeaCollectionResult.url = response.data.url ? response.data.url : eorzeaCollectionResult.url;
        eorzeaCollectionResult.title = response.data.title ? response.data.title : eorzeaCollectionResult.title;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });


  return eorzeaCollectionResult;
}

/******************************
  Export
*******************************/

module.exports = {
  loadNextImg,
  loadGlamNo,
  getEorzeaCollection,
  printEorzeaCollection,
  resetReactions
}