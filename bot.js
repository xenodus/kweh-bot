const config = require('./config').production;
const { AutoPoster } = require('topgg-autoposter')
const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./kweh-bot.js', {
  token: config.discordBotToken,
  respawn: true
});

const poster = AutoPoster(config.topGGtoken, manager)

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();