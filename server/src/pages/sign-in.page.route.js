// sign-in.page.route.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

export default (pageContext) => {
  if (pageContext.url.startsWith('/sign-in')) {
    return {
      precedence: 99,
    }
  }
  if (
    (pageContext.pageContext.userId === null ||
      pageContext.pageContext.userId === undefined) &&
    pageContext.url.startsWith('/game')
  ) {
    return {
      precedence: 99,
    }
  }

  return false
}
