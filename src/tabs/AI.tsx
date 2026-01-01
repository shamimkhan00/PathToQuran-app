import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuran } from '../Components/Context';
import mobileAds from 'react-native-google-mobile-ads';
import { GROQ_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
const tafsirJson = require('../../assets/Quran/tasfirEN.json');
const sahih = require('../../assets/Quran/sahih.json');
const clearQuran = require('../../assets/Quran/English.json');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const AiVerseExplainer = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { translationSource } = useQuran();
  const [adReloadKey, setAdReloadKey] = useState<number>(0);

  // const navigation = useNavigation();
  // useEffect(() => {
  //   const backAction = () => {
  //     navigation.goBack(); // Go back to Header
  //     return true; // prevent default behavior (like closing app)
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction
  //   );

  //   return () => backHandler.remove();
  // }, []);

  useEffect(() => {
    mobileAds().initialize().then(() => {
      console.log('✅ AdMob SDK initialized');
      console.log(GROQ_API_KEY)
    });
  }, []);

  const getTafsirForRange = (input: string): string => {
    const [surah, ayahRange] = input.split(':');
    if (!surah || !ayahRange) return '';

    const [start, end] = ayahRange.split('-').map(Number);
    const collected: string[] = [];

    Object.keys(tafsirJson).forEach(key => {
      const [s, a] = key.split(':');
      const ayahNum = parseInt(a, 10);
      if (s === surah && (!end ? ayahNum === start : ayahNum >= start && ayahNum <= end)) {
        const text = tafsirJson[key]?.text || tafsirJson[key];
        collected.push(`**${key}**:\n${text.replace(/<[^>]*>/g, '')}`);
      }
    });

    return collected.join('\n\n');
  };

  const getVerseTextForRange = (input: string): string => {
    const [surah, ayahRange] = input.split(':');
    if (!surah || !ayahRange) return '';

    const verses = translationSource === 'clear-quran' ? clearQuran : sahih;
    const [start, end] = ayahRange.split('-').map(Number);
    const collected: string[] = [];

    for (let i = start; i <= (end || start); i++) {
      const verse = verses[surah]?.[i.toString()];
      if (verse) collected.push(`**${surah}:${i}**: ${verse}`);
    }

    return collected.join('\n\n');
  };

  const getSystemPrompt = () => {
    const translationName =
      translationSource === 'clear-quran'
        ? 'The Clear Quran by Mustafa Khattab'
        : 'Sahih International';

    return `
You are an Islamic AI assistant for a Quran explanation app called PathToQuran.

Your job is to explain Quranic verses to users in three structured sections:

1. **Context and Explanation**
   - Provide historical/spiritual context
   - Mention themes (ethics, law, prophets)
   - Be concise and authentic

2. **Meaning in Simple Terms**
   - Summarize the message clearly
   - Mention the addressee (e.g., believers, disbelievers)
   - Keep language simple and neutral

3. **Verse-by-Verse Breakdown**
   - Bullet points with verse numbers (e.g., 2:2)
   - Base explanations on English translation
   - Refer to tafsir for background (don’t copy it)

IMPORTANT:
- Use **"${translationName}"** as the main translation.
- Do not paraphrase the Quran directly.
- Avoid Arabic/transliteration.
- Be respectful, accurate, and clear.
`;
  };

  const fetchExplanation = async () => {
    Keyboard.dismiss();
    if (!inputText.trim()) return;

    setLoading(true);
    setResult('');

    const tafsir = getTafsirForRange(inputText);
    const verses = getVerseTextForRange(inputText);

    const userPrompt = `
Surah & Ayah(s): ${inputText}

Please explain the following Quranic verse(s):

**Verse Text (${translationSource === 'clear-quran' ? 'The Clear Quran' : 'Sahih International'})**
${verses || 'No verse text found.'}

**Tafsir Reference (Maulana Wahiduddin Khan):**
${tafsir || 'No tafsir found for this range.'}

⚠️ Do not guess or paraphrase. Stick to the provided verse. Use structured explanation format.
`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: getSystemPrompt() },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Groq API Error:', data);

        const errorMsg =
          response.status === 429
            ? '⚠️ API limit exceeded. Try again later.'
            : data.error?.message || 'An unknown error occurred.';
        Alert.alert('Error', errorMsg);
        setResult(errorMsg);
        return;
      }

      setResult(data.choices?.[0]?.message?.content || 'No response.');
    } catch (error: any) {
      if (error.message === 'Network request failed') {
        setResult('⚠️ No internet connection. Please try again.');
      } else {
        console.error(error);
        setResult('⚠️ Unexpected error. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderExplanation = () => {
    return result.split(/\n(?=\*\*)/).map((section, idx) => {
      const headerMatch = section.match(/^\*\*(.+?)\*\*/);
      const header = headerMatch?.[1]?.trim() || '';
      const body = section.replace(/^\*\*.+?\*\*/, '').trim();

      return (
        <View key={idx} style={{ marginTop: idx === 0 ? 0 : 12 }}>
          {header && <Text style={styles.resultHeader}>{header}</Text>}
          {body && <Text style={styles.resultText}>{body}</Text>}
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>AI Verse Explanation</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter verse like 2:2 or 2:2-5"
          value={inputText}
          onChangeText={setInputText}
          multiline
          placeholderTextColor="#7da197"
        />

        <Button title="Get Explanation" onPress={fetchExplanation} disabled={loading} />

        {!loading && result && <View style={styles.resultContainer}>{renderExplanation()}</View>}

      </ScrollView>
      <View style={styles.bannerContainer}>
        <BannerAd
          key={adReloadKey}
          unitId="ca-app-pub-6964983812446877/3327150655" // Replace with real unit ID in production
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error) => {
            console.warn('Ad failed to load:', error);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09130f',
  },
  container: {
    padding: 20,
    backgroundColor: '#09130f',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#c7dad5',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#1e916c',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#d8efe7',
    marginBottom: 16,
    backgroundColor: '#05291d',
  },
  resultContainer: {
    marginTop: 20,
  },
  resultHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#7dd6b6',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
  AdComp: {
    flexDirection: 'column',
    marginTop: 80,
  },
  bannerContainer: {
    alignItems: 'center',
  },
});

export default AiVerseExplainer;
