/******************************
  Variables & Libs
*******************************/

const config = require('../config').production;
const helper = require('../helper');
const Discord = require("discord.js");
const axios = require('axios');
const moment = require("moment");

const pool = config.getPool();
const readPool = config.getReadPool();

/******************************
  Eorzea Time Functions
*******************************/

const printTimers = async function(message) {
  let eorzeaTime = getEorzeaTime();
  let weeklyReset = getWeeklyReset() / 1000;
  let dailyReset = getDailyReset() / 1000;

  // ET
  eorzeaTimeString = moment().hour(eorzeaTime.hour).minute(eorzeaTime.minute).format("h:mm A");

  // Weekly
  let weeklyResetDays = Math.floor(weeklyReset / 24 / 3600);
  let weeklyResetHours = Math.floor((weeklyReset - (weeklyResetDays*24*3600)) / 3600);
  let weeklyResetMinutes = Math.floor((weeklyReset - (weeklyResetDays*24*3600) - (weeklyResetHours*3600)) / 60);
  let weeklyResetString = "";

  weeklyResetString += weeklyResetDays > 0 ? (weeklyResetDays>1?weeklyResetDays+" Days ":weeklyResetDays+" Day ") : "";
  weeklyResetString += weeklyResetHours > 0 ? (weeklyResetHours>1?weeklyResetHours+" Hours ":weeklyResetHours+" Hour ") : "";
  weeklyResetString += weeklyResetMinutes > 0 ? (weeklyResetMinutes>1?weeklyResetMinutes+" Minutes ":weeklyResetMinutes+" Minute ") : "";

  // Daily
  let dailyResetHours = Math.floor( dailyReset / 3600 );
  let dailyResetMinutes = Math.floor( (dailyReset - (dailyResetHours * 3600)) / 60 );
  let dailyResetString = "";

  dailyResetString += dailyResetHours > 0 ? (dailyResetHours>1?dailyResetHours+" Hours ":dailyResetHours+" Hour ") : "";
  dailyResetString += dailyResetMinutes > 0 ? (dailyResetMinutes>1?dailyResetMinutes+" Minutes ":dailyResetMinutes+" Minute ") : "";

  // Embed
  let embed = new Discord.MessageEmbed()
    .setColor( config.defaultEmbedColor )
    .setAuthor({name: "Timers", iconURL: config.timerImg});

  embed.addFields(
    { name: "Eorzea Time", value: eorzeaTimeString },
    { name: "Daily Reset", value: dailyResetString },
    { name: "Weekly Reset", value: weeklyResetString }
  );

  // Maintenance
  let next_maint = await getNextMaintenance();
  let nextMaintString = "None";
  let isOngoing = false;

  if( next_maint["date_start"] != 0 ) {

    let maintStart = moment(next_maint["date_start"]);
    let maintEnd = moment(next_maint["date_end"]);
    let currDatetime = moment();

    let maintDiff = maintStart.diff( currDatetime ) / 1000;

    if( currDatetime.isBetween(maintStart, maintEnd) ) {
      maintDiff = maintEnd.diff( currDatetime ) / 1000;
      isOngoing = true;
    }

    let maintDays = Math.floor(maintDiff / 24 / 3600);
    let maintHours = Math.floor((maintDiff - (maintDays*24*3600)) / 3600);
    let maintMinutes = Math.floor((maintDiff - (maintDays*24*3600) - (maintHours*3600)) / 60);

    nextMaintString = "";

    nextMaintString += maintDays > 0 ? (maintDays>1?maintDays+" Days ":maintDays+" Day ") : "";
    nextMaintString += maintHours > 0 ? (maintHours>1?maintHours+" Hours ":maintHours+" Hour ") : "";
    nextMaintString += maintMinutes > 0 ? (maintMinutes>1?maintMinutes+" Minutes ":maintMinutes+" Minute ") : "";

    nextMaintString += "\n" + "["+next_maint["name"]+"]("+next_maint["url"]+")";
  }

  if( nextMaintString ) {
    if( isOngoing )
      embed.addFields({ name: "Maintenance (Ongoing)", value: nextMaintString });
    else
      embed.addFields({ name: "Next Maintenance", value: nextMaintString });
  }

  // Channel
  let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

  // Send Message
  channel.send({ embeds: [embed] }).catch(function(err){
    console.log(err);
  });
}

