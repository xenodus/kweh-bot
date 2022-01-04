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

const Parser = require('rss-parser');
const parser = new Parser();

/******************************
  Fashion Report Functions
*******************************/

const autoCheckPostFR = async function(client, ignoreChannelAddedDate=false) {

  let fr = await fetchFR(5);

  helper.printStatus("========================================================");
  helper.printStatus("Auto checking fashion reports");
  helper.printStatus("========================================================");

  if( fr.length > 0 ) {
    if( client.guilds.cache.size > 0 ) {

      helper.printStatus("Guilds: " + client.guilds.cache.size);

      for await( var guild of client.guilds.cache.values() ) {
        if( guild.available ) {

          let frChannel = await frChannelGet(guild.id);

          if( lodash.isEmpty(frChannel) == false ) {

            let frChannelDateAddedUnixTime =  moment(frChannel.last_updated).utc().unix();
            let channel = await client.channels.cache.get(frChannel.channel_id);

            if(channel) {

              /*
              helper.printStatus("========================================================");
              helper.printStatus("Auto checking fashion report for channel " + channel.name);
              helper.printStatus("========================================================");
              */

              let hasPermission = true;

              for(var i=0; i<fr.length; i++) {

                if( hasPermission == false ) break;

                let newsUnixTime = moment(fr[i].isoDate).utc().unix();
                let isNewsPosted = await isPosted(frChannel.channel_id, fr[i].id);

                // By default don't post fr to channel if the news' published date is older than the date the channel was subscribed
                let isNewsOlderThanChannel = newsUnixTime < frChannelDateAddedUnixTime;

                if( ignoreChannelAddedDate == true ) {
                  isNewsOlderThanChannel = false;
                }

                if( isNewsPosted == false && isNewsOlderThanChannel == false ) {
                  let embed = new Discord.MessageEmbed()
                    .setColor( config.defaultEmbedColor )
                    .setAuthor({name: config.fashionReportAuthorName, iconURL: config.fashionReportAuthorAvatar})
                    .setTitle( fr[i].title )
                    .setURL( fr[i].link );

                  if( fr[i].images && fr[i].images.length > 0 ) {
                   embed.setImage( fr[i].images[0] )
                  }

                  if( fr[i].isoDate ) {
                    embed.setFooter({text: "Posted on " + moment(fr[i].isoDate).format("DD MMM YYYY h:mm A")});
                  }

                  // Expiry date
                  let postDate = moment(fr[i].isoDate);
                  let postDateDay = moment(fr[i].isoDate).day(); // 2 == Tue
                  let postDateExpiryDate = postDate.clone();
                  let currDate = moment();

                  if(postDateDay>2) {
                    postDateExpiryDate.add( 9-postDateDay , 'days');
                  }
                  else if(postDateDay<2) {
                    postDateExpiryDate.add( 2-postDateDay , 'days');
                  }

                  postDateExpiryDate.hours(16).minutes(0).seconds(0).milliseconds(0);

                  if( currDate.isBefore( postDateExpiryDate ) ) {

                    let differenceDays = postDateExpiryDate.diff( currDate, 'days' );
                    let differenceHours = postDateExpiryDate.diff( currDate, 'hours' ) - ( postDateExpiryDate.diff( currDate, 'days' ) * 24 );
                    let differenceMinutes = postDateExpiryDate.diff( currDate, 'minutes' ) - ( postDateExpiryDate.diff( currDate, 'hours' ) * 60 );
                    let differenceSeconds = postDateExpiryDate.diff( currDate, 'seconds' ) - ( postDateExpiryDate.diff( currDate, 'minutes' ) * 60 );

                    let description = "Resets in ";

                    description += differenceDays > 0 ? (differenceDays>1?differenceDays+" Days ":differenceDays+" Day ") : "";
                    description += differenceHours > 0 ? (differenceHours>1?differenceHours+" Hours ":differenceHours+" Hours ") : "";
                    description += differenceMinutes > 0 ? (differenceMinutes>1?differenceMinutes+" Minutes ":differenceMinutes+" Minute ") : "";
                    description += differenceSeconds > 0 ? (differenceSeconds>1?differenceSeconds+" Seconds ":differenceSeconds+" Second ") : "";

                    embed.setDescription(description);
                  }
                  else {

                    let differenceDays = currDate.diff( postDateExpiryDate, 'days' );
                    let differenceHours = currDate.diff( postDateExpiryDate, 'hours' ) - ( currDate.diff( postDateExpiryDate, 'days' ) * 24 );
                    let differenceMinutes = currDate.diff( postDateExpiryDate, 'minutes' ) - ( currDate.diff( postDateExpiryDate, 'hours' ) * 60 );
                    let differenceSeconds = currDate.diff( postDateExpiryDate, 'seconds' ) - ( currDate.diff( postDateExpiryDate, 'minutes' ) * 60 );

                    let description = "Expired for ";

                    description += differenceDays > 0 ? (differenceDays>1?differenceDays+" Days ":differenceDays+" Day ") : "";
                    description += differenceHours > 0 ? (differenceHours>1?differenceHours+" Hours ":differenceHours+" Hours ") : "";
                    description += differenceMinutes > 0 ? (differenceMinutes>1?differenceMinutes+" Minutes ":differenceMinutes+" Minute ") : "";
                    description += differenceSeconds > 0 ? (differenceSeconds>1?differenceSeconds+" Seconds ":differenceSeconds+" Second ") : "";

                    embed.setDescription(description);
                    embed.setTitle( "[Expired] " + embed.title );
                  }

                  await channel.send({ embeds: [embed] })
                  .then(function(){
                    setPosted(frChannel.channel_id, fr[i].id);
                    helper.printStatus("Posted FR " + fr[i].id + " for " + frChannel.channel_id);
                  })
                  .catch(function(err){

                    // No access or permission to post to channel
                    if( err.code == 50013 || err.code == 50001 ) {
                      hasPermission = false;
                      helper.printStatus("No permission to post fashion report for channel: " + frChannel.channel_id );

                      pool.query(`DELETE FROM fashion_report_subscription WHERE channel_id = ?`, [frChannel.channel_id])
                      .then(function(){
                        helper.printStatus("Removed from fashion report subscription: " + frChannel.channel_id );
                        pool.query(`DELETE FROM fashion_report_posted WHERE channel_id = ?`, [frChannel.channel_id]);
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
                    // helper.printStatus("Already posted FR " + fr[i].id + " for " + frChannel.channel_id);
                  }

                  if( isNewsOlderThanChannel ) {
                    // helper.printStatus("FR pub date is older than channel added date");
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

const sendLatestFRPrompt = async function(message){
  let embed = new Discord.MessageEmbed()
    .setColor(config.defaultEmbedColor)
    .setAuthor({name: "Fashion Report by " + config.fashionReportAuthorName})
    .setThumbnail( config.fashionReportAuthorAvatar );

  let description = "Do you want to display the latest fashion report?\n\nReply with `1` to proceed";

  embed.setDescription(description);

  // Send Message
  await message.channel.send({ embeds: [embed] }).catch(function(err){
    console.log(err);
  });
}

const sendManualPostFR2ChannelPrompt = async function(message) {
  await sendLatestFRPrompt(message);

  let postLatestFRFilter = function(m){
    return m.content == 1;
  };

  // Await Reply
  message.channel.awaitMessages({ postLatestFRFilter, max: 1, time: config.userPromptsTimeout }).then(async function(collected){
    if( collected.first().content == 1 ) {
      await manualPostFR2Channel(message);

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

const manualPostFR2Channel = async function(message) {
  let fr = await fetchFR(1);

  if( fr.length > 0 ) {
    for(var i=0; i<fr.length; i++) {
      // Embed
      let embed = new Discord.MessageEmbed()
        .setColor( config.defaultEmbedColor )
        .setAuthor({name: config.fashionReportAuthorName, iconURL: config.fashionReportAuthorAvatar})
        .setTitle( fr[i].title )
        .setURL( fr[i].link );

      if( fr[i].images && fr[i].images.length > 0 ) {
       embed.setImage( fr[i].images[0] )
      }

      if( fr[i].isoDate ) {
        embed.setFooter({text: "Posted on " + moment(fr[i].isoDate).format("DD MMM YYYY h:mm A")});
      }

      // Expiry date
      let postDate = moment(fr[i].isoDate);
      let postDateDay = moment(fr[i].isoDate).day(); // 2 == Tue
      let postDateExpiryDate = postDate.clone();
      let currDate = moment();

      if(postDateDay>2) {
        postDateExpiryDate.add( 9-postDateDay , 'days');
      }
      else if(postDateDay<2) {
        postDateExpiryDate.add( 2-postDateDay , 'days');
      }

      postDateExpiryDate.hours(16).minutes(0).seconds(0).milliseconds(0);

      if( currDate.isBefore( postDateExpiryDate ) ) {

        let differenceDays = postDateExpiryDate.diff( currDate, 'days' );
        let differenceHours = postDateExpiryDate.diff( currDate, 'hours' ) - ( postDateExpiryDate.diff( currDate, 'days' ) * 24 );
        let differenceMinutes = postDateExpiryDate.diff( currDate, 'minutes' ) - ( postDateExpiryDate.diff( currDate, 'hours' ) * 60 );
        let differenceSeconds = postDateExpiryDate.diff( currDate, 'seconds' ) - ( postDateExpiryDate.diff( currDate, 'minutes' ) * 60 );

        let description = "Resets in ";

        description += differenceDays > 0 ? (differenceDays>1?differenceDays+" Days ":differenceDays+" Day ") : "";
        description += differenceHours > 0 ? (differenceHours>1?differenceHours+" Hours ":differenceHours+" Hours ") : "";
        description += differenceMinutes > 0 ? (differenceMinutes>1?differenceMinutes+" Minutes ":differenceMinutes+" Minute ") : "";
        description += differenceSeconds > 0 ? (differenceSeconds>1?differenceSeconds+" Seconds ":differenceSeconds+" Second ") : "";

        embed.setDescription(description);
      }
      else {

        let differenceDays = currDate.diff( postDateExpiryDate, 'days' );
        let differenceHours = currDate.diff( postDateExpiryDate, 'hours' ) - ( currDate.diff( postDateExpiryDate, 'days' ) * 24 );
        let differenceMinutes = currDate.diff( postDateExpiryDate, 'minutes' ) - ( currDate.diff( postDateExpiryDate, 'hours' ) * 60 );
        let differenceSeconds = currDate.diff( postDateExpiryDate, 'seconds' ) - ( currDate.diff( postDateExpiryDate, 'minutes' ) * 60 );

        let description = "Expired for ";

        description += differenceDays > 0 ? (differenceDays>1?differenceDays+" Days ":differenceDays+" Day ") : "";
        description += differenceHours > 0 ? (differenceHours>1?differenceHours+" Hours ":differenceHours+" Hours ") : "";
        description += differenceMinutes > 0 ? (differenceMinutes>1?differenceMinutes+" Minutes ":differenceMinutes+" Minute ") : "";
        description += differenceSeconds > 0 ? (differenceSeconds>1?differenceSeconds+" Seconds ":differenceSeconds+" Second ") : "";

        embed.setDescription(description);
        embed.setTitle( "[Expired] " + embed.title );
      }

      await message.channel.send({ embeds: [embed] })
      .then(function(){
        setPosted(message.channel.id, fr[i].id);
        helper.printStatus("Manually posted FR " + fr[i].id + " for " + message.channel.id);
      })
      .catch(function(err){
        helper.handleDiscordError(err, message)
      });
    }
  }
  else {
    helper.sendErrorMsg("Error!", "Unable to retrieve Fashion Report", message);
  }
}

const fetchFR = async function(limit=1) {
  let feed = await parser.parseURL( config.fashionReportRSS );
  let items = [];

  if( feed.items.length > 0 ) {

    feed.items = lodash.orderBy(feed.items, ['isoDate'], ['desc']);

    // Only get posts with imgur links in them
    feed.items = feed.items.filter(function(i){
      return i.content.search(/imgur\.com/i) > 0;
    });

    // Only get posts with imgur links in them
    feed.items = feed.items.filter(function(i){
      return i.content.search(/Fashion Report/i) > 0;
    });

    // Extract imgur images
    feed.items = feed.items.map(function(i){
      i.images = i.content.match(/https:\/\/i\.imgur\.com\/.*\.png/gi);
      return i;
    });

    items = feed.items;
    items = items.slice(0, limit);
  }

  return items;
}

const frChannelGet = async function(server_id) {

  let frChannel = {};

  frChannel = await readPool.query("SELECT * FROM fashion_report_subscription WHERE server_id = ?", [server_id]).then(function(res){

    if( res.length > 0 ) {
      return {
        id: res[0].id,
        server_id: res[0].server_id,
        channel_id: res[0].channel_id,
        channel_name: res[0].channel_name,
        updated_by_user_id: res[0].updated_by_user_id,
        date_added: res[0].date_added,
        last_updated: res[0].last_updated
      }
    }
  });

  return frChannel;
}

const frChannelAdd = async function(message) {

  let curr_datetime = moment().format('YYYY-M-D HH:mm:ss');

  await pool.query(
    `INSERT INTO fashion_report_subscription
    (server_id, channel_id, channel_name, updated_by_user_id, date_added, last_updated) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE channel_id = VALUES(channel_id), channel_name = VALUES(channel_name), updated_by_user_id = VALUES(updated_by_user_id), last_updated = VALUES(last_updated)`,
    [
      message.guild.id,
      message.channel.id,
      message.channel.name,
      message.author.id,
      curr_datetime,
      curr_datetime
    ]
  )
  .catch(function(e){
    helper.handleDiscordError(e, message)
  })

  return;
}

const updateFRNewChannel = async function(old_channel_id, new_channel_id){
  await pool.query(
    `UPDATE fashion_report_posted SET channel_id = ? WHERE channel_id = ?`,
    [
      new_channel_id,
      old_channel_id
    ]
  )
  .catch(function(e){
    console.log(e);
  })
}

const frChannelRemove = async function(message) {
  await pool.query(`DELETE FROM fashion_report_subscription WHERE channel_id = ?`, [message.channel.id])
  .catch(function(e){
    console.log(e);
  })
}

const isPosted = async function(channel_id, report_id) {
  let isPosted = false;

  isPosted = await readPool.query("SELECT * FROM fashion_report_posted WHERE channel_id = ? AND report_id = ?", [channel_id, report_id]).then(function(res){
    if( res.length > 0 ) {
      return true;
    }
    return false;
  });

  return isPosted;
}

const setPosted = function(channel_id, report_id) {

  let curr_datetime = moment().format('YYYY-M-D HH:mm:ss');

  pool.query(
    `INSERT INTO fashion_report_posted
    (report_id, channel_id, date_added) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE date_added = VALUES(date_added)`,
    [
      report_id,
      channel_id,
      curr_datetime
    ]
  )
  .catch(function(e){
    console.log(e);
  })
}

/******************************
  Exports
*******************************/

module.exports = {
  sendLatestFRPrompt,
  autoCheckPostFR,
  manualPostFR2Channel,
  sendManualPostFR2ChannelPrompt,
  setPosted,
  isPosted,
  fetchFR,
  frChannelRemove,
  updateFRNewChannel,
  frChannelAdd,
  frChannelGet
}