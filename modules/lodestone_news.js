/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const helper = require('../helper');
const Discord = require("discord.js");
const axios = require('axios');
const lodash = require('lodash');
const moment = require("moment");

const pool = config.getPool();
const readPool = config.getReadPool();

const redis = config.getRedis();

/******************************
  GET NEWS CHANNEL
*******************************/

const newsChannelGet = async function(server_id) {

  let newsChannel = {};

  newsChannel = await readPool.query("SELECT * FROM news_subscription WHERE server_id = ?", [server_id]).then(function(res){

    if( res.length > 0 ) {
      return {
        id: res[0].id,
        server_id: res[0].server_id,
        channel_id: res[0].channel_id,
        channel_name: res[0].channel_name,
        locale: res[0].locale,
        categories: res[0].categories,
        updated_by_user_id: res[0].updated_by_user_id,
        date_added: res[0].date_added,
        last_updated: res[0].last_updated
      }
    }
  });

  return newsChannel;
}

/******************************
  ADD NEWS CHANNEL
*******************************/

const newsChannelAdd = async function(message, categories, locale = "na") {

  let curr_datetime = moment().format('YYYY-M-D HH:mm:ss');

  await pool.query(
    `INSERT INTO news_subscription
    (server_id, channel_id, channel_name, locale, categories, updated_by_user_id, date_added, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE channel_id = VALUES(channel_id), channel_name = VALUES(channel_name), locale = VALUES(locale), categories = VALUES(categories), updated_by_user_id = VALUES(updated_by_user_id), last_updated = VALUES(last_updated)`,
    [
      message.guild.id,
      message.channel.id,
      message.channel.name,
      locale,
      categories,
      message.author.id,
      curr_datetime,
      curr_datetime
    ]
  )
  .catch(function(e){
    console.log(e);
  })

  return;
}

/******************************
  UPDATE / CHANGE NEWS CHANNEL
*******************************/

const updatePostedNewsNewChannel = async function(old_channel_id, new_channel_id){
  await pool.query(
    `UPDATE news_posted SET channel_id = ? WHERE channel_id = ?`,
    [
      new_channel_id,
      old_channel_id
    ]
  )
  .catch(function(e){
    console.log(e);
  })
}

/******************************
  REMOVE NEWS CHANNEL
*******************************/

const newsChannelRemove = async function(message) {
  await pool.query(`DELETE FROM news_subscription WHERE channel_id = ?`, [message.channel.id])
  .then(function(){
    pool.query(`DELETE FROM news_posted WHERE channel_id = ?`, [message.channel.id])
  })
  .catch(function(e){
    console.log(e);
  })
}

/******************************
  FETCH NEWS
*******************************/

const fetchNews = async function(limitPerCat = 3, locale = "na") {
  let news = {};
  let interestedNews = [];
  let apiUrl = config.lodestoneApiURL;

  let redisKey;

  switch(locale) {
    case "jp":
      apiUrl = config.lodestoneApiURL_JP;
      redisKey = "kweh_lodestoneNews_" + "jp";
      break;
    case "de":
      apiUrl = config.lodestoneApiURL_DE;
      redisKey = "kweh_lodestoneNews_" + "de";
      break;
    case "fr":
      apiUrl = config.lodestoneApiURL_FR;
      redisKey = "kweh_lodestoneNews_" + "fr";
      break;
    case "eu":
      apiUrl = config.lodestoneApiURL_EU;
      redisKey = "kweh_lodestoneNews_" + "eu";
      break;
    case "na":
    default:
      redisKey = "kweh_lodestoneNews_" + "na";
      apiUrl = config.lodestoneApiURL;
  }

  let newsFrRedis = await redis.get(redisKey).then(function (result) {
    return result;
  });

  if( newsFrRedis ) {
    news = JSON.parse(newsFrRedis);
    helper.printStatus("Found lodestone news ("+locale+") in redis");
  }
  else {
    helper.printStatus("Fetching from lodestone news api: " + apiUrl);

    await axios.get(apiUrl).then(async function(response){
      if( response.status === 200 ) {
        if( response.data ) {
          news = response.data;

          helper.printStatus("Cached lodestone news ("+locale+")");
          redis.set(redisKey, JSON.stringify(news), "EX", config.lodestoneRedisExpiry);
        }
      }
    })
    .catch(function(err){
      console.log(err);
    });
  }

  // Process News
  if( lodash.isEmpty(news) == false ) {

    let interestedCategories = ['topics', 'notices', 'maintenance', 'updates', 'developers', 'test'];

    for(var i=0; i<interestedCategories.length; i++) {
      if( news[interestedCategories[i]] && news[interestedCategories[i]].length > 0 ) {

        let n = news[interestedCategories[i]].slice(0, limitPerCat);
        n = n.map(function(w){
          w.category = interestedCategories[i];
          return w;
        })

        interestedNews = interestedNews.concat( n );
      }
    }

    interestedNews = lodash.sortBy(interestedNews, ['time', 'desc']);
  }

  return interestedNews;
}

