export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig();
  // return redirect(
  //   'https://discord.com/api/oauth2/authorize?client_id=' +
  //   config.botClientId +
  //   '&redirect_uri=' +
  //   encodeURIComponent(config.webServerUrl + '/auth') +
  //   '&response_type=code&scope=identify',
  //   { redirectCode: 301 }
  // );
  // window.location.href = 'https://example.org';
  return navigateTo({ path: 'https://www.example.com' });
});
