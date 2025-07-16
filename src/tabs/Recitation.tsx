import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Animated, TouchableOpacity, Modal, FlatList, ScrollView, Alert, ActivityIndicator } from 'react-native';
import SoundPlayer from 'react-native-sound-player';
import { SafeAreaView } from 'react-native-safe-area-context';
import verseCountsData from '../../assets/Quran/verseCountsData';
import Header from '../Components/Header';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import surahList from '../../assets/Quran/surah.json';
import AntDesign from 'react-native-vector-icons/AntDesign';
import arabicJson from '../../assets/Quran/Uthmani.json';
import indopakJson from '../../assets/Quran/indopakNew.json';
import englishTransliteration from '../../assets/Quran/EnTrans.json';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuran } from '../Components/Context';
import { BannerAd, BannerAdSize, TestIds, } from 'react-native-google-mobile-ads';
import RNFS from 'react-native-fs';


const Recitation = () => {
  const [surah, setSurah] = useState(1);
  const [verse, setVerse] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioDuration, setAudioDuration] = useState(1);
  const [pausedProgress, setPausedProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [loading, setLoading] = useState(false);




  const {
    script,
    engFontSize,
    arabicFont,
  } = useQuran();


  useEffect(() => {
    const finishedSubscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
      if (hasStarted) {
        handleNext();
      }
    });

    return () => {
      finishedSubscription.remove();
    };
  }, [verse, hasStarted]);

  useEffect(() => {
    const loadLastRead = async () => {
      try {
        const lastRead = await AsyncStorage.getItem('lastRead');

        if (lastRead) {
          const { surah: savedSurah, verse: savedVerse } = JSON.parse(lastRead);
          const surahNum = Math.max(1, Math.min(114, Number(savedSurah)));
          const verseLimit = verseCountsData[surahNum] || 1;
          const verseNum = Math.max(1, Math.min(verseLimit, Number(savedVerse)));

          setSurah(surahNum);
          setVerse(verseNum);
        }

      } catch (e) {
        console.warn('Failed to load last read:', e);
      }
    };

    loadLastRead();
  }, []);

  //store last read surah and verse 
  //use ref if any future error occurs
  useEffect(() => {
    const saveLastRead = async () => {
      try {
        await AsyncStorage.setItem(
          'lastRead',
          JSON.stringify({ surah, verse })
        );
      } catch (e) {
        console.warn('Failed to save last read:', e);
      }
    };
    saveLastRead();
  }, [surah, verse]);


  const getVerseCount = (surahNumber: number) => {
    return verseCountsData[surahNumber] || 1;
  };

  const preloadNextVerse = async (nextSurah: number, nextVerse: number) => {
    const url = `https://the-quran-project.github.io/Quran-Audio/Data/1/${nextSurah}_${nextVerse}.mp3`;
    const fileName = `${nextSurah}_${nextVerse}.mp3`;
    const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const exists = await RNFS.exists(localPath);
    if (!exists) {
      try {
        await RNFS.downloadFile({ fromUrl: url, toFile: localPath }).promise;
        // console.log(`Preloaded ${fileName}`);
      } catch (err) {
        // console.log(`Error preloading ${fileName}`, err);
      }
    } else {
      console.log(`Already cached: ${fileName}`);
    }
    return localPath;
  };


  const playCurrentVerse = async () => {
    try {
      setLoading(true);

      const fileName = `${surah}_${verse}.mp3`;
      const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      const exists = await RNFS.exists(localPath);

      if (exists) {
        console.log(`Playing from cache: ${fileName}`);
        SoundPlayer.playUrl(`file://${localPath}`);
      } else {
        console.log(`Streaming from URL...`);
        const url = `https://the-quran-project.github.io/Quran-Audio/Data/1/${surah}_${verse}.mp3`;
        SoundPlayer.playUrl(url);
      }

      // preloadNextVerse(surah, verse + 1);
      if (surah < 114 && verse >= getVerseCount(surah)) {
        preloadNextVerse(surah + 1, 1);
      } else {
        preloadNextVerse(surah, verse + 1);
      }
      setIsPlaying(true);
      await animateProgressBar();
    } catch (e) {
      console.log('Playback error:', e);
      Alert.alert("Error", "Failed to load audio.");
    } finally {
      setLoading(false);
    }
  };


  const animateProgressBar = async () => {
    progress.setValue(0);
    try {
      const info = await SoundPlayer.getInfo();
      setAudioDuration(info.duration);

      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: info.duration * 1000,
        useNativeDriver: false,
      });

      animationRef.current.start();
    } catch (e) {
      console.log('Error getting audio info:', e);
    }
  };


  const handlePlayPause = async () => {
    if (!isConnected) {
      Alert.alert('No Internet Connection');
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
      setLoading(true);
      await playCurrentVerse();
      setLoading(false);
      return;
    }

    if (isPlaying) {
      SoundPlayer.pause();
      progress.stopAnimation((currentValue) => {
        setPausedProgress(currentValue);
      });
      setIsPlaying(false);
    } else {
      setLoading(true);
      SoundPlayer.resume();
      const remainingDuration = (1 - pausedProgress) * audioDuration * 1000;

      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: remainingDuration,
        useNativeDriver: false,
      });

      progress.setValue(pausedProgress);
      animationRef.current.start();
      setIsPlaying(true);
      setLoading(false);
    }
  };


  const handleNext = async () => {
    let nextSurah = surah;
    let nextVerse = verse + 1;
    const totalVerses = getVerseCount(surah);

    if (verse >= totalVerses) {
      nextSurah = surah + 1 > 114 ? 1 : surah + 1;
      nextVerse = 1;
    }

    setLoading(true);

    // Set state first
    setSurah(nextSurah);
    setVerse(nextVerse);

    // Preload the verse after next in the background:
    // const afterNextSurah = nextVerse + 1 > getVerseCount(nextSurah) ? nextSurah + 1 : nextSurah;
    // const afterNextVerse = nextVerse + 1 > getVerseCount(nextSurah) ? 1 : nextVerse + 1;
    // preloadNextVerse(afterNextSurah, afterNextVerse);
  };


  const handlePrevious = async () => {  // Make it async
    setLoading(true); // Show loading spinner immediately

    if (verse > 1) {
      setVerse(verse - 1);
    } else if (surah > 1) {
      const prevSurah = surah - 1;
      setSurah(prevSurah);
      setVerse(getVerseCount(prevSurah));
    }
  };

  useEffect(() => {
    if (hasStarted) {
      playCurrentVerse();
    }
  }, [verse, hasStarted]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const verseList = Array.from(
    { length: verseCountsData[surah] },
    (_, i) => i + 1
  );


  //ads
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

      <Header />
      <View style={styles.playBox}>

        <View style={styles.upperBox}>
          <View >
            <TouchableOpacity
              style={styles.selector}
              onPress={() => {

                if (isPlaying) {
                  SoundPlayer.pause();
                  progress.stopAnimation((currentValue) => {
                    setPausedProgress(currentValue);
                  });
                  setIsPlaying(false);
                }
                setModalVisible(true);
              }}>
              <Text style={styles.infoText}>{surah}  -  {surahList[surah - 1]}</Text>
              <Text style={styles.infoText}>Ayah  :  {verse}</Text>
              <AntDesign name="down" size={20} color={'white'} />
            </TouchableOpacity>
            <Modal visible={modalVisible} transparent animationType="fade">
              <TouchableOpacity
                style={styles.overlay}
                onPress={() => {

                  setModalVisible(false);
                }}
              >
                <View style={styles.dropdown}>
                  <FlatList
                    data={surahList}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={styles.item1}
                        onPress={() => {
                          setSurah(index + 1);
                          // setModalVisible(false);
                        }}
                      >
                        <Text style={{ color: 'white' }}>{index + 1}  -  {item}</Text>
                      </TouchableOpacity>
                    )}
                  />

                  <FlatList
                    data={verseList}
                    keyExtractor={(item) => item.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.item2}
                        onPress={() => {
                          setVerse(item);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={{ color: 'white' }}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />

                </View>
              </TouchableOpacity>
            </Modal>
          </View>
          <View style={styles.surahContent}>
            {!modalVisible ? (
              <ScrollView style={styles.verseBox}>
                {script === 'uthmani' ? (
                  <Text style={[styles.arabic, { fontSize: arabicFont }]}>
                    {(arabicJson as Record<string, Record<string, string>>)[String(surah)]?.[String(verse)]}
                  </Text>
                ) : script === 'indopak' ? (
                  <Text style={[styles.indopak, { fontSize: arabicFont + 1 }]}>
                    {(indopakJson as Record<string, Record<string, string>>)[String(surah)]?.[String(verse)]}
                  </Text>
                ) : null}
                <Text style={[styles.englishTrans, { fontSize: engFontSize + 5 }]}>
                  {(englishTransliteration as Record<string, Record<string, string>>)[String(surah)]?.[String(verse)]}
                </Text>
              </ScrollView>
            ) : (null)}

          </View>
          <View></View>
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


        <View style={styles.buttonBar}>

          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <View style={styles.playPauseButton}>
            <MaterialIcons name="skip-previous" size={40} color={'white'} onPress={handlePrevious} />
            <View style={{ minWidth: '9%', minHeight: '6%' }}>
              {loading ? (
                <ActivityIndicator size="large" color="white" />
              ) : isPlaying ? (
                <FontAwesome5 name="pause" size={40} color={'white'} onPress={handlePlayPause} />
              ) : (
                <FontAwesome5 name="play" size={40} color={'white'} onPress={handlePlayPause} />
              )}
            </View>
            <MaterialIcons name="skip-next" size={40} color={'white'} onPress={handleNext} />
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
};

export default Recitation;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09130f',

  },
  playBox: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  buttonBar: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 10
  },
  upperBox: {
    flex: 6,
    padding: 20,
  },
  playPauseButton: {
    flexDirection: 'row',
    gap: 30,
    paddingTop: 20,
    paddingBottom: 10,
  },
  infoText: {
    color: 'white',
    fontSize: 18,
    // marginBottom: 20,
    // minWidth:'100%',
  },
  progressContainer: {
    width: '80%',
    height: 5,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },

  selector: {
    borderWidth: 1,
    borderColor: 'white',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingRight: 30,
    paddingLeft: 30,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    width: '80%',
    maxHeight: '60%',
    minHeight: '60%',
    backgroundColor: '#09130f',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  item1: {
    padding: 12,
    // borderBottomWidth: 0.5,
    // borderColor: '#ccc',
    minWidth: '60%',
  },
  item2: {
    padding: 12,
    // borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  surahContent: {
    flex: 1,
    paddingTop: 25,
  },
  verseBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#09130f',
    borderRadius: 10,
  },
  // #09130f
  arabic: {
    textAlign: 'right',
    color: 'pink',
    padding: 20,
    fontFamily: 'fontUthmani',
    //UthmanicHafs
    borderBottomWidth: 0.2,
    borderBottomColor: 'black',
  },
  indopak: {
    fontFamily: 'indopak3',
    textAlign: 'right',
    color: 'pink',
    padding: 20,
    borderBottomWidth: 0.2,
    borderBottomColor: 'black',
  },
  englishTrans: {
    fontFamily: 'meriEtalic',
    fontStyle: 'italic',
    textAlign: 'left',
    color: '#bad3cb',
    marginTop: 4,
    padding: 10,
  },
  bannerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});


//alright