/******************************
  IS NEWS POSTED
*******************************/

const isPosted = async function(channel_id, news_id) {
  let isPosted = false;

  isPosted = await readPool.query("SELECT * FROM news_posted WHERE channel_id = ? AND news_id = ?", [channel_id, news_id]).then(function(res){
    if( res.length > 0 ) {
      return true;
    }
    return false;
  });

  return isPosted;
}

/******************************
  SET NEWS TO POSTED STATUS
*******************************/

const setPosted = function(channel_id, news_id) {

  let curr_datetime = moment().format('YYYY-M-D HH:mm:ss');

  pool.query(
    `INSERT INTO news_posted
    (news_id, channel_id, date_added) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE date_added = VALUES(date_added)`,
    [
      news_id,
      channel_id,
      curr_datetime
    ]
  )
  .catch(function(e){
    console.log(e);
  })
}

/****************************************
  SEND PROMPT ABOUT GETTING LATEST NEWS
*****************************************/

const sendManualPostNews2ChannelPrompt = async function(message, locale = "na") {
  await sendLatestNewsPrompt(message);

  let postLatestNewsFilter = function(m){
    return m.content == 1;
  };

  // Await Reply
  message.channel.awaitMessages({ postLatestNewsFilter, max: 1, time: config.userPromptsTimeout }).then(async function(collected){
    if( collected.first().content == 1 ) {
      await manualPostNews2Channel(message, locale);

      // Auto delete
      if( message.serverSettings['auto_delete'] ) {
        collected.first().delete().catch(function(err){
          if( err.code == 50013 ) {
            console.log(err.message);
          }
        });
      }
    }
  }).catch(function(e){
    // console.log("Time out on manual posting to channel");
  });
}

const manualPostNews2Channel = async function(message, locale = "na") {

  let news = await fetchNews(1, locale);

  if( news.length > 0 ) {
    for(var i=0; i<news.length; i++) {
      // Embed
      let embed = new Discord.MessageEmbed()
        .setColor( config.defaultEmbedColor )
        .setTitle( news[i].title )
        .setURL( news[i].url );

      if( news[i].description ) {
        embed.setDescription( news[i].description );
      }

      if( news[i].category ) {
        embed.setAuthor( news[i].category.charAt(0).toUpperCase() + news[i].category.slice(1), config.lodestoneImg );
      }

      if( news[i].image ) {
       embed.setImage( news[i].image )
      }

      if( news[i].time ) {
        embed.setFooter( "Posted on " + moment(news[i].time).format("DD MMM YYYY h:mm A") );
      }

      await message.channel.send(embed)
      .then(function(){
        setPosted(message.channel.id, news[i].id);
        helper.printStatus("Manually posted " + news[i].id + " for " + message.channel.id);
      })
      .catch(function(err){
        console.log(err);
        helper.printStatus(message.channel);
      });
    }
  }
}

/******************************
  Post Latest News Prompt
*******************************/
const sendLatestNewsPrompt = async function(message){
  let embed = new Discord.MessageEmbed()
    .setColor(config.defaultEmbedColor)
    .setAuthor( "Lodestone" )
    .setThumbnail( config.lodestoneImg );

  let description = "Do you want to populate this channel with the current news?\n\nReply with `1` to proceed";

  embed.setDescription(description);

  // Send Message
  await message.channel.send( embed ).catch(function(err){
    console.log(err);
  });
}

