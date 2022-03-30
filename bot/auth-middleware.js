// auth-middleware.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

function authMiddleware(req, res, next) {
  var authHeader = req.headers.authorization
  if (!authHeader) {
    res.status(401).send('Access denied. No token provided.')
    return
  }
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).send('Access denied. Invalid token.')
    return
  }

  // Remove Bearer from string
  var token = authHeader.slice(7, authHeader.length)

  if (token !== process.env.BOT_IPC_API_TOKEN) {
    res.status(401).send('Access denied. Invalid token.')
    return
  }

  next()
}

export default authMiddleware
