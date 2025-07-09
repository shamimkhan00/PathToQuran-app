import { useQuran } from '../Components/Context';
import Header from '../Components/Header';
import MainContent from '../Components/MainContent';
import SurahDetail from '../Components/SurahDetail';
import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  BackHandler,
  Dimensions,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  // const fontsLoaded = useCachedFonts();
  const {
    selectSurah,
    setSelectedSurah,
    script,
    showTrans,
  } = useQuran();

  useEffect(() => {
    const onBackPress = () => {
      if (selectSurah) {
        setSelectedSurah(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [selectSurah]);

  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [adReloadKey, setAdReloadKey] = useState<number>(0);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && isConnected === false) {
        setAdReloadKey(prev => prev + 1);
      }
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, [isConnected]);


  return (

    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>



      <Header></Header>

      <View style={styles.scrollContent}>
        {selectSurah ? (
          <SurahDetail
            surahNumber={selectSurah.number}
            surahName={selectSurah.name}
            initialAyahNumber={selectSurah.ayahNumber}
            onBack={() => setSelectedSurah(null)}
            showTrans={showTrans}
            script={script}
          />
        ) : (
          <MainContent onSurahPress={setSelectedSurah} />
        )}
      </View>
      <View style={styles.bannerContainer}>
        {isConnected && (
          <BannerAd
            key={adReloadKey}
            unitId={TestIds.BANNER}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(error) => {
              console.log('Ad failed to load:', error);
            }}
          />
        )}
      </View>

    </SafeAreaView>

  );
};


export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09130f',
  },
  scrollContent: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1e916c',
  },
  settings: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width,
    height,
    backgroundColor: '#222',
    zIndex: 10,
  },
  bannerContainer: {
    alignItems: 'center',
  },
});
