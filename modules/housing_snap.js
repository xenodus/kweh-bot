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
      if( currSlide < reaction.message.embeds[0].fields.length ) {
        nextIndex = currSlide; // display # is -1 of index so no need to +1
      }
      else {
        nextIndex = 0; // reset
      }
    }
    // desc
    else {
      if( currSlide == 1 ) {
        nextIndex = reaction.message.embeds[0].fields.length-1;
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
      await updateImage(reaction.message, nextSlideImg);
      await reaction.message.reactions.removeAll();
      await resetReactions(reaction.message);
    }
  }
}

const loadItemNo = async function(reaction, emoji_name) {

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

    if( no <= reaction.message.embeds[0].fields.length ) {
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
        await updateImage(reaction.message, nextSlideImg);
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

const printHousingSnap = async function(housingSnapResult, message) {
  if( housingSnapResult.results.length > 0 ) {

    let limit = 5;

    if( housingSnapResult.results.length >= limit ) {
      housingSnaps = housingSnapResult.results.slice(0, limit);
    }
    else {
      housingSnaps = housingSnapResult.results;
    }

    // Embed
    let embed = new Discord.MessageEmbed()
      .setColor(config.defaultEmbedColor);

    if( housingSnapResult.title && housingSnapResult.url ) {
      embed.setAuthor({name: housingSnapResult.title, iconURL: config.housingSnapLogo, url: encodeURI(housingSnapResult.url)});
    }

    let description = "";

    if( housingSnapResult.description ) {
      description += housingSnapResult.description;
    }

    if( housingSnaps.length > 1 ) {
      description += "\nUse the :arrow_left: :arrow_right: reaction buttons below to select which housing snap to preview.";
    }

    embed.setDescription(description);

    let randomIndex;
    let randomItem;

    if( housingSnaps[0].img ) {
      randomIndex = Math.floor(Math.random() * housingSnaps.length);
      randomItem = housingSnaps[randomIndex];
      embed.setImage(randomItem.img);

      // No need footer label with # if only 1 result
      if( housingSnaps.length > 1 ) {
        embed.setFooter({text: (randomIndex+1) + '. ' + randomItem.title});
      }
      else {
        embed.setFooter({text: randomItem.title});
      }
    }

    for(let i=0; i<housingSnaps.length; i++) {
      let fieldTitle = "";

      if( housingSnaps.length > 1 ) {
        fieldTitle += (i+1) + ". ";
      }

      fieldTitle += housingSnaps[i].title;

      if( housingSnaps.length > 1 && randomIndex == i ) {
        fieldTitle += " (Showing)";
      }

      let fieldDescription = housingSnaps[i].author.replace("(", "[").replace(")", "]");

      fieldDescription += "\n["+housingSnaps[i].link+"]("+housingSnaps[i].link+")";

      // Invisible link to image
      fieldDescription += "[\u200B]("+housingSnaps[i].img+")";

      embed.addField(fieldTitle, fieldDescription);
    }

    // Channel
    let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

    // Send Message
    await channel.send({ embeds: [embed] })
    .then(async function(m){
      if( housingSnaps.length > 1 ) {
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

const updateImage = async function(m, nextSlideImg="") {
  if( nextSlideImg ) {

    let messageEmbed = m.embeds[0];

    messageEmbed.setImage(nextSlideImg);

    m.edit({ embeds: [messageEmbed] });
  }
}

const resetReactions = async function(message) {

  console.log(message);

  if ( lodash.isEmpty(message.embeds) == false ) {
    await message.react('⬅️');
    await message.react('➡️');

    if( message.embeds[0].fields.length > 1 ) {
      for( x=0; x <= message.embeds[0].fields.length; x++ ) {
        switch(x) {
          case 1:
            await message.react('1️⃣');
            break;
          case 2:
            await message.react('2️⃣');
            break;
          case 3:
            await message.react('3️⃣');
            break;
          case 4:
            await message.react('4️⃣');
            break;
          case 5:
            await message.react('5️⃣');
            break;
        }
      }
    }
  }
}

const getHousingSnap = async function(tag="") {

  let housingSnapResult = {
    title: 'Housing Snap',
    url: 'https://housingsnap.com',
    description: '',
    results: []
  };

  let apiUrl = "https://kwehbot.xyz/api/housingsnap";

  if( tag ) {
    apiUrl += "/" + tag;
  }

  apiUrl += "?kweh=1"

  console.log("Housing Snap API Request: " + apiUrl);

  await axios.get(apiUrl).then(async function(response){
    if( response.status === 200 ) {
      if( response.data && response.data.results ) {
        housingSnapResult.results = response.data.results;
        housingSnapResult.url = response.data.url ? response.data.url : housingSnapResult.url;
        housingSnapResult.title = response.data.title ? response.data.title : housingSnapResult.title;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });


  return housingSnapResult;
}

/******************************
  Export
*******************************/

module.exports = {
  loadNextImg,
  loadItemNo,
  getHousingSnap,
  printHousingSnap,
  resetReactions
}