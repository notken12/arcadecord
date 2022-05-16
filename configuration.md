# Configuration

## Web server: `server/web.js`

Environment vars:

- `PORT`: (Number) port to listen on
- `VITE_GAME_SERVER_URL`: url of the game server
- `WEB_HOST_ID`: id of the host
- `WEB_HOST_NAME`: name of the host
- `WEB_SERVER_URL`: public URL of the web host
- `BOT_CLIENT_ID`: (Number) client id of the Discord bot
- `DISCORD_SERVER_INVITE`: invite link to official Discord server
- `GAME_SERVER_PROXY_PORT`: (Number) (optional) Specify a port to proxy websocket to so that only 1 port needs to be exposed to the web. Useful for Heroku which only allows you to expose one random port which is the PORT variable.
- `TOTAL_SHARDS`: total amount of bot shards. This must add up to the total amount of shards being spawned by bot shard managers. See `SHARD_LIST` @ Bot shard manager
- `SHARD_MANAGER_COUNT`: amount of shard managers that exist.
- `SHARD_MANAGER_POD_PREFIX`: name of kubernetes StatefulSet service that the pods are under + '-'. Used to find the hostnames of bot shard managers

## Game server: `server/index.js`

Environment vars:

- `GAME_SERVER_HOST_PORT`: (Number) port to listen on
- `GAME_SERVER_HOST_NAME`: name of the host
- `GAME_SERVER_HOST_ID`: id of the host
- `BOT_IPC_URL`: url of the bot proxy
- `WEB_SERVER_URL`: public URL of the web host

## Bot shard manager: `bot/index.js`

Environment vars:

- `PORT`: (Number) port to listen on
- `POD_NAME`: name of the Kubernetes pod the container is running on. Used to derive which shards to spawn
- `SHARD_MANAGER_COUNT`: amount of shard managers that exist.
- `SHARD_MANAGER_POD_PREFIX`: name of kubernetes StatefulSet service that the pods are under + '-'. Used to find the hostnames of bot shard managers
