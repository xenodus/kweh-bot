const config = require('./config').production;
const { AutoPoster } = require('topgg-autoposter')
const { ShardingManager } = require('discord.js');

const manager = new ShardingManager('./dev-bot.js', {
  token: config.devBotToken,
  respawn: true
});

const poster = AutoPoster(config.topGGtoken, manager)

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();