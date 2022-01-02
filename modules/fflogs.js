/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const Discord = require("discord.js");
const axios = require('axios');
const oauth = require('axios-oauth-client');
const lodash = require('lodash');
const moment = require("moment");
const { GraphQLClient, gql }  = require('graphql-request');

const currentTierEncounters = [
  {
    "encounterID": 78,
    "encounterName": "Erichthonios",
  },
  {
    "encounterID": 79,
    "encounterName": "Hippokampos",
  },
  {
    "encounterID": 80,
    "encounterName": "Phoinix",
  },
  {
    "encounterID": 81,
    "encounterName": "Hesperos",
  },
  {
    "encounterID": 1058,
    "encounterName": "Zodiark",
  },
  {
    "encounterID": 1059,
    "encounterName": "Hydaelyn",
  },
  {
    "encounterID": 1062,
    "encounterName": "The Epic of Alexander",
  },
  {
    "encounterID": 1061,
    "encounterName": "The Weapon's Refrain",
  },
  {
    "encounterID": 1060,
    "encounterName": "The Unending Coil of Bahamut",
  }
];

const getClientCredentials = oauth.client(axios.create(), {
  url: config.fflogsOAuthURL,
  grant_type: 'client_credentials',
  client_id: config.fflogsClientID,
  client_secret: config.fflogsClientSecret,
  scope: ''
});

/******************************
  FFLogs Functions
*******************************/

const getFFLogsToken = async function() {
  let access_token = ''

  access_token = await getClientCredentials().then(async function(response){
    return response.access_token
  })
  .catch(function(err){
    console.log(err);
  });

  return access_token
}

const getFFLogsGQL = async function(name, server, region) {

  let encounterData = []
  let endpoint = config.fflogsGQLEndpoint

  // #1 - Get Token
  let access_token = await getFFLogsToken();

  const client = new GraphQLClient(endpoint)
  client.setHeader('Authorization', 'Bearer ' + access_token)

  const charQuery = gql`
    query getCharacterByNameServer($name: String!, $server: String!, $serverRegion: String!) {
      characterData{
        character(name: $name, serverSlug: $server, serverRegion: $serverRegion){
          id
          name
        }
      }
    }
  `

  const charVariables = {
    name: name,
    server: server,
    serverRegion: region
  }

  try {
    // #2 - Get user id
    const data = await client.request(charQuery, charVariables)

    if( data && data.characterData && data.characterData.character.id ) {

      const logQuery = gql`
        query getUserLogsByID($uid: Int, $encounterid: Int) {
          characterData{
            character(id: $uid){
              name
              encounterRankings(encounterID: $encounterid)
            }
          }
        }
      `

      for(var i=0; i<currentTierEncounters.length; i++) {

        let logVariables = {
          uid: data.characterData.character.id,
          encounterid: currentTierEncounters[i].encounterID
        }

        try {
          // #3 - Get user logs
          const logData = await client.request(logQuery, logVariables)

          if( logData.characterData.character.encounterRankings.ranks && logData.characterData.character.encounterRankings.ranks.length > 0 ) {
            for(var j=0; j<logData.characterData.character.encounterRankings.ranks.length; j++) {
              let encData = logData.characterData.character.encounterRankings.ranks[j]
              encData.encounterID = currentTierEncounters[i].encounterID
              encData.encounterName = currentTierEncounters[i].encounterName
              encData.characterName = logData.characterData.character.name
              encData.characterID = data.characterData.character.id
              // todo: move to separate struct so no repeat data
              encData.totalKills = logData.characterData.character.encounterRankings.totalKills
              encData.fastestKill = logData.characterData.character.encounterRankings.fastestKill
              encData.difficulty = logData.characterData.character.encounterRankings.difficulty
              encounterData.push(encData)
            }
          }
        }
        catch (error) {
          console.error("Error fetching log data", JSON.stringify(error, undefined, 2))
        }
      }

      return encounterData
    }
  }
  catch (error) {
    console.error("Error fetching character data", name, server, region)
  }

  return encounterData
};

