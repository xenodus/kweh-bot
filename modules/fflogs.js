/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const Discord = require("discord.js");
const axios = require('axios');
const lodash = require('lodash');
const moment = require("moment");

const currentTierEncounters = [
  {
    "encounterID": 73,
    "encounterName": "Cloud of Darkness",
  },
  {
    "encounterID": 74,
    "encounterName": "Shadowkeeper",
  },
  {
    "encounterID": 75,
    "encounterName": "Fatebreaker",
  },
  {
    "encounterID": 76,
    "encounterName": "Eden's Promise",
  },
  {
    "encounterID": 77,
    "encounterName": "Oracle of Darkness",
  },
  /*
  {
    "encounterID": 69,
    "encounterName": "Ramuh"
  },
  {
    "encounterID": 70,
    "encounterName": "Ifrit and Garuda"
  },
  {
    "encounterID": 71,
    "encounterName": "The Idol of Darkness",
  },
  {
    "encounterID": 72,
    "encounterName": "Shiva",
  },
  {
    "encounterID": 1050,
    "encounterName": "The Epic of Alexander",
  },
  */
];

/******************************
  FFLogs Functions
*******************************/

const getFFLogs = async function(name, server, region) {

  let logsResults = {};
  let apiUrl = config.fflogsApiBaseURL + "parses/character/" + name + "/" + server + "/" + region;
  apiUrl += "?api_key=" + config.fflogsToken + "&metric=rdps";

  console.log( apiUrl );

  await axios.get(apiUrl).then(async function(response){

    if( response.status === 200 ) {
      if( response.data ) {
        logsResults = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return logsResults;
};

const printFFLogs = function(logsResults, message) {

  // Only show savage logs - 101
  logsResults = lodash.filter(logsResults, {'difficulty': 101});

  logsResults = lodash.orderBy(logsResults, ['startTime'], ['desc']);
  recentLogs = logsResults.slice(0, 5);

  logsResults = lodash.orderBy(logsResults, ['percentile'], ['desc']);
  topLogs = logsResults.slice(0, 5);

  // Embed
  let embed = new Discord.MessageEmbed()
    .setColor(config.defaultEmbedColor)
    .setAuthor( "FFLogs Parses", config.fflogsLogo, "" );

  if( logsResults.length ) {

    embed.setAuthor( "FFLogs Parses - " + logsResults[0].characterName, config.fflogsLogo, config.fflogsBaseURL + "character/id/" + logsResults[0].characterID );

    if( recentLogs.length ) {

      let recentLogsTxt = "";

      for(var i=0; i<recentLogs.length; i++) {
        let logDate = moment( recentLogs[i].startTime ).format("D MMM");
        recentLogsTxt+= "\n [" + recentLogs[i].encounterName + " ("+Math.floor(recentLogs[i].percentile)+"%)]("+config.fflogsBaseURL+"reports/"+recentLogs[i].reportID+"#fight="+recentLogs[i].fightID+"&playermetrictimeframe=today&view=rankings) - " + logDate;
      }

      embed.addField("Recent Parses", recentLogsTxt, true);
    }

    if( topLogs.length ) {
      let topLogsTxt = "";

      for(var i=0; i<topLogs.length; i++) {
        let logDate = moment( topLogs[i].startTime ).format("D MMM");
        topLogsTxt+= "\n [" + topLogs[i].encounterName + " ("+Math.floor(topLogs[i].percentile)+"%)]("+config.fflogsBaseURL+"reports/"+topLogs[i].reportID+"#fight="+topLogs[i].fightID+"&playermetrictimeframe=today&view=rankings) - " + logDate;
      }

      embed.addField("Top Parses", topLogsTxt, true);
    }

    for(var i=0; i<currentTierEncounters.length; i++) {
      encounterLogs = logsResults.filter(f => f.encounterID == currentTierEncounters[i].encounterID);
      encounterLogs = lodash.orderBy(encounterLogs, ['percentile'], ['desc']);

      if( encounterLogs.length > 0 ) {

        // let duration = Math.floor(moment.duration(encounterLogs[0].duration).minutes()) + ":" + Math.floor(moment.duration(encounterLogs[0].duration%60000).asSeconds());
        let duration = moment.utc(encounterLogs[0].duration).format("m:ss");
        let encounterTxt = encounterLogs[0].spec + ": [[" + Math.round(encounterLogs[0].total).toLocaleString() + " DPS]]("+config.fflogsBaseURL+"reports/"+encounterLogs[0].reportID+"#fight="+encounterLogs[0].fightID+"&playermetrictimeframe=today&view=rankings)" + " [" + encounterLogs[0].rank + "/"+ encounterLogs[0].outOf +"]" + " [" + Math.floor(encounterLogs[0].percentile) + "%] ["+duration+"]";

        // Check for second class
        let first_spec = encounterLogs[0].spec;
        encounterLogs = encounterLogs.filter(f => f.spec != first_spec);

        if( encounterLogs.length > 0 ) {
          encounterTxt += "\n" + encounterLogs[0].spec + ": [[" + Math.round(encounterLogs[0].total).toLocaleString() + " DPS]]("+config.fflogsBaseURL+"reports/"+encounterLogs[0].reportID+"#fight="+encounterLogs[0].fightID+"&playermetrictimeframe=today&view=rankings)" + " [" + encounterLogs[0].rank + "/"+ encounterLogs[0].outOf +"]" + " [" + Math.floor(encounterLogs[0].percentile) + "%] ["+duration+"]";
        }

        embed.addField(currentTierEncounters[i].encounterName, encounterTxt);
      }
    }

  }
  else {
    embed.addField("Recent Parses", "No data available");
  }

  // Channel
  let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

  // Send Message
  channel.send( embed ).catch(function(err){
    console.log(err);
  });
}

/******************************
  Export
*******************************/

module.exports = {
  getFFLogs,
  printFFLogs
}