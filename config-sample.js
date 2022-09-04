const Redis = require("ioredis");

const mysql = require('promise-mysql');
const useReplica = true;

var pool;
var readPool;
var redis;

const config = {
  production: {
    getRedis: function () {
      if (redis) return redis;
      redis = new Redis({
        port: 1234, // Redis port
        host: "127.0.0.1", // Redis host
        family: 4, // 4 (IPv4) or 6 (IPv6)
        password: "",
        db: 1234, // 1, 2, 3, 4
      });
      return redis;
    },
    getPool: function () {
      if (pool) return pool;
      pool = mysql.createPool({
        connectionLimit : 10,
        host     : '',
        user     : '',
        password : '',
        database : '',
        charset: "utf8mb4"
      });
      return pool;
    },
    getReadPool: function () {
      if (readPool) return readPool;

      if (useReplica) {
        readPool = mysql.createPool({
          connectionLimit : 10,
          host     : '',
          user     : '',
          password : '',
          database : '',
          charset: "utf8mb4"
        });
      }
      else {
        readPool = pool;
      }
      return readPool;
    },
    getStagingPool: function () {
      if (pool) return pool;
      pool = mysql.createPool({
        connectionLimit : 10,
        host     : '',
        user     : '',
        password : '',
        database : '',
        charset: "utf8mb4"
      });
      return pool;
    },

    redisExpiry: 2592000, // item
    lodestoneRedisExpiry: 600,

    // Discord User ID : Name
    adminIDs: {
      '12345': 'bokitoki'
    },

    prefix: "!",
    language: "en",
    languageOptions: ['en', 'jp', 'de', 'fr'],

    statuses: [
      '!kweh prefix',
      '!kweh language',
      '!kweh autodelete',
      '!kweh channel',
      '!register',
      '!me',
      '!profile',
      '!glam',
      '!fflogs',
      '!mb',
      '!tt',
      '!news',
      '!fashion',
      '!item',
      '!maint',
      '!timers',
      '!ec',
      '!donate',
      '!help',
      '!mount',
      '!minion',
      '!title',
      '!barding',
      '!emote'
    ],

    commands: [
      'kweh',
      'language',
      'register',
      'iam',
      'me',
      'whoami',
      'profile',
      'whois',
      'glam',
      'glamour',
      'fflogs',
      'logs',
      'fflogs',
      'parses',
      'mb',
      'market',
      'marketboard',
      'tt',
      'ttcollection',
      'cards',
      'news',
      'lodestone',
      'fr',
      'fashion',
      'item',
      'timer',
      'timers',
      'reset',
      'maint',
      'donate',
      'help',
      'ping',
      // eorzea collection
      'eorzeacollection',
      'ec',
      // housing snap
      'housingsnap',
      'hs',
      // xivcollect
      'mount',
      'minion',
      'title',
      'emote',
      'barding'
    ],

    // Bot Discord User ID
    botID: '12345',
    devBotID: '12345',

    // Top.gg token - https://top.gg/bot/725551243551834112
    topGGtoken: '',

    throttleLimit: 5, // messages limit every 5s
    userPromptsTimeout: 20000,
    itemSearchLimit: 50,

    // Update manually
    totalMinions: 442, // https://ffxivcollect.com/api/minions
    totalMounts: 219, // https://ffxivcollect.com/api/mounts

    defaultEmbedColor: '#F4B400',
    infoEmbedColor: "#4285F4",
    successEmbedColor: "#0F9D58",
    errorEmbedColor: '#DB4437',

    profileImgPath: '/profiles/images/',

    websiteLink: 'https://kwehbot.xyz',
    websiteCommandLink: 'https://kwehbot.xyz/commands',

    donationLink: 'https://www.patreon.com/kwehbot',

    fashionReportAuthorAvatar: 'https://styles.redditmedia.com/t5_c3dzb/styles/profileIcon_59d8xof3jv721.png?width=256&height=256&crop=256:256,smart&s=73f8edb92d50241c184123dd03dda1d5a8e1259b',
    fashionReportAuthorName: 'Miss Kaiyoko Star',
    fashionReportAuthorLink: 'https://www.reddit.com/user/kaiyoko',
    fashionReportRSS: 'https://www.reddit.com/user/kaiyoko/submitted/.rss',

    appName: 'Kweh',
    appLogo: 'https://cdn.discordapp.com/app-icons/725551243551834112/c0e31ba9732567b2c7ea5eb4bddfc370.png',
    appSuccessImg: 'https://cdn.discordapp.com/app-icons/725551243551834112/c0e31ba9732567b2c7ea5eb4bddfc370.png',
    appErrorImg: 'https://cdn.discordapp.com/app-icons/515492989238378497/b73013e1749dccea4ea95585c1918e90.png',

    maintenanceImg: 'https://img.icons8.com/fluent/48/000000/maintenance.png',
    timerImg: 'https://img.icons8.com/officel/16/000000/hourglass-sand-bottom.png',

    // Official Discord Bot Tokens
    discordBotToken: '12345',
    devBotToken: '12345',

    // XIV API
    xivApiToken: '12345',
    xivApiBaseURL: 'https://xivapi.com/',
    xivApiLogo: 'https://xivapi.com/favicon.png',

    eorzeaCollectionLogo: 'https://ffxiv.eorzeacollection.com/resources/favicon/apple-touch-icon.png',

    housingSnapLogo: 'https://i.imgur.com/RZVYuaJ.png',

    universalisApiBaseURL: 'https://universalis.app/api/',
    universalisMarketBaseURL: 'https://universalis.app/market/',
    universalisLogo: 'https://universalis.app/favicon.png',

    // FFLogs
    fflogsLogo: 'https://dmszsuqyoe6y6.cloudfront.net/img/ff/favicon.png',
    fflogsToken: '12345',
    fflogsApiBaseURL: 'https://www.fflogs.com/v1/',
    fflogsBaseURL: 'https://www.fflogs.com/',

    fflogsOAuthURL: 'https://www.fflogs.com/oauth/token',
    fflogsGQLEndpoint: 'https://www.fflogs.com/api/v2/client',
    fflogsClientID: '12345',
    fflogsClientSecret: '12345',

    lodestoneImg: 'https://img.finalfantasyxiv.com/lds/h/0/U2uGfVX4GdZgU1jASO0m9h_xLg.png',
    lodestoneURL: 'https://na.finalfantasyxiv.com/lodestone/character/',
    lodestoneURL_JP: 'https://jp.finalfantasyxiv.com/lodestone/character/',
    lodestoneURL_DE: 'https://de.finalfantasyxiv.com/lodestone/character/',
    lodestoneURL_FR: 'https://fr.finalfantasyxiv.com/lodestone/character/',
    lodestoneApiURL: 'http://na.lodestonenews.com/news/all',
    lodestoneApiURL_EU: 'http://lodestonenews.com/news/all?locale=eu',
    lodestoneApiURL_JP: 'http://lodestonenews.com/news/all?locale=jp',
    lodestoneApiURL_DE: 'http://lodestonenews.com/news/all?locale=de',
    lodestoneApiURL_FR: 'http://lodestonenews.com/news/all?locale=fr',

    xivcollectApiBaseURL: 'https://ffxivcollect.com/api/',

    ffttBaseURL: 'https://triad.raelys.com/',
    ffttApiBaseURL: 'https://triad.raelys.com/api/',
    ffttLogo: 'https://triad.raelys.com/images/logo.png',

    teamcraftBaseURL: 'http://ffxivteamcraft.com/db/',

    newsCategories: [
      'topics',
      'notices',
      'maintenance',
      'updates',
      'status',
      'developers'
    ],

    dcRegions: {
      "JP": [
        'Elemental',
        'Gaia',
        'Mana'
      ],
      "EU": [
        'Chaos',
        'Light'
      ],
      "NA": [
        'Aether',
        'Primal',
        'Crystal'
      ],
      "AU": [
        'Materia'
      ]
    },

    races: {
      '1':  'Hyur',
      '2':  'Elezen',
      '3':  'Lalafell',
      '4':  'Miqo\'te',
      '5':  'Roegadyn',
      '6':  'Au Ra',
      '7':  'Hrothgar',
      '8':  'Viera',
    },

    genders: {
      '1':  'Male',
      '2':  'Female',
    },

    grand_companies: {
      '1':  'The Maelstrom',
      '2':  'Order of the Twin Adder',
      '3':  'The Immortal Flames',
    },

    // https://github.com/xivapi/ffxiv-datamining/blob/master/csv/ClassJob.csv
    classes: {
      // DOW
      '1' : 'Gladiator',
      '2' : 'Pugilist',
      '3' : 'Marauder',
      '4' : 'Lancer',
      '5' : 'Archer',
      '6' : 'Conjurer',
      '7' : 'Thaumaturge',
      '26': 'Arcanist',
      '29': 'Rogue',

      '19': 'Paladin',
      '21': 'Warrior',
      '32': 'Dark Knight',
      '37': 'Gunbreaker',

      '20': 'Monk',
      '22': 'Dragoon',
      '30': 'Ninja',
      '34': 'Samurai',
      '39': 'Reaper',

      '24': 'White Mage',
      '28': 'Scholar',
      '33': 'Astrologian',
      '40': 'Sage',

      '23': 'Bard',
      '31': 'Machinist',
      '38': 'Dancer',

      '25': 'Black Mage',
      '27': 'Summoner',
      '35': 'Red Mage',
      '36': 'Blue Mage',

      // DOH
      '8' : 'Carpenter',
      '9' : 'Blacksmith',
      '10': 'Armorer',
      '11': 'Goldsmith',
      '12': 'Leatherworker',
      '13': 'Weaver',
      '14': 'Alchemist',
      '15': 'Culinarian',

      // DOL
      '16': 'Miner',
      '17': 'Botanist',
      '18': 'Fisher',
    },
  },
};
module.exports = config;