const printFFLogsGQL = function(logsResults, message) {

  // Only show savage logs - 101
  // logsResults = lodash.filter(logsResults, {'difficulty': 101});

  logsResults = lodash.orderBy(logsResults, ['startTime'], ['desc']);
  recentLogs = logsResults.slice(0, 5);

  logsResults = lodash.orderBy(logsResults, ['rankPercent'], ['desc']);
  topLogs = logsResults.slice(0, 5);

  // Embed
  let embed = new Discord.MessageEmbed()
    .setColor(config.defaultEmbedColor)
    .setAuthor( "FFLogs", config.fflogsLogo, "" );

  if( logsResults.length ) {

    embed.setAuthor( "FFLogs - " + logsResults[0].characterName, config.fflogsLogo, config.fflogsBaseURL + "character/id/" + logsResults[0].characterID );

    if( recentLogs.length ) {

      let recentLogsTxt = "";

      for(var i=0; i<recentLogs.length; i++) {
        let logDate = moment( recentLogs[i].startTime ).format("D MMM");
        recentLogsTxt+= "\n[" + recentLogs[i].encounterName + " ("+Math.round(recentLogs[i].rankPercent)+"%)]("+config.fflogsBaseURL+"reports/"+recentLogs[i].report.code+"#fight="+recentLogs[i].report.fightID+") - " + logDate;
      }

      embed.addField("Recent", recentLogsTxt, true);
    }

    if( topLogs.length ) {
      let topLogsTxt = "";

      for(var i=0; i<topLogs.length; i++) {
        let logDate = moment( topLogs[i].startTime ).format("D MMM");
        topLogsTxt+= "\n[" + topLogs[i].encounterName + " ("+Math.round(topLogs[i].rankPercent)+"%)]("+config.fflogsBaseURL+"reports/"+topLogs[i].report.code+"#fight="+topLogs[i].report.fightID+") - " + logDate;
      }

      embed.addField("Top", topLogsTxt, true);
    }

    for(var i=0; i<currentTierEncounters.length; i++) {
      encounterLogs = logsResults.filter(f => f.encounterID == currentTierEncounters[i].encounterID);
      encounterLogs = lodash.orderBy(encounterLogs, ['rankPercent'], ['desc']);

      if( encounterLogs.length > 0 ) {

        // let duration = Math.floor(moment.duration(encounterLogs[0].duration).minutes()) + ":" + Math.floor(moment.duration(encounterLogs[0].duration%60000).asSeconds());
        let noKills = encounterLogs[0].totalKills
        let duration = moment.utc(encounterLogs[0].duration).format("m:ss");
        let encounterTxt = encounterLogs[0].spec + ": [[" + Math.round(encounterLogs[0].aDPS).toLocaleString() + " aDPS] ["+Math.round(encounterLogs[0].rankPercent)+"%] ["+duration+"]]("+config.fflogsBaseURL+"reports/"+encounterLogs[0].report.code+"#fight="+encounterLogs[0].report.fightID+")";

        // Check for second class
        let first_spec = encounterLogs[0].spec;
        encounterLogs = encounterLogs.filter(f => f.spec != first_spec);

        if( encounterLogs.length > 0 ) {
          encounterTxt += "\n" + encounterLogs[0].spec + ": [[" + Math.round(encounterLogs[0].aDPS).toLocaleString() + " aDPS] ["+Math.round(encounterLogs[0].rankPercent)+"%] ["+duration+"]]("+config.fflogsBaseURL+"reports/"+encounterLogs[0].report.code+"#fight="+encounterLogs[0].report.fightID+")";
        }

        embed.addField(currentTierEncounters[i].encounterName + " - " + noKills + " kills", encounterTxt);
      }
    }

  }
  else {
    embed.addField("Recent", "No data available");
  }

  // Channel
  let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

  // Send Message
  channel.send( embed ).catch(function(err){
    console.log(err);
  });
}

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
  // logsResults = lodash.filter(logsResults, {'difficulty': 101});

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
        recentLogsTxt+= "\n [" + recentLogs[i].encounterName + " ("+Math.round(recentLogs[i].percentile)+"%)]("+config.fflogsBaseURL+"reports/"+recentLogs[i].reportID+"#fight="+recentLogs[i].fightID+"&playermetrictimeframe=today&view=rankings) - " + logDate;
      }

      embed.addField("Recent Parses", recentLogsTxt, true);
    }

    if( topLogs.length ) {
      let topLogsTxt = "";

      for(var i=0; i<topLogs.length; i++) {
        let logDate = moment( topLogs[i].startTime ).format("D MMM");
        topLogsTxt+= "\n [" + topLogs[i].encounterName + " ("+Math.round(topLogs[i].percentile)+"%)]("+config.fflogsBaseURL+"reports/"+topLogs[i].reportID+"#fight="+topLogs[i].fightID+"&playermetrictimeframe=today&view=rankings) - " + logDate;
      }

      embed.addField("Top Parses", topLogsTxt, true);
    }

    for(var i=0; i<currentTierEncounters.length; i++) {
      encounterLogs = logsResults.filter(f => f.encounterID == currentTierEncounters[i].encounterID);
      encounterLogs = lodash.orderBy(encounterLogs, ['percentile'], ['desc']);

      if( encounterLogs.length > 0 ) {

        // let duration = Math.floor(moment.duration(encounterLogs[0].duration).minutes()) + ":" + Math.floor(moment.duration(encounterLogs[0].duration%60000).asSeconds());
        let duration = moment.utc(encounterLogs[0].duration).format("m:ss");
        let encounterTxt = encounterLogs[0].spec + ": [[" + Math.round(encounterLogs[0].total).toLocaleString() + " DPS]]("+config.fflogsBaseURL+"reports/"+encounterLogs[0].reportID+"#fight="+encounterLogs[0].fightID+"&playermetrictimeframe=today&view=rankings)" + " [" + encounterLogs[0].rank + "/"+ encounterLogs[0].outOf +"]" + " [" + Math.round(encounterLogs[0].percentile) + "%] ["+duration+"]";

        // Check for second class
        let first_spec = encounterLogs[0].spec;
        encounterLogs = encounterLogs.filter(f => f.spec != first_spec);

        if( encounterLogs.length > 0 ) {
          encounterTxt += "\n" + encounterLogs[0].spec + ": [[" + Math.round(encounterLogs[0].total).toLocaleString() + " DPS]]("+config.fflogsBaseURL+"reports/"+encounterLogs[0].reportID+"#fight="+encounterLogs[0].fightID+"&playermetrictimeframe=today&view=rankings)" + " [" + encounterLogs[0].rank + "/"+ encounterLogs[0].outOf +"]" + " [" + Math.round(encounterLogs[0].percentile) + "%] ["+duration+"]";
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
  printFFLogs,
  getFFLogsGQL,
  printFFLogsGQL
}