import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import englishJson from '../../assets/Quran/English.json';
import englishTransliteration from '../../assets/Quran/EnTrans.json';
import indopakJson from '../../assets/Quran/indopakNew.json';
import sahih from '../../assets/Quran/sahih.json';
import arabicJson from '../../assets/Quran/Uthmani.json';
import { useQuran } from './Context';
import { SurahMap } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ViewToken } from 'react-native';
import throttle from 'lodash.throttle';
import mobileAds from 'react-native-google-mobile-ads';
import NativeAdCard from '../Components/NativeAdCard.tsx';

// import useCachedFonts from './useCachedFonts';
const arabic = arabicJson as SurahMap;
const indopak = indopakJson as SurahMap;
const english = englishJson as SurahMap;
const engTrans = englishTransliteration as SurahMap;
const engSahih = sahih as SurahMap;

interface Props {
  surahNumber: number;
  surahName: string;
  onBack: () => void;
  initialAyahNumber?: number;
  showTrans: boolean;
  script: string;
}

export default function SurahDetail({
  surahNumber,
  surahName,
  onBack,
}: Props) {
  const {
    script,
    showTrans,
    engFontSize,
    arabicFont,
    translationSource,
    targetIndex,
    setTargetIndex,
  } = useQuran();
  const arabicVerses = arabic[surahNumber.toString()];
  const indopakVerses = indopak[surahNumber.toString()];
  const englishVerses = english[surahNumber.toString()];
  const engTransVerses = engTrans[surahNumber.toString()];
  const engSahihVerses = engSahih[surahNumber.toString()];
  const ayahNumbers = Object.keys(arabicVerses);


  const flatListRef = useRef<FlatList<any>>(null);
  const scrollIndexRef = useRef(0);
  const autoScrollSpeedRef = useRef(100);

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('✅ AdMob SDK initialized');
      });
  }, []);

  useEffect(() => {
    scrollIndexRef.current = 0;
    autoScrollSpeedRef.current = 100;

    if (targetIndex !== null && targetIndex >= 0) {
      const interval = setInterval(() => {
        if (scrollIndexRef.current >= targetIndex) {
          clearInterval(interval);
          return;
        }

        try {
          flatListRef.current?.scrollToIndex({
            index: scrollIndexRef.current,
            animated: true,
          });
          scrollIndexRef.current += 1;
        } catch (error) {
          console.warn('Scroll error:', error);
          autoScrollSpeedRef.current += 50;
        }
      }, autoScrollSpeedRef.current);

      return () => clearInterval(interval);
    }
  }, [targetIndex]);


  const saveLastRead = async (surahNumber: number, ayahNumber: number) => {
    try {
      await AsyncStorage.setItem('lastRead', JSON.stringify({ surah: surahNumber, ayah: ayahNumber }));
    } catch (err) {
      console.warn('Failed to save last read:', err);
    }
  };

  const throttledSaveLastRead = throttle(
    async (surahNumber: number, ayahNumber: number) => {
      try {
        await AsyncStorage.setItem(
          'lastRead',
          JSON.stringify({ surah: surahNumber, ayah: ayahNumber })
        );
        console.log('Saved:', surahNumber, ayahNumber);
      } catch (err) {
        console.warn('Error saving last read:', err);
      }
    },
    2000, // only once every 2s
    { trailing: true }
  );

  const lastSavedRef = useRef<string | null>(null);

  const onViewableItemsChanged = useRef(
    ({ changed }: { changed: ViewToken[] }) => {
      for (const item of changed) {
        if (!item.isViewable) {
          const ayahNumber = parseInt(item.item);
          const key = `${surahNumber}:${ayahNumber}`;
          if (lastSavedRef.current !== key) {
            lastSavedRef.current = key;
            throttledSaveLastRead(surahNumber, ayahNumber);
          }
          break;
        }
      }
    }
  ).current;


  const viewabilityConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });



  return (
    <View style={styles.container}>
      <View style={styles.secondbar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={ayahNumbers}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfigRef.current}
        renderItem={({ item }) => (
          <View>
            <View style={styles.VerseHead}>
              <Text style={styles.surahNumber}>{surahNumber}:{item}</Text>
            </View>
            <View style={styles.verseBox}>
              {script === 'uthmani' ? (
                <Text style={[styles.arabic, { fontSize: arabicFont }]}>{arabicVerses[item]}</Text>
              ) : script === 'indopak' ? (
                <Text style={[styles.indopak, { fontSize: arabicFont + 1 }]} >{indopakVerses[item]}</Text>
              ) : null}

              {translationSource === 'clear-quran' ? (
                <Text style={[styles.english, { fontSize: engFontSize, lineHeight: engFontSize * 1.4 }]}>{englishVerses[item]}</Text>
              ) : (
                <Text style={[styles.english, { fontSize: engFontSize, lineHeight: engFontSize * 1.4 }]}>{engSahihVerses[item]}</Text>
              )}

              {showTrans && <Text style={[styles.englishTrans, { fontSize: engFontSize - 1 }]}>{engTransVerses[item]}</Text>}
            </View>
          </View>
        )}

        ListFooterComponent={() => (
          <View style={styles.AdComp}>
            <NativeAdCard></NativeAdCard>
          </View>
        )}
      />



    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', paddingTop: 5 },
  backButton: { marginBottom: 10 },
  secondbar: { flexDirection: 'row' },
  backText: { color: '#1e916c', fontSize: 16 },
  VerseHead: {
    padding: 5,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surahNumber: { color: '#1e916c' },
  verseBox: {
    backgroundColor: 'rgb(3, 30, 21)',
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
  },
  arabic: {
    textAlign: 'right',
    color: 'pink',
    padding: 10,
    fontFamily: 'fontUthmani',
    //UthmanicHafs
    borderBottomWidth: 0.2,
    borderBottomColor: 'black',
  },
  indopak: {
    fontFamily: 'indopak3',
    textAlign: 'right',
    color: 'pink',
    padding: 10,
    borderBottomWidth: 0.2,
    borderBottomColor: 'black',
  },
  english: {
    fontFamily: 'EngMeri',
    textAlign: 'left',
    color: '#bad3cb',
    marginTop: 4,
    padding: 5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  englishTrans: {
    fontFamily: 'meriEtalic',
    fontStyle: 'italic',
    textAlign: 'left',
    color: '#bad3cb',
    marginTop: 4,
    padding: 5,
  },
  AdComp: {
    flexDirection: 'column',
    marginTop: 50,
    marginBottom: 30,
  }
});
