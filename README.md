# Arcadecord

A collection of games that you can play in Discord. Basically GamePigeon for Discord.

## Todo
* Use private keys for users instead of user ID to authenticate
* Add more games
* Add player winning ui
    * confetti, use canvas-confetti
    * Play again button
* Add player losing ui
    * Play again button
* Add settings ui
* Log player actions to Azure Application Insights
* Allow players to only invite certain people to games
* Create app icon
* Work on example game
* Add unique IDs to every action and turn
* Add feedback center
* Store games in database
    * Add new property in games, internal (secret) data
* Log actions and turns
* Add support for turns not in order of players
* Redo game flow functiosn to be centralized

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

## Example game

See the example game in the `/games/types/example` folder. This is the easiest way to get started with making an Arcadecord game.

## Discord bot

For the bot we are using Discord.js. The Discord application credentials (bot token, client secret, client id) are stored in `/.env`. The file is private and will need to be shared with you before you can run the program. 

The main script for the bot is `/bot/bot.js`. Each interaction (commands, buttons, select menus) has its own script within the `/bot` folder. 

## Game server

The games running in the server are managed from `/games/gamesManager.js`. 

### `Game.js`

The base class for all games. Contains logic for event handlers and action models. All game types extend this class. 

#### Logic

Gameplay is turn-based. Each player takes a turn during the game. Each turn is made up of actions.

- Game
    - Turns
        - Actions

Games automatically start when the first action is taken. Actions can only be taken before the game has ended. The first player who joins a game (besides the game creator) will be the first allowed to take an action. The logic used for an action (we will call this an **action model**) can decide whether the action ends the turn or even ends the game, and how to manipulate the game data. 

#### Properties

* `id`: Unique ID
* `players`: User[], snapshot of players profiles
* `turn`: Number, index of the player in the `players` array whos turn it is
* `sockets`: Object, dict of socket.io sockets, key is user id. Used to send turn and action data to the website client.
* `hasStarted`: bool
* `hasEnded`: bool
* `lastTurnInvite`: Discord.js Message, last message saying whos turn it is, it can be deleted and replaced
* `startMessage`: Discord.js Message, start message, it can be deleted
* `winner`: Number or null, index of the winner or -1 if it's a draw
* `turns`: Turn[], the turns that happened over the game
* `data`: Object, data about the game state. Ex: state of chess board.

#### Methods

* `setGuild(Guild guild)`
* `setChannel(Channel channel)`
* `setActionModel(String action, Function model, ?String side)`
    * `action`: Action type
    * `model`: Action model function, will be explained later.
    * `side`: optional, either `'client'` or `'server'`. Specifies if it will be client or server only. By default it will be common.
* `on(String event, Function callback)`: add event handler, ex: console.log when game starts. There are provided handlers that send fancy Discord messages when players take turns.
* `onAction(String action, Function callback)`: add action listener that fires after action
* `async addPlayer(String id)`: add player with user id, emits `'join'` event
* `emit(String event, ...args)`: emit an event, ex: 'init'. Used internally.
* `init()`: adds the game into `gameManager`'s store of games, emits `'init'` event. Used internally.
* `getURL()`: get the URL to play the game
* `async doesUserHavePermission(String id)`: does user have perms to join game? (message send perms in game's channel)
* `async canUserJoin(String id)`: can user join game? 
* `async canUserSocketConnect(id)`: can the user's socket.io socket connect?
* `getDataForClient(String userId)`: gets the data to be sent to the client via socket. Hides user ids which can be used to join as the player. Later user ids will be made available after we switch to using private keys

Some of the functions intended for internal use aren't listed here. See `/games/Game.js`.

### `GameFlow.js`

Methods to control game flow.

* `end(Game game, Object result)`: ends the game with result, {winner: player index or -1 for draw}, emits `'end'` event, broadcasts `'end'` to all sockets
* `start(Game game)`: starts the game, emits `'start'` event, broadcasts `'start'` to all sockets. Used internally.
* `endTurn(Game game)`: ends the current turn, next players turn.

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

* `typeId`: The ID of the game type. This will be used as the name of all folders related to the game type.
* `name`: Displayname of the game
* `description`: Description of the game
* `aliases`: String[], game aliases, may be used later for searching for games
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

The html file for playing the game. We will be using [vue.js](https://v3.vuejs.org/) to create a template of the basic UI (settings button, game manual). It's highly recommended to also use it for the game UI. Check out vue's Getting Started guide.

Import `/public/js/client-framework.js` in the game's script. It contains all the utilities you need to implement interactivity with the server. It will be explained later.

## Website

The website is served from an express server in `server.js`. All files from the `/public` folder are served. The `common.js` from every game type is served from `/gamecommons/<game_type_id>`.

When accessing a game, the website will check if the user has permission to join the game. If so, it will serve the game type's `index.html` file.

We will be using [vue.js](https://v3.vuejs.org/) to create a template of the basic UI (settings button, game manual). It's highly recommended to also use it for the game UI. Check out vue's Getting Started guide.

### `/public/js/client-framework.js`

This contains everything you need to interact with the server. 

#### Exports

* `socket`: socket.io socket used to communicate with the server
* `utils`: Object, contains utility functions
    * `setUpGame(game)`: sets up the game, called when the socket connection is made. Attaches functions to the game, which can't be sent over socket.io. Used internally.
    * `updateGame(gameToUpdate, newGame)`: updates data of the old game to the new game. Use it whenever you receive turn data from the server.
* `emitAction(game, actionType, actionData, actionCallback)`: Function, emits an action to the server. Used internally.
* `runAction(game, type, data, callback, ?clone)`: Function, runs an action and emits it to the server. Call this whenever the user does an action.
    * `game`: Game, the game to run the action on
    * `type`: String, the type of the action
    * `data`: Object, the data of the action
    * `callback`: Function, callback function to be called when the action acknowledgement is received from the server.
    * `clone`: Boolean, whether to clone the game before running the action. Used when you want to see what would happen if the action was run, for example when you want to run animations and don't want the UI to be affected.
* `connect(gameId, callback)`: Function, connects to the server. Call this when the page loads and set up the game UI in the callback.