# Arcadecord

A collection of games that you can play in Discord. Basically GamePigeon for Discord.

## Todo

https://github.com/notken12/arcadecord/issues

## How this works

### Parts of the system

- Player
- Discord bot `/bot`
- Game server `/server`
- Website `/server`, `/server/src/components/games/*`, `/server/public`, `/server/src`
- Database `/db`

### Gameplay process

1. The player can create a game with a Discord slash command.
2. The Discord bot listens for the slash command and tells the game server, which creates a game.
3. The Discord bot sends the link to play the game that was created.
4. The player clicks the link and is brought to the website to play the game.
5. Players log in with their Discord accounts.
6. The website broadcasts the player's actions to the server so that gameplay is recorded.
7. The server notifies the website when other players finish their turns and gives an updated state of the game.
8. The Discord bot will send messages about events such as players finishing turns and when the game is over.

## Discord bot

For the bot we are using Discord.js. The Discord application credentials (bot token, client secret, client id) are stored in the `/.env` file. The files are private and will need to be shared with you before you can run the program.

The main script for the bot is `/bot/bot.js`. Each interaction (commands, buttons, select menus) has its own script within the `/bot` folder.

## Game server

Games are stored in a MongoDB database in the cloud. The game state is represented using JSON and any time the game is interacted with, the server gets the game from the database, performs the actions, and saves the updated state.

### `Game.js`

The base class for all games. Contains logic for event handlers and action models. All game types extend this class.

#### Logic

Gameplay is turn-based. Each player takes a turn during the game. Each turn is made up of actions.

- Game
  - Turns
    - Actions

Games automatically start when the first action is taken. Actions can only be taken before the game has ended. The first player who joins a game (besides the game creator) will be the first allowed to take an action. The logic used for an action (we will call this an **action model**) can decide whether the action ends the turn or even ends the game, and how to manipulate the game data.

#### Properties

- `id`: Unique ID
- `players`: User[], snapshot of players profiles
- `turn`: Number, index of the player in the `players` array whos turn it is
- `sockets`: Object, dict of socket.io sockets, key is user id. Used to send turn and action data to the website client.
- `hasStarted`: bool
- `hasEnded`: bool
- `lastTurnInvite`: Discord message ID, last message saying whos turn it is, it can be deleted and replaced
- `startMessage`: Discord message ID, start message, it can be deleted
- `winner`: Number or null, index of the winner or -1 if it's a draw
- `turns`: Turn[], the turns that happened over the game
- `data`: Object, data about the game state. Ex: state of chess board.

#### Methods

- `setGuild(String guildId)`
- `setChannel(String channelId)`
- `setActionModel(String action, Function model, ?String side)`
  - `action`: Action type
  - `model`: Action model function, will be explained later.
  - `side`: optional, either `'client'` or `'server'`. Specifies if it will be client or server only. By default it will be common.
