// components/Context.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
  useEffect
} from 'react';
import { Animated, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Surah = { number: number; name: string; ayahNumber?: number };

const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error(`Error saving "${key}":`, e);
  }
};

const getData = <T,>(key: string): Promise<T | null> => {
  return (async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`Error reading "${key}":`, e);
      return null;
    }
  })();
};
type QuranContextType = {
  selectSurah: Surah | null;
  setSelectedSurah: (s: Surah | null) => void;
  script: string;
  setScript: (s: string) => void;
  showTrans: boolean;
  setShowTrans: (b: boolean) => void;
  isSettingsVisible: boolean;
  setIsSettingsVisible: (b: boolean) => void;
  slideAnim: Animated.Value;
  engFontSize: number;
  setEngFontSize: (s: number) => void;
  arabicFont: number;
  setArabicFont: (s: number) => void;
  translationSource: 'clear-quran' | 'sahih-international';
  setTranslationSource: (s: 'clear-quran' | 'sahih-international') => void;
  targetIndex: number;
  setTargetIndex: (s: number) => void;
  targetSurah: number;
  setTargetSurah: (s: number) => void;
  clearAllData?: () => Promise<void>; // optional debug method
};

const QuranContext = createContext<QuranContextType | undefined>(undefined);
const { width } = Dimensions.get('window');

export const QuranProvider = ({ children }: { children: ReactNode }) => {
  const [selectSurah, setSelectedSurah] = useState<Surah | null>(null);

  const [script, setScript] = useState('uthmani');
  const [showTrans, setShowTrans] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const [engFontSize, setEngFontSize] = useState<number>(18);
  const [arabicFont, setArabicFont] = useState<number>(30);

  const [translationSource, setTranslationSource] = useState<'clear-quran' | 'sahih-international'>('sahih-international');
  const [targetIndex, setTargetIndex] = useState(1);
  const [targetSurah, setTargetSurah] = useState(0);

  useEffect(() => {
    const loadAllData = async () => {
      const [
        savedScript,
        savedShowTrans,
        savedEngFontSize,
        savedArabicFont,
        savedTranslationSource
      ] = await Promise.all([
        getData<string>('script'),
        getData<boolean>('showTrans'),
        getData<number>('engFontSize'),
        getData<number>('arabicFont'),
        getData<'clear-quran' | 'sahih-international'>('translationSource'),
      ]);

      if (savedScript) setScript(savedScript);
      if (typeof savedShowTrans === 'boolean') setShowTrans(savedShowTrans);
      if (typeof savedEngFontSize === 'number') setEngFontSize(savedEngFontSize);
      if (typeof savedArabicFont === 'number') setArabicFont(savedArabicFont);
      if (savedTranslationSource) setTranslationSource(savedTranslationSource);
    };

    loadAllData();
  }, []);

  // Persistent setters
  const persistScript = async (s: string) => {
    setScript(s);
    await storeData('script', s);
  };

  const persistShowTrans = async (b: boolean) => {
    setShowTrans(b);
    await storeData('showTrans', b);
  };

  const persistEngFontSize = async (s: number) => {
    setEngFontSize(s);
    await storeData('engFontSize', s);
  };

  const persistArabicFont = async (s: number) => {
    setArabicFont(s);
    await storeData('arabicFont', s);
  };

  const persistTranslationSource = async (s: 'clear-quran' | 'sahih-international') => {
    setTranslationSource(s);
    await storeData('translationSource', s);
  };

  // Optional: Clear all settings (e.g., for debug/reset)
  const clearAllData = async () => {
    try {
      await AsyncStorage.clear();
      setScript('uthmani');
      setShowTrans(false);
      setEngFontSize(18);
      setArabicFont(30);
      setTranslationSource('sahih-international');
      setTargetIndex(1);
      setTargetSurah(0);
      setSelectedSurah(null);
      setIsSettingsVisible(false);
      console.log('All data cleared');
    } catch (e) {
      console.error('Failed to clear AsyncStorage:', e);
    }
  };

  return (
    <QuranContext.Provider
      value={{
        selectSurah,
        setSelectedSurah,
        script,
        setScript: persistScript,
        showTrans,
        setShowTrans: persistShowTrans,
        isSettingsVisible,
        setIsSettingsVisible,
        slideAnim,
        engFontSize,
        setEngFontSize: persistEngFontSize,
        arabicFont,
        setArabicFont: persistArabicFont,
        translationSource,
        setTranslationSource: persistTranslationSource,
        targetIndex,
        setTargetIndex,
        targetSurah,
        setTargetSurah,
        clearAllData,
      }}
    >
      {children}
    </QuranContext.Provider>
  );
};

export const useQuran = () => {
  const context = useContext(QuranContext);
  if (!context) throw new Error('useQuran must be used within QuranProvider');
  return context;
};
