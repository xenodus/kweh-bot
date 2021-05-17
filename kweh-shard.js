const config = require('./config').production;
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./kweh-bot.js', {
  token: config.discordBotToken,
  respawn: true,
});

manager.on('shardCreate', shard => {
  console.log(`Launched shard ${shard.id}`)
});

manager.spawn();