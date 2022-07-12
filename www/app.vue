<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
useHead({
  titleTemplate: (title) => {
    return title ? `Arcadecord - ${title}` : 'Arcadecord';
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  charset: 'utf-8',
  meta: [{ name: 'description', content: 'Message games for Discord' }],
  script: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9949308515923091',
      crossorigin: 'anonymous',
      async: '',
    },
  ],
});

useAppInsights();
useAdsense();
</script>
