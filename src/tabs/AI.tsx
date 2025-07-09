import { useQuran } from '../Components/Context';
import React, { useState } from 'react';
import { GROQ_API_KEY } from '@env';
import {
  Alert,
  Button,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NativeAdCard from '../Components/NativeAdCard.tsx';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const tafsirJson = require('../../assets/Quran/tasfirEN.json');
const sahih = require('../../assets/Quran/sahih.json');
const clearQuran = require('../../assets/Quran/English.json');


import { useEffect } from 'react';
import mobileAds from 'react-native-google-mobile-ads';



const AiVerseExplainer = () => {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log('✅ AdMob SDK initialized');
      });
  }, []);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { translationSource, setTranslationSource } = useQuran();
  const getTafsirForRange = (input: string): string => {
    const [surah, ayahRange] = input.split(':');
    if (!surah || !ayahRange) return '';

    const [start, end] = ayahRange.split('-').map(Number);
    const tafsirEntries = tafsirJson; // or from state if pre-parsed

    const collected: string[] = [];

    Object.keys(tafsirEntries).forEach(key => {
      const [s, a] = key.split(':');
      const ayahNum = parseInt(a, 10);
      if (s === surah && (!end ? ayahNum === start : ayahNum >= start && ayahNum <= end)) {
        const text = tafsirEntries[key]?.text || tafsirEntries[key];
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

---

1. **Context and Explanation**  
   - Briefly describe the historical, social, or spiritual context.  
   - Mention if the content involves ethics, law, guidance, or stories of prophets.  
   - Be concise and rooted in established understanding.

2. **Meaning in Simple Terms**  
   - Summarize the overall message in clear, modern English.  
   - Identify who is being addressed (e.g., believers, disbelievers, Prophet).  
   - Keep it accessible for readers of all backgrounds.

3. **Verse-by-Verse Breakdown**  
   - Use bullet points with verse numbers (e.g., 2:2, 2:3).  
   - Explain each verse based primarily on the official English translation.  
   - You may quote from the translation to support clarity (e.g., “This is the Book in which there is no doubt…” – 2:2).  
   - Use the Tafsir provided as a reference to ensure accuracy and avoid misinterpretation — not as the sole basis.

---

**IMPORTANT GUIDELINES**  
- Always refer to the official English translation: **"${translationName}"**.  
- Do not paraphrase the Quran directly — explain based on its meaning.  
- Use the Tafsir reference to guide and check your explanation.  
- If unsure about any verse, say: “I do not have enough knowledge to explain this.”  
- Avoid Arabic and transliteration.  
- Be accurate, neutral, respectful, and educational.

Return your response using clear section headings and spacing.`;

  };


  const fetchExplanation = async () => {
    Keyboard.dismiss();
    if (!inputText.trim()) return;
    setLoading(true);
    setResult('');

    // 🔍 Get tafsir text from local JSON
    const tafsirReference = getTafsirForRange(inputText);
    const verseText = getVerseTextForRange(inputText); // 👈 you missed this earlier

    // 👤 Construct user prompt with tafsir included
    const userPrompt = `
Surah & Ayah(s): ${inputText}

Please explain the following Quranic verse(s) using the official English translation provided below.  
Use the Tafsir only for context or verification — not as your main source.

---

**Verse Text (${translationSource === 'clear-quran' ? 'The Clear Quran' : 'Sahih International'})**
${verseText || 'No verse text found.'}

---

**Tafsir Reference (Maulana Wahiduddin Khan):**
${tafsirReference || 'No tafsir found for this range.'}

---

⚠️ Do not guess or paraphrase. Stick strictly to the provided verse text. Follow the explanation format described in the system message.
`;

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: getSystemPrompt(),
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.5,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Groq API Error:', data);

        if (response.status === 429) {
          Alert.alert(
            'Limit Reached',
            'The AI explanation service is temporarily unavailable due to high usage. Please try again later.'
          );
          setResult('⚠️ API limit exceeded. Try again later.');
        } else {
          setResult(data.error?.message || 'An unknown error occurred.');
        }
        return;
      }

      const message = data.choices?.[0]?.message?.content;
      setResult(message || 'No response.');

    } catch (error) {
      if(error instanceof Error && error.message==='Network request failed')
      setResult('⚠️ No internet connection. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
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

        <Button
          title="Get Explanation"
          onPress={fetchExplanation}
          disabled={loading}
        />

        {!loading && result && (
          <View style={styles.resultContainer}>
            {result.split(/\n(?=\*\*)/).map((section, idx) => {
              const headerMatch = section.match(/^\*\*(.+?)\*\*/);
              const header = headerMatch ? headerMatch[1].trim() : null;
              const body = headerMatch
                ? section.replace(headerMatch[0], '').trim()
                : section.trim();

              return (
                <View key={idx} style={{ marginTop: idx === 0 ? 0 : 12 }}>
                  {header && <Text style={styles.resultHeader}>{header}</Text>}
                  {body.length > 0 && <Text style={styles.resultText}>{body}</Text>}
                </View>
              );
            })}
          </View>
        )}
        <View style={styles.AdComp}>
          <NativeAdCard></NativeAdCard>
        </View>


      </ScrollView>
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
  result: {
    marginTop: 20,
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
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
  }
});

export default AiVerseExplainer;
// e0f2e9
