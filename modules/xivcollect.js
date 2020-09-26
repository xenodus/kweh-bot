/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const axios = require('axios');

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

/******************************
  Exports
*******************************/

module.exports = {
  getFFCollectData
}