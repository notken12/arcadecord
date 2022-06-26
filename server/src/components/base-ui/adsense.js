import { onMounted } from 'vue';

const loadAdsenseAd = () => {
  let inlineScript = document.createElement('script');
  inlineScript.type = 'text/javascript';
  inlineScript.text = '(adsbygoogle = window.adsbygoogle || []).push({});';
  document.getElementsByTagName('body')[0].appendChild(inlineScript);
};

export function useAdsense() {
  onMounted(() => {
    loadAdsenseAd();
  });
}