const autoCheckPostNews = async function(client, ignoreChannelAddedDate=false) {

  let news;
  let news_na = await fetchNews(3, "na");
  let news_eu = await fetchNews(3, "eu");
  let news_jp = await fetchNews(3, "jp");
  let news_de = await fetchNews(3, "de");
  let news_fr = await fetchNews(3, "fr");

  helper.printStatus("========================================================");
  helper.printStatus("Auto checking lodestone news");
  helper.printStatus("========================================================");

  if( client.guilds.cache.size > 0 ) {

    helper.printStatus("Guilds: " + client.guilds.cache.size);

    for await ( var guild of client.guilds.cache.values() ) {
      if( guild.available ) {

        let newsChannel = await newsChannelGet(guild.id);

        if( lodash.isEmpty(newsChannel) == false ) {

          switch(newsChannel.locale) {
            case "jp":
              news = news_jp;
              break;
            case "de":
              news = news_de;
              break;
            case "fr":
              news = news_fr;
              break;
            case "eu":
              news = news_eu;
              break;
            case "na":
            default:
              news = news_na;
          }

          if( news.length > 0 ) {

            let newsChannelDateAddedUnixTime =  moment(newsChannel.last_updated).utc().unix();
            let channel = await client.channels.cache.get(newsChannel.channel_id);

            if(channel) {

              /*
              helper.printStatus("========================================================");
              helper.printStatus("Auto checking lodestone news for channel: " + channel.name);
              helper.printStatus("Locale: " + newsChannel.locale);
              helper.printStatus("========================================================");
              */

              let hasPermission = true;

              for(var i=0; i<news.length; i++) {

                if( hasPermission == false ) break;

                let newsUnixTime = moment(news[i].time).utc().unix();
                let isNewsPosted = await isPosted(newsChannel.channel_id, news[i].id);

                // By default don't post news to channel if the news' published date is older than the date the channel was subscribed
                let isNewsOlderThanChannel = newsUnixTime < newsChannelDateAddedUnixTime;

                if( ignoreChannelAddedDate == true ) {
                  isNewsOlderThanChannel = false;
                }

                if( isNewsPosted == false && isNewsOlderThanChannel == false ) {
                  // Embed
                  let embed = new Discord.MessageEmbed()
                    .setColor( config.defaultEmbedColor )
                    .setTitle( news[i].title )
                    .setURL( news[i].url );

                  if( news[i].description ) {
                    embed.setDescription( news[i].description );
                  }

                  if( news[i].category ) {
                    embed.setAuthor( news[i].category.charAt(0).toUpperCase() + news[i].category.slice(1), config.lodestoneImg );
                  }

                  if( news[i].image ) {
                   embed.setImage( news[i].image )
                  }

                  if( news[i].time ) {
                    embed.setFooter( "Posted on " + moment(news[i].time).format("DD MMM YYYY h:mm A") );
                  }

                  await channel.send(embed)
                  .then(function(){
                    setPosted(newsChannel.channel_id, news[i].id);
                    helper.printStatus("Posted " + news[i].id + " for " + newsChannel.channel_id);
                  })
                  .catch(function(err){

                    // No access or permission to post to channel
                    if( err.code == 50013 || err.code == 50001 ) {
                      hasPermission = false;
                      helper.printStatus("No permission to post lodestone news for channel: " + newsChannel.channel_id );

                      pool.query(`DELETE FROM news_subscription WHERE channel_id = ?`, [newsChannel.channel_id])
                      .then(function(){
                        helper.printStatus("Removed from lodestone news subscription: " + newsChannel.channel_id );
                        pool.query(`DELETE FROM news_posted WHERE channel_id = ?`, [newsChannel.channel_id]);
                      })
                      .catch(function(e){
                        console.log(e);
                      })
                    }
                    else {
                      console.log(err);
                    }

                  });
                }
                else {
                  if( isNewsPosted ) {
                    // helper.printStatus("Already posted " + news[i].id + " for " + newsChannel.channel_id);
                  }

                  if( isNewsOlderThanChannel ) {
                    // helper.printStatus("News pub date is older than channel added date");
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/******************************
  Exports
*******************************/

module.exports = {
  sendLatestNewsPrompt,
  autoCheckPostNews,
  manualPostNews2Channel,
  sendManualPostNews2ChannelPrompt,
  setPosted,
  isPosted,
  fetchNews,
  newsChannelRemove,
  updatePostedNewsNewChannel,
  newsChannelAdd,
  newsChannelGet
}