# Configuration

## Web server: `server/web.js`

Environment vars:

- `PORT`: (Number) port to listen on
- `GAME_SERVER_URL`: url of the game server
- `WEB_HOST_ID`: id of the host
- `WEB_HOST_NAME`: name of the host
- `WEB_SERVER_URL`: public URL of the web host
- `BOT_CLIENT_ID`: (Number) client id of the Discord bot
- `DISCORD_SERVER_INVITE`: invite link to official Discord server

## Game server: `server/index.js`

Environment vars:

- `GAME_SERVER_HOST_PORT`: (Number) port to listen on
- `GAME_SERVER_HOST_NAME`: name of the host
- `GAME_SERVER_HOST_ID`: id of the host
- `BOT_IPC_URL`: url of the bot proxy

## Bot proxy: `bot/proxy.js`

Environment vars:

- `BOT_PROXY_PORT`: (Number) port to listen on
- `TOTAL_SHARDS`: total amount of bot shards. This must add up to the total amount of shards being spawned by bot shard managers. See `SHARD_LIST` @ Bot shard manager

## Bot shard manager: `bot/index.js`

Environment vars:

- `PORT`: (Number) port to listen on
- `SHARD_MANAGER_ID`: (Number) id of the shard manager host
- `SHARD_LIST`: (Array<Number>) list of shards to spawn. Each element must be a unique number and the set of all shards spawned by all shard managers must be consecutive starting from 0.
