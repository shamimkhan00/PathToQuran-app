import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import surahList from '../../assets/Quran/surah.json';
import { useQuran } from './Context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onSurahPress: (surah: {
    number: number;
    name: string;
  }) => void;
}


export default function MainContent({ onSurahPress }: Props) {
  const {
    targetIndex,
    setTargetIndex,
    targetSurah,
    setTargetSurah,
  } = useQuran();

  const [lastRead, setLastRead] = useState<{ surah: number; ayah: number } | null>(null);

  useEffect(() => {
    const fetchLastRead = async () => {
      try {
        const json = await AsyncStorage.getItem('lastRead');
        if (json) {
          const parsed = JSON.parse(json);
          setLastRead(parsed);
        } else {
          // No last read stored — default to Surah 1: Ayah 1
          setLastRead({ surah: 1, ayah: 1 });
        }
      } catch (e) {
        console.warn('Failed to load last read:', e);
        setLastRead({ surah: 1, ayah: 1 }); // fallback in case of error too
      }
    };

    fetchLastRead();
  }, []);



  return (
    <View style={styles.body}>
      <Text style={styles.sectionTitle}>SURAH</Text>
      <FlatList
        data={surahList}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          lastRead ? (
            <TouchableOpacity
              style={styles.header}
              onPress={() => {
                onSurahPress({
                  number: lastRead.surah,
                  name: surahList[lastRead.surah - 1],
                })
                setTargetIndex(lastRead.ayah);
              }
              }
            >
              {(lastRead.surah === 1 && lastRead.ayah === 1) ? (<Text style={styles.continueRead}>
                📖 Start Reading
              </Text>) : (<Text style={styles.continueRead}>
                📖 Continue Reading
              </Text>)}

              <Text style={styles.headerText}>
                Surah {lastRead.surah} {surahList[lastRead.surah - 1]}
              </Text>
              <Text style={styles.continueRead}>
                Ayah {lastRead.ayah}
              </Text>
            </TouchableOpacity>
          ) : null
        }

        renderItem={({ index, item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              onSurahPress({
                number: index + 1,
                name: item,
              })
              setTargetIndex(1);
            }

            }
          >
            <Text style={styles.cardTitle}>
              {index + 1}. {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#c7dad5',
    paddingLeft: 5,
  },
  header: {
    backgroundColor: '#25a068',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#05291d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#c7dad5',
  },
  continueRead: {
    color: '#eeeee4',
  },
});
