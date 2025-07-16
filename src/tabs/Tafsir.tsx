import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import Header from '../Components/Header';
import SurahTafsirList from '../Components/SurahTafsirList';

const TafsirScreen = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [adReloadKey, setAdReloadKey] = useState<number>(0);

  useEffect(() => {
    // Initial check
    const checkConnection = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? false);
    };
    checkConnection();

    // Subscribe to network status changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && !isConnected) {
        setAdReloadKey((prev) => prev + 1); // reload ad
      }
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, [isConnected]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header />
      
      <View style={styles.scrollContent}>
        <SurahTafsirList />
      </View>

      {isConnected && (
        <View style={styles.bannerContainer}>
          <BannerAd
            key={adReloadKey}
            unitId={TestIds.BANNER} // Replace with real unit ID in production
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(error) => {
              console.warn('Ad failed to load:', error);
            }}
          />
        </View>
      )}
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