- `on(String event, Function callback)`: add event handler, ex: console.log when game starts. There are provided handlers that send fancy Discord messages when players take turns.
- `onAction(String action, Function callback)`: add action listener that fires after action
- `async addPlayer(String id)`: add player with user id, emits `'join'` event
- `emit(String event, ...args)`: emit an event, ex: 'init'. Used internally.
- `init()`: adds the game into `gameManager`'s store of games, emits `'init'` event. Used internally.
- `getURL()`: get the URL to play the game
- `async doesUserHavePermission(String id)`: does user have perms to join game? (slash command perms in game's channel)
- `async canUserJoin(String id)`: can user join game?
- `async canUserSocketConnect(id)`: can the user's socket.io socket connect?
- `getDataForClient(String userId)`: gets the data to be sent to the client via socket. Hides user ids which can be used to join as the player. Later user ids will be made available after we switch to using private keys

Some of the functions intended for internal use aren't listed here. See `/server/src/games/Game.js`.

### `GameFlow.js`

Methods to control game flow.

- `end(Game game, Object result)`: ends the game with result, {winner: player index or -1 for draw}, emits `'end'` event, broadcasts `'end'` to all sockets
- `start(Game game)`: starts the game, emits `'start'` event, broadcasts `'start'` to all sockets. Used internally.
- `endTurn(Game game)`: ends the current turn, next players turn.

### Game types

Each different game has a folder in `/server/src/games/types`. The folder name is the game type's ID. The folder contains 3 files:

- `common.spec.js`
- `main.js`
- `common.js`

#### `common.spec.js`

The test file for the game. Tests are crucial for ensuring that game logic is implemented correctly. The recommended development workflow is to write the game behavior in English, and then to write the tests for those behaviors, and then finally write the code in `main.js` and `common.js` to make those tests pass.

#### `main.js`

The main script for the game.

Exports:

- `options`
- `Game`

##### options

Object that contains info about the game.

- `typeId`: The ID of the game type. This will be used as the name of all folders related to the game type.
- `name`: Displayname of the game
- `description`: Description of the game
- `aliases`: String[], game aliases, may be used later for searching for games
- `minPlayers`: Number, minimum players required to play the game
- `maxPlayers`: Number, maximum players
- `emoji`: String, emoji used to represent the game. Can be normal emoji or custom discord emojis. Discord bots can use custom Discord emojis as if they were Nitro users.
- `data`: Object, default data of the game. Game data is all the data about the game state. Ex: chess board state.

This object is important because it is read to display the game in the Discord commands and make it available without the need to hard-code it in. See `/server/src/games/game-types.js`.

##### Game

A class that extends the class `Game` from `/server/src/games/Game.js`. Will be called to create a new game. In the constructor, a new `Game` will be created with `super(options);` and then action models and event handlers are assigned.

Optionally, a `getThumbnail` function can be defined which is used to generate a thumbnail for the Discord messages.

#### `common.js`

A file that contains data and functions that are used in both the website client and the game server. `main.js` imports `common.js`. Common action models must be functions from `common.js`. Examples of data stored in this file are:

- Numbers for tile states on a checker board, ex. `TILE_EMPTY = 0`, `TILE_WHITE = 1`, `TILE_BLACK = 2`
- Utility functions for the game
- Action models - mandatory. These will be explained later.
- **Any variables that needs to be consistent between the client and the server.**

## Website

The website is served from an express server in `server.js`. All files from the `/server/src/public` folder are served at `/`. Files from `/server/src` are compiled and served at `/`.

When accessing a game, the website will check if the user has permission to join the game. If so, it will render the Vue component `/server/src/components/games/{GAME_ID}/App.vue`.

We will be using [vue.js](https://v3.vuejs.org/) to create the UI (settings button, game manual). A template of the basic UI and useful logic has been built to make writing games easier.

Gameplay pattern:

- Show replay of last player's turn
- Player takes actions and finishes their turn
- Waiting for opponent

## Building the game UI

Vue is used for UI. Learn Vue first if you haven't at https://vuejs.org. Get started by creating at `/server/src/components/games/{GAME_ID}/App.vue`. That will be the main Vue component for the game.

### UI template

Use the `<game-view>` component to add the basic UI in and write your game UI inside of it.
You can optionally use the `<score-view>` component to build score displays for players in the game. Use a template inside of it with `v-slot="scoreView"` and you'll be able to define a score display and get the player index with `scoreView.playerindex`.

```vue
<template>
  <game-view>
    <scores-view>
      <template v-slot="scoreView">
        <div>Score: {{ game.data.scores[scoreView.playerindex] }}</div>
      </template>
    </scores-view>

    <div class="middle">
      <!-- Put your main game UI here! -->
    </div>
  </game-view>
</template>
```

### Framework for game logic/data

Access to and control of the game is provided by `useFacade()`. Import and use it like this:

```vue
<script setup>
import { useFacade } from '@app/components/base-ui/facade';

const {
  game,
  $runAction,
  $endAnimation,
  $replayTurn,
  $endReplay,
  previousTurn,
} = useFacade();

// Make function to say hi to the game
const sayHi = () => {
  alert(`Hi ${game.value.name}!`);
  // Notice how you have to use game.value
  // This is because the data is made reactive by using
  // Vue refs. See https://vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive-variables-with-ref
};
</script>

<template>
  <game-view>
    <div class="middle">
      <!-- Put your main game UI here! -->
      <button @click="sayHi">Say hi to {{ game.name }}</button>
      <!-- In the template, you use game instead of game.value -->
    </div>
  </game-view>
</template>
```

### Replay system

The recommended design philosophy is to directly represent game data in the template as much as possible, and when it isn't (i.e. when using canvas) use Vue watchers to watch the game state and call the functions to update the UI. Because the data is driving the view and not the other way around, it's easy to implement a replay system as the template and watchers will be able to handle the changing game state no matter if it's live or replayed.

Facade will take care of managing game state and showing replays when needed, and you tell it how replays will be run and, optionally define special UI behavior when replaying like preventing the user from interacting with the game.

```vue
<script setup>
import { replayAction, utils } from '@app/js/client-framework';
import { onMounted } from 'vue';
import { useFacade } from '@app/components/base-ui/facade';

const {
  game,
  $runAction,
  $endAnimation,
  $replayTurn,
  $endReplay,
  previousTurn,
} = useFacade();

const ANIMATION_DURATION = 1000; // ms

// Start the replay once the component is displayed

onMounted(() => {
  $replayTurn(async () => {
    for (let action of previousTurn.value.actions) {
      // Replay the action
      replayAction(game.value, action);
      // Wait for the animations to finish up before doing the next action
      await utils.wait(ANIMATION_DURATION);
    }
    // All done
    // You can delay ending the replay too
    $endReplay(300); // ms
  });
});
</script>
```

## Low level library

### `/server/src/js/client-framework.js`

This contains the low level functions needed to interact with the server.

#### Exports

- `socket`: socket.io socket used to communicate with the server
- `utils`: Object, contains utility functions
  - `setUpGame(game)`: sets up the game, called when the socket connection is made. Attaches functions to the game, which can't be sent over socket.io. Used internally.
  - `updateGame(gameToUpdate, newGame)`: updates data of the old game to the new game. Use it whenever you receive turn data from the server.
- `emitAction(game, actionType, actionData, actionCallback)`: Function, emits an action to the server. Used internally.
- `runAction(game, type, data, callback, ?clone)`: Function, runs an action and emits it to the server. Call this whenever the user does an action.
  - `game`: Game, the game to run the action on
  - `type`: String, the type of the action
  - `data`: Object, the data of the action
  - `callback`: Function, callback function to be called when the action acknowledgement is received from the server.
  - `clone`: Boolean, whether to clone the game before running the action. Used when you want to see what would happen if the action was run, for example when you want to run animations and don't want the UI to be affected.
- `connect(gameId, callback)`: Function, connects to the server. Call this when the page loads and set up the game UI in the callback.
- `replayAction(game, action)`: Function, replays an action. This is the same as runAction but it doesn't emit it to the server and it doesn't need to be your turn.
