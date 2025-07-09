import Header from '../Components/Header';
import SurahTafsirList from '../Components/SurahTafsirList';
import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const TafsirScreen = () => {
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


        {/* Tafsir content area */}
        <View style={{ flex: 1 }}>
          {/* Your Tafsir rendering logic here */}
          <SurahTafsirList></SurahTafsirList>
        </View>


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

export default TafsirScreen;

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
  bannerContainer: {
    alignItems: 'center',
  },

});
