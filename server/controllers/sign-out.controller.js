// sign-out.controller.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

const tenYears = 1000 * 60 * 60 * 24 * 365 * 10

export default (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    maxAge: tenYears,
  })

  res.redirect('/sign-in')
}
