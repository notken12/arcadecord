# Arcadecord

A collection of games that you can play in Discord. Basically GamePigeon for Discord.

## How this works

### Parts of the system

* Player
* Discord bot `/bot`
* Game server `/server.js`, `/games/Game.js`, `/games/gamesManager.js`, `/games/types/*`
* Website `/server.js`, `/games/types/*/index.html`, `/public`

### Gameplay process

1. The player can create a game with a Discord slash command. 
2. The Discord bot listens for the slash command and tells the game server, which creates a game. 
3. The Discord bot sends the link to play the game that was created. 
4. The player clicks the link and is brought to the website to play the game.
6. Players log in with their Discord accounts. 
5. The website broadcasts the player's actions to the server so that gameplay is recorded.
6. The server notifies the website when other players finish their turns and gives an updated state of the game. 
7. The Discord bot will send messages about events such as players finishing turns and when the game is over. 

## Discord bot

For the bot we are using Discord.js. The Discord application credentials (bot token, client secret, client id) are stored in `/.env`. The file is private and will need to be shared with you before you can run the program. 

The main script for the bot is `/bot/bot.js`. Each interaction (commands, buttons, select menus) has its own script within the `/bot` folder. 

## Game server

The games running in the server are managed from `/games/gamesManager.js`. 

### `Game.js`

The base class for all games. Contains logic for event handlers and action models. All game types extend this class. 

### `gamesManager.js`

For now it just stores all the active games but later games will be saved to a database to prevent data loss when the server crashes.

### Game types

Each different game has a folder in `/games/types`. The folder name is the game type's ID. The folder contains 3 files:

* main.js
* common.js
* index.html

#### `main.js`

The main script for the game.

Exports: 

* `options`
* `Game`

##### options

Object that contains info about the game. 

* `name`: Displayname of the game
* `description`: Description of the game
* `aliases`: String[], game aliases, may be used later for searching for games
* `typeId`: The ID of the game type. This will be used as the name of all folders related to the game type.
* `minPlayers`: Number, minimum players required to play the game
* `maxPlayers`: Number, maximum players
* `emoji`: String, emoji used to represent the game. Can be normal emoji or custom discord emojis. Discord bots can use custom Discord emojis as if they were Nitro users.
* `data`: Object, default data of the game. Game data is all the data about the game state. Ex: chess board state.

This object is important because it is read to display the game in the Discord commands and make it available without the need to hard-code it in. See `/games/game-types.js`.

##### Game

A class that extends the class `Game` from `/games/Game.js`. Will be called to create a new game. In the constructor, a new `Game` will be created with `super(options);` and then action models and event handlers are assigned. 

Optionally, a `getThumbnail` function can be defined which is used to generate a thumbnail for the Discord messages. 

#### `common.js`

A file that contains data and functions that are used in both the website client and the game server. `main.js` requires `common.js`. Common action models must be functions from `common.js`. Examples of data stored in this file are:

* Numbers for tile states on a checker board, ex. `TILE_EMPTY = 0`, `TILE_WHITE = 1`, `TILE_BLACK = 2`
* Utility functions for the game
* Action models - mandatory. These will be explained later.
* **Any variables that needs to be constant between the client and the server.**

The file will be served over http at `/gamecommons/<game_type_id>`.

#### `index.html`

The html file for playing the game. We will be using [vue.js](https://v3.vuejs.org/) to create a template of the basic UI (settings button, game manual). It's highly recommended to use it for the game UI. Check out vue's Getting Started guide.

Import `/public/js/client-framework.js` in the game's script. It contains all the utilities you need to implement interactivity with the server. It will be explained later.