const printMaint = async function(message) {

  let embed = new Discord.MessageEmbed()
    .setColor( config.defaultEmbedColor )
    .setAuthor({name: "Maintenance", iconURL: config.maintenanceImg});

  let next_maint = await getNextMaintenance();

  if( next_maint["date_start"] != 0 ) {

    // Name + URL
    let nextMaintString = "["+next_maint["name"]+"]("+next_maint["url"]+")";
    embed.setDescription(nextMaintString);

    // Countdown
    let maintStart = moment(next_maint["date_start"]);
    let maintEnd = moment(next_maint["date_end"]);
    let currDatetime = moment();
    let label = "Starting In"
    let isOngoing = false;

    let maintDiff = maintStart.diff( currDatetime ) / 1000;

    if( currDatetime.isBetween(maintStart, maintEnd) ) {
      maintDiff = maintEnd.diff( currDatetime ) / 1000;
      isOngoing = true;
    }

    let maintDays = Math.floor(maintDiff / 24 / 3600);
    let maintHours = Math.floor((maintDiff - (maintDays*24*3600)) / 3600);
    let maintMinutes = Math.floor((maintDiff - (maintDays*24*3600) - (maintHours*3600)) / 60);

    let timeToMaintString = "";
    timeToMaintString += maintDays > 0 ? (maintDays>1?maintDays+" Days ":maintDays+" Day ") : "";
    timeToMaintString += maintHours > 0 ? (maintHours>1?maintHours+" Hours ":maintHours+" Hour ") : "";
    timeToMaintString += maintMinutes > 0 ? (maintMinutes>1?maintMinutes+" Minutes ":maintMinutes+" Minute ") : "";

    if( isOngoing ) {
      timeToMaintString += " (Ongoing)";
      label = "Finishing In";
    }

    embed.addFields({ name: label, value: timeToMaintString });
  }
  else {
    embed.setDescription("No upcoming maintenance");

    let last_maint = await getLastMaintenance();

    if( last_maint["date_end"] != 0 ) {
      let lastMaintString = "["+last_maint["name"]+"]("+last_maint["url"]+")";

      let currDatetime = moment();
      let maintEnd = moment( last_maint["date_end"] );
      let maintDiff = currDatetime.diff( maintEnd ) / 1000;

      let maintDays = Math.floor(maintDiff / 24 / 3600);
      let maintHours = Math.floor((maintDiff - (maintDays*24*3600)) / 3600);
      let maintMinutes = Math.floor((maintDiff - (maintDays*24*3600) - (maintHours*3600)) / 60);

      let timeToMaintString = "";
      timeToMaintString += maintDays > 0 ? (maintDays>1?maintDays+" Days ":maintDays+" Day ") : "";
      timeToMaintString += maintHours > 0 ? (maintHours>1?maintHours+" Hours ":maintHours+" Hour ") : "";
      timeToMaintString += maintMinutes > 0 ? (maintMinutes>1?maintMinutes+" Minutes ":maintMinutes+" Minute ") : "";

      lastMaintString += "\n" + timeToMaintString + " ago";

      embed.addFields({ name: "Last Completed", value: lastMaintString });
    }
  }

  // Channel
  let channel = message.serverSettings["default_channel"] ? message.serverSettings["default_channel"] : message.channel;

  // Send Message
  channel.send({ embeds: [embed] }).catch(function(err){
    console.log(err);
  });
}

const getNextMaintenance = async function() {
  let next_maint = {
    name: "",
    url: "",
    date_start: 0,
    date_end: 0
  };

  await readPool.query("SELECT * FROM `events` WHERE type = 'maintenance' AND date_end > NOW() ORDER BY date_start ASC LIMIT 1").then(function(res){
    if( res.length > 0 ) {
      next_maint["date_start"] = res[0].date_start;
      next_maint["date_end"] = res[0].date_end;
      next_maint["name"] = res[0].name;
      next_maint["url"] = res[0].url;
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return next_maint;
}

const getLastMaintenance = async function() {
  let last_maint = {
    name: "",
    url: "",
    date_start: 0,
    date_end: 0
  };

  await readPool.query("SELECT * FROM `events` WHERE type = 'maintenance' AND date_end < NOW() ORDER BY date_start DESC LIMIT 1").then(function(res){
    if( res.length > 0 ) {
      last_maint["date_start"] = res[0].date_start;
      last_maint["date_end"] = res[0].date_end;
      last_maint["name"] = res[0].name;
      last_maint["url"] = res[0].url;
    }
  })
  .catch(function(err){
    console.log(err);
  });

  return last_maint;
}

const getWeeklyReset = function() {
  let currDatetime = moment();
  let currDay = currDatetime.day();
  let resetDatetime = moment();

  if( currDay == 2 ) {

    resetDatetime = currDatetime.clone().second(0).minute(0).hour(16);

    if( currDatetime.diff( resetDatetime ) > 0 ) {
      resetDatetime = currDatetime.clone().add(7, 'days').second(0).minute(0).hour(16); // next tue?
    }
    else {
      resetDatetime = currDatetime.clone().second(0).minute(0).hour(16); // today
    }
  }
  else if( currDay < 2 ) {
    resetDatetime = currDatetime.clone().add( 2-currDay , 'days').second(0).minute(0).hour(16); // next tue?
  }
  else {
    resetDatetime = currDatetime.clone().add( 9-currDay , 'days').second(0).minute(0).hour(16); // next tue?
  }

  return resetDatetime.diff( currDatetime );
}

const getDailyReset = function() {

  let currDatetime = moment();
  let dateDiff = 0;

  if( currDatetime.hour() >= 23 ) {
    let tmrDatetime = moment().add(1, 'day').second(0).minute(0).hour(23);
    dateDiff = tmrDatetime.diff( currDatetime );
  }
  else {
    let todayResetDatetime = moment().second(0).minute(0).hour(23);
    dateDiff = todayResetDatetime.diff( currDatetime );
  }

  return dateDiff;
}

const getEorzeaTime = function() {
  let localEpoch = (new Date()).getTime();
  let epoch = localEpoch * 20.571428571428573;
  let minutes = parseInt((epoch / (1000 * 60)) % 60);
  let hours = parseInt((epoch / (1000 * 60 * 60)) % 24);

  return {
    hour: hours,
    minute: minutes
  }
}

/******************************
  Exports
*******************************/

module.exports = {
  getWeeklyReset,
  getEorzeaTime,
  getDailyReset,
  getNextMaintenance,
  getLastMaintenance,
  printMaint,
  printTimers
}