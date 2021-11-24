const config = require('./config').production;
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./dev-bot.js', {
  token: config.devBotToken }
);

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();