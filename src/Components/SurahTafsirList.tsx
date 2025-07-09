import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useQuran } from './Context';
import mobileAds from 'react-native-google-mobile-ads';
import NativeAdCard from '../Components/NativeAdCard.tsx';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface SurahItem {
    name: string;
    index: number;
}

interface TafsirEntry {
    ayahs: string[];
    text: string;
}

const QuranTafsir: React.FC = () => {
    const [surahs, setSurahs] = useState<SurahItem[]>([]);
    const [tafsirBySurah, setTafsirBySurah] = useState<{ [surahNum: string]: TafsirEntry[] }>({});
    const [selectedSurah, setSelectedSurah] = useState<SurahItem | null>(null);
    const [loading, setLoading] = useState(true);
    const {
        engFontSize,
    } = useQuran();

    useEffect(() => {
        mobileAds()
            .initialize()
            .then(() => {
                console.log('✅ AdMob SDK initialized');
            });
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const surahData = require('../../assets/Quran/surah.json');
                const formattedSurahs = surahData.map((name: string, index: number) => ({
                    name,
                    index: index + 1,
                }));
                setSurahs(formattedSurahs);

                const rawTafsir = require('../../assets/Quran/tasfirEN.json');
                const surahMap: { [surahNum: string]: TafsirEntry[] } = {};

                const resolveText = (key: string): { ayahs: string[]; text: string } | null => {
                    const value = rawTafsir[key];
                    if (!value) return null;

                    if (typeof value === 'string') {
                        return resolveText(value); // follow pointer
                    }

                    return {
                        ayahs: value.ayah_keys ?? [key],
                        text: value.text,
                    };
                };

                Object.keys(rawTafsir).forEach((ayahKey) => {
                    const surahNum = ayahKey.split(':')[0];
                    const tafsirEntry = resolveText(ayahKey);
                    if (!tafsirEntry) return;

                    if (!surahMap[surahNum]) {
                        surahMap[surahNum] = [];
                    }

                    // Avoid duplicates
                    const alreadyExists = surahMap[surahNum].some((e) => e.text === tafsirEntry.text);
                    if (!alreadyExists) {
                        surahMap[surahNum].push(tafsirEntry);
                    }
                });

                setTafsirBySurah(surahMap);
            } catch (e) {
                console.error('Error:', e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (selectedSurah) {
                    setSelectedSurah(null); // Go back to surah list
                    return true; // ✅ Stop native back behavior
                }
                return false; // Let default navigation handle it (e.g., exit app or go to another tab)
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [selectedSurah])
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#4a8c7a" />
            </View>
        );
    }

    const handleSurahSelect = (surah: SurahItem) => {
        setSelectedSurah(surah);
    };

    const handleBackToList = () => {
        setSelectedSurah(null);
    };

    if (!selectedSurah) {
        return (
            <View style={styles.body}>
                <Text style={styles.sectionTitle}>Tasfir-Tazkirul Quran

                </Text>
                <FlatList
                    data={surahs}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => handleSurahSelect(item)}>
                            <Text style={styles.cardTitle}>
                                {item.index}. {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.index.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    const currentTafsirs = tafsirBySurah[selectedSurah.index.toString()] || [];

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 5 }}>
                <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back to Surahs</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={currentTafsirs}
                keyExtractor={(_, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.surahTitle}>{selectedSurah.name}</Text>
                        <Text style={styles.surahSubtitle}>Surah {selectedSurah.index}</Text>
                    </View>
                }
                ListEmptyComponent={
                    <Text style={styles.tafsirText}>No Tafsir available.</Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.tafsirContainer}> 
                        <Text style={styles.tafsirTitle}>Ayahs: {item.ayahs.join(', ')}</Text>
                        <Text style={[styles.tafsirText, { fontSize: engFontSize, lineHeight: engFontSize * 1.4  }]}>
                            {item.text.replace(/<[^>]*>?/gm, '')}
                        </Text>
                    </View>
                )}
                contentContainerStyle={styles.scrollContainer}
                ListFooterComponent={() => (
                    <View style={styles.AdComp}>
                        <NativeAdCard></NativeAdCard>
                    </View>
                )}
            />
        </View>
    );

};

export default QuranTafsir;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#021c15',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        // padding: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    backButtonText: {
        color: 'orange',
        fontSize: 16,
        fontWeight: '500',
    },
    surahTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#c7dad5',
        marginBottom: 4,
    },
    surahSubtitle: {
        fontSize: 16,
        color: '#8aafa2',
        marginBottom: 8,
    },
    tafsirContainer: {
        backgroundColor: '#05291d',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    tafsirTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#b8d5cb',
        marginBottom: 8,
    },
    tafsirText: {
        lineHeight: 27,
        color: '#e0f2e9',
        textAlign: 'justify',
        fontFamily: 'EngMeri',
    },
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
    },
    listContainer: {
        paddingBottom: 16,
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
    AdComp: {
        flexDirection: 'column',
        marginTop: 50,
        marginBottom: 30,

    }
});
