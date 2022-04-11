export default (req, res) => {
  res.redirect(
    'https://discord.com/api/oauth2/authorize?client_id=' +
      process.env.BOT_CLIENT_ID +
      '&redirect_uri=' +
      encodeURIComponent(process.env.GAME_SERVER_URL + '/auth') +
      '&response_type=code&scope=identify%20email'
  )
}
