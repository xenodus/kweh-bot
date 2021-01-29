/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const helper = require('../helper');
const dcserver = require('./dcserver');
const Discord = require("discord.js");
const axios = require('axios');
const lodash = require('lodash');
const moment = require("moment");

/******************************
  Marketboard Functions
*******************************/

const getMarketboardListings = async function(itemID, dcOrServer) {

  let mbListings = {};
  let apiUrl = config.universalisApiBaseURL + dcOrServer.charAt(0).toUpperCase() + dcOrServer.slice(1) + "/" + itemID;

  helper.printStatus("Marketboard API: " + apiUrl);

  await axios.get(apiUrl).then(async function(response){
    if( response.status === 200 ) {
      if( response.data ) {
        mbListings = response.data;
        mbListings.status = response.status;
      }
    }
  })
  .catch(async function(err){
    console.log(err);
    mbListings.status = err.response.status;
  });

  return mbListings;
}

/******************************
  Multiple Matched Item
*******************************/

const handleMultipleItems = async function(itemMatchResult, searchedItem, dcOrServer, isDCSupplied, message) {
  // multiple matching results
  let options = await sendMultipleItemsMatchedMsg(itemMatchResult, searchedItem, message);

  // Ensure text entered is one of the options in above array
  let multipleItemsfilter = function response(m){
    return options.includes( parseInt(m.content) );
  };

  // Await Reply
  message.response_channel.awaitMessages(multipleItemsfilter, { max: 1, time: config.userPromptsTimeout }).then(async function(collected){
    let itemInfo = itemMatchResult[ collected.first().content - 1 ];
    await printMarketboardResult(itemInfo, dcOrServer, isDCSupplied, message);

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
      .setAuthor(searchedKeyword, config.universalisLogo);

    let description = "Which item are you looking for?\n";

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
  Marketboard Result
*******************************/

const printMarketboardResult = async function(item, dcOrServer, isDCSupplied, message) {

  let mbListings = await getMarketboardListings( item.ID, dcOrServer );

  if( lodash.isEmpty(mbListings) == false && mbListings.listings && mbListings.listings.length > 0 ) {

    mbListings.item = item;
    mbListings.server = isDCSupplied ? "" : dcOrServer;
    mbListings.datacenter = isDCSupplied ? dcOrServer : "";

    if( isDCSupplied ) {
      sendMarketboardResult(mbListings, message, true);
    }
    else {
      sendMarketboardResult(mbListings, message, false);
    }
  }
  else {
    if( lodash.isEmpty(mbListings) == false && mbListings.status && mbListings.status >= 500 ) {
      // 500 Error
      helper.sendErrorMsg(item.Name, "No results found\nhttps://universalis.app/ seems to be down right now :(", message);
    }
    else {
      // No results
      helper.sendErrorMsg(item.Name, "No results found", message);
    }
  }
}

const sendMarketboardResult = async function(mbData, message, isDC=true) {

  if( mbData.listings ) {

    // Embed
    let embed = new Discord.MessageEmbed()
      .setColor(config.defaultEmbedColor)
      .setTitle( mbData.item.Name )
      .setAuthor( "Universalis", config.universalisLogo, config.universalisMarketBaseURL + mbData.item.ID )
      .setThumbnail( config.xivApiBaseURL + mbData.item.Icon );

    // Last Upload Time
    let datetimeUploaded = moment(mbData.lastUploadTime).format("DD MMM YYYY h:mm A");
    embed.setFooter("Data from " + datetimeUploaded);

    // Display data center specific results
    if( isDC ) {

      let dcServers = await dcserver.getDCServers();

      if( dcServers[ mbData.datacenter.charAt(0).toUpperCase() + mbData.datacenter.slice(1) ] ) {

        let servers = dcServers[ mbData.datacenter.charAt(0).toUpperCase() + mbData.datacenter.slice(1) ];

        if( servers.length > 0 ) {

          let lowestNQAllServer = [];
          let lowestHQAllServer = [];

          for(var i=0; i<servers.length; i++) {
            let currentServerListings = mbData.listings.filter(l => (l.worldName == servers[i] && l.onMannequin == false));

            if( currentServerListings.length > 0 ) {
              let lowestNQPrice = getLowestListing(currentServerListings, false);
              let lowestHQPrice = getLowestListing(currentServerListings, true);

              let priceListings = (lodash.isEmpty(lowestNQPrice)?"":lowestNQPrice.pricePerUnit.toLocaleString() + "g [NQ] x "+lowestNQPrice.quantity);
              priceListings += "\n" + (lodash.isEmpty(lowestHQPrice)?"" : lowestHQPrice.pricePerUnit.toLocaleString() + "g [HQ] x "+lowestHQPrice.quantity);

              embed.addField(servers[i], priceListings);

              if( lodash.isEmpty(lowestNQPrice) == false ) {
                lowestNQAllServer.push(lowestNQPrice);
              }

              if( lodash.isEmpty(lowestHQPrice) == false ) {
                lowestHQAllServer.push(lowestHQPrice);
              }
            }
            else {
              embed.addField(servers[i], "Not available");
            }
          }

          // Get Lowest / Highest
          let description = "";

          if( lowestNQAllServer.length > 0 ) {
            lowestNQAllServer = lodash.sortBy(lowestNQAllServer, ['pricePerUnit']);
            description += "Cheapest [NQ] on **" + lowestNQAllServer[0].worldName + "** at " + lowestNQAllServer[0].pricePerUnit.toLocaleString() + "g " + " x " + lowestNQAllServer[0].quantity;
          }

          if( lowestHQAllServer.length > 0 ) {
            lowestHQAllServer = lodash.sortBy(lowestHQAllServer, ['pricePerUnit']);
            description += "\nCheapest [HQ] on **" + lowestHQAllServer[0].worldName + "** at " + lowestHQAllServer[0].pricePerUnit.toLocaleString() + "g " + " x " + lowestHQAllServer[0].quantity;
          }

          embed.setDescription(description);
        }
      }

      // Channel
      let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

      // Send Message
      channel.send( embed ).catch(function(err){
        console.log(err);
      });
    }
    // Display server specific results
    else {
      // Sort ascending
      let listings = mbData.listings.filter(l => l.onMannequin == false);
      listings = lodash.sortBy(listings, ['pricePerUnit']);

      let lowestNQPrice = getLowestListing(listings, false);
      let lowestHQPrice = getLowestListing(listings, true);

      let description = "Cheapest NQ: " + ( lodash.isEmpty(lowestNQPrice) ? 'Not available' : lowestNQPrice.pricePerUnit.toLocaleString() + "g x "+lowestNQPrice.quantity );
      description += "\nCheapest HQ: " + ( lodash.isEmpty(lowestHQPrice) ? 'Not available' : lowestHQPrice.pricePerUnit.toLocaleString() + "g x "+lowestHQPrice.quantity );

      embed.setDescription(description);

      let listLimit = 20;
      let priceListings = "";

      for(var i=0; i<listings.length; i++) {
        if( i == listLimit )
          break;

        priceListings += "\n" + listings[i].pricePerUnit.toLocaleString() + "g "+(listings[i].hq?"[HQ]":"[NQ]")+" x " + listings[i].quantity;
      }

      // Listings
      embed.addField(mbData.server.charAt(0).toUpperCase() + mbData.server.slice(1), priceListings);

      // Channel
      let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

      // Send Message
      channel.send( embed ).catch(function(err){
        console.log(err);
      });
    }
  }
}

const getHighestListing = function(listings, hq=false) {

  let highestPricedItem = {};

  for(var i=0; i<listings.length; i++) {

    if( hq == true && listings[i].hq != true )
      continue;

    if( hq == false && listings[i].hq == true )
      continue;

    if( lodash.isEmpty(highestPricedItem) || listings[i].pricePerUnit < highestPricedItem.pricePerUnit ) {
      highestPricedItem = listings[i];
    }
  }

  return highestPricedItem;
}

const getLowestListing = function(listings, hq=false) {

  let lowestPricedItem = {};

  for(var i=0; i<listings.length; i++) {

    if( hq == true && listings[i].hq != true )
      continue;

    if( hq == false && listings[i].hq == true )
      continue;

    if( lodash.isEmpty(lowestPricedItem) || listings[i].pricePerUnit < lowestPricedItem.pricePerUnit ) {
      lowestPricedItem = listings[i];
    }
  }

  return lowestPricedItem;
}

/******************************
  Exports
*******************************/

module.exports = {
  getMarketboardListings,
  sendMultipleItemsMatchedMsg,
  printMarketboardResult,
  sendMarketboardResult,
  getHighestListing,
  getLowestListing,
  handleMultipleItems
}