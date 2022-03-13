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
