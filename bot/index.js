const { ShardingManager } = require('discord.js');

// load .env that will be used for all processes running shard managers
require('dotenv').config({
    path: './bot/.env'
});

//load config for this specific process
var processId = process.argv[2];

const config = require('./config/' + processId + '.json');

var shardList = config.shardList.map(id => Number(id));
var totalShards = Number(process.env.TOTAL_SHARDS);

// create sharding manager
const manager = new ShardingManager('./bot/bot.js', {
    token: process.env.BOT_TOKEN,
    shardList: shardList,
    totalShards: totalShards
});

console.log("Starting shard manager " + processId + " with " + shardList.length + " shards out of " + totalShards +" total shards");

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();