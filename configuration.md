# Configuration

## Game server

Environment vars:

- `PORT`: (Number) port to listen on
- `GAME_SERVER_HOST_NAME`: name of the host
- `GAME_SERVER_HOST_ID`: (Number) id of the host
- `BOT_IPC_URL`: url of the bot proxy

## Bot proxy

Environment vars:

- `BOT_PROXY_PORT`: (Number) port to listen on
- `TOTAL_SHARDS`: total amount of bot shards. This must add up to the total amount of shards being spawned by bot shard managers. See `SHARD_LIST` @ Bot shard manager

## Bot shard manager

Environment vars:

- `PORT`: (Number) port to listen on
- `SHARD_MANAGER_ID`: (Number) id of the shard manager host
- `SHARD_LIST`: (Array<Number>) list of shards to spawn. Each element must be a unique number and the set of all shards spawned by all shard managers must be consecutive starting from 0.
