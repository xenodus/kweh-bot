/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const helper = require('../helper');
const lodestoneNews = require('./lodestone_news.js');
const Discord = require("discord.js");
const axios = require('axios');
const lodash = require('lodash');
const moment = require("moment");

const pool = config.getPool();
const readPool = config.getReadPool();

/******************************
  GET LATEST KWEH NEWS
*******************************/

const getNews = async function() {

  let news = {};

  news = await pool.query("SELECT * FROM kweh_news ORDER BY id DESC LIMIT 1").then(function(res){
    if( res.length > 0 ) {
      return {
        id: res[0].id,
        title: res[0].title,
        content: res[0].content,
        image: res[0].image,
        date_added: res[0].date_added,
        last_updated: res[0].last_updated
      }
    }
  });

  return news;
}

/******************************
  IS NEWS POSTED
*******************************/

const isPosted = async function(channel_id, news_id) {
  let isPosted = false;

  isPosted = await pool.query("SELECT * FROM kweh_news_posted WHERE channel_id = ? AND news_id = ?", [channel_id, news_id]).then(function(res){
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
    `INSERT INTO kweh_news_posted
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

/******************************
  Post Latest News
*******************************/

const autoCheckPostNews = async function(client, ignoreChannelAddedDate=false) {

  let news = await getNews();

  helper.printStatus("========================================================");
  helper.printStatus("Auto checking kweh news");
  helper.printStatus("========================================================");

  if( client.guilds.cache.size > 0 ) {

    helper.printStatus("Guilds: " + client.guilds.cache.size);

    for await ( var guild of client.guilds.cache.values() ) {
      if( guild.available ) {

        let newsChannel = await lodestoneNews.newsChannelGet(guild.id);

        if( lodash.isEmpty(newsChannel) == false && lodash.isEmpty(news) == false ) {

          let newsChannelDateAddedUnixTime =  moment(newsChannel.last_updated).utc().unix();
          let channel = await client.channels.cache.get(newsChannel.channel_id);

          if(channel) {

            let newsUnixTime = moment(news.date_added).utc().unix();
            let isNewsPosted = await isPosted(newsChannel.channel_id, news.id);

            // By default don't post news to channel if the news' published date is older than the date the channel was subscribed
            let isNewsOlderThanChannel = newsUnixTime < newsChannelDateAddedUnixTime;

            if( ignoreChannelAddedDate == true ) {
              isNewsOlderThanChannel = false;
            }

            if( isNewsPosted == false && isNewsOlderThanChannel == false ) {
              // Embed
              let embed = new Discord.MessageEmbed()
                .setColor( config.defaultEmbedColor )
                .setTitle( news.title )
                .setAuthor({ name: "Kweh!", iconURL: config.appLogo});

              if( news.content ) {
                embed.setDescription( news.content );
              }

              if( news.image ) {
               embed.setImage( news.image )
              }

              if( news.date_added ) {
                embed.setFooter({ text: "Posted on " + moment(news.date_added).format("DD MMM YYYY h:mm A") });
              }

              await channel.send({embeds: [embed]})
              .then(function(){
                setPosted(newsChannel.channel_id, news.id);
                helper.printStatus("Posted " + news.id + " for " + newsChannel.channel_id);
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
  autoCheckPostNews
}