const tenYears = 1000 * 60 * 60 * 24 * 365 * 10

export default (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    maxAge: tenYears,
  })

  res.redirect('/sign-in')
}
