# Arcadecord

A collection of games that you can play in Discord. Basically GamePigeon for Discord.

## How this works

### Parts of the system

* Player
* Discord bot `/bot`
* Game server `server.js`, `/games/Game.js`, `/games/gamesManager.js`, `/games/types/*`
* Website `server.js`, `/games/types/*/index.html`, `/public`

### Gameplay process

1. The player can create a game with a Discord slash command. 
2. The Discord bot listens for the slash command and tells the game server, which creates a game. 
3. The Discord bot sends the link to play the game that was created. 
4. The player clicks the link and is brought to the website to play the game.
6. Players log in with their Discord accounts. 
5. The website broadcasts the player's actions to the server so that gameplay is recorded.
6. The server notifies the website when other players finish their turns and gives an updated state of the game. 
7. The Discord bot will send messages about events such as players finishing turns and when the game is over. 

