import { useQuran } from '../Components/Context';
import Header from '../Components/Header';
import MainContent from '../Components/MainContent';
import SurahDetail from '../Components/SurahDetail';
import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  Animated,
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
import { checkForUpdate, UpdateFlow } from 'react-native-in-app-updates';
const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  useEffect(() => {
    const checkUpdate = async () => {
      try {
        await checkForUpdate(UpdateFlow.FLEXIBLE);
        // It will automatically show Google's update UI if needed
      } catch (e) {
        console.log('Update check error:', e);
      }
    };

    checkUpdate();
  }, []);
  // const fontsLoaded = useCachedFonts();
  const {
    selectSurah,
    setSelectedSurah,
    script,
    showTrans,
    showAds,
    setShowAds,
    isSettingsVisible,
    setIsSettingsVisible,
    slideAnim,
  } = useQuran();

  const closeSettings = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsSettingsVisible(false);
    });
  };

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
      {/* {isConnected && showAds && ( */}
        <View style={styles.bannerContainer}>
          <BannerAd
            key={adReloadKey}
            unitId="ca-app-pub-6964983812446877/3327150655"
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(error) => {
              console.warn('Ad failed to load:', error);
              setShowAds(false);
            }}
          />
        </View>
      {/* )} */}

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
