/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const axios = require('axios');

/*********************************
  DC / Server Related Functions
**********************************/

const getDCServers = async function() {

  let dcServers = {};
  let apiUrl = config.xivApiBaseURL + "servers/dc";
  apiUrl += "?private_key=" + config.xivApiToken;

  await axios.get(apiUrl).then(async function(response){
    if( response.status === 200 ) {
      if( response.data ) {
        dcServers = response.data;
      }
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return dcServers;
}

const isDC = async function(dcOrServer){

  let dcServers = await getDCServers();

  if(dcServers) {
    for( key in dcServers ) {
      if( key.toLowerCase() == dcOrServer ){
        return true;
      }
    }
  }

  return false;
}

const isServer = async function(dcOrServer){

  let dcServers = await getDCServers();

  if(dcServers) {
    for( key in dcServers ) {
      for(var i=0; i<dcServers[key].length; i++) {
        if( dcServers[key][i].toLowerCase() == dcOrServer ) {
          return true;
        }
      }
    }
  }

  return false;
}

const getDCregion = function(dc) {
  if( config.dcRegions.JP.includes( dc ) )
    return "JP";
  else if( config.dcRegions.EU.includes( dc ) )
    return "EU";
  else if( config.dcRegions.NA.includes( dc ) )
    return "NA";
  else
    return "";
}

/******************************
  Exports
*******************************/

module.exports = {
  getDCServers,
  isDC,
  isServer,
  getDCregion
}