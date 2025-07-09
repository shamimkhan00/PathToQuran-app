import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function useCachedFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFonts() {
      try {
        await Font.loadAsync({
          'UthmanicHafs': require('../assets/fonts/fontUthmani.ttf'),
          'Merriweather': require('../assets/fonts/EngMeri.ttf'),
          'MeriEtalic': require('../assets/fonts/meriEtalic.ttf'),
          'IndoPakFont': require('../assets/fonts/indopak3.ttf'),
        });
        if (isMounted) setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading failed:', error);
      }
    }

    loadFonts();

    return () => {
      isMounted = false;
    };
  }, []);

  return fontsLoaded;
}
