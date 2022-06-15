# Server leaderboards

Each server has its own leaderboard.

Spec:

- Track for each player
  - Total games played for each type
  - Total games played overall
  - Total games won for each type
  - Total games won overall
- How to access
  - Use /leaderboard command in that server
    - Bot sends link to arcadecord.com/leaderboard/:server_id
  - Use /rank command in that server
    - Bot publicly responds with message listing each game type and the stats for that game type

Implementation:

Tracking: Add to default turn event handler in `server/src/games/Game.js` Game.eventHandlersDiscord. If the game has ended, save updated stats for each player to the database.
