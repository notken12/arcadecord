# Personal stats

Track each player's personal stats (shared across all servers):

Spec:
- Track
  - Total games played
  - Total games won
  - For each game type:
    - Total games played
    - Total games won
- How to access
  - Use /stats command in any server
    - Bot responds with message listing each game type and the stats for that game type
  - Show game stats when displaying game info in /play command

Implementation:

Tracking: Add to default turn event handler in `server/src/games/Game.js` Game.eventHandlersDiscord. If the game has ended, save updated stats for each player to the database.
