import Entypo from 'react-native-vector-icons/Entypo';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View, Button, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuran } from './Context';
import { Linking } from 'react-native';
type SettingsProps = {
    closeSettings: () => void;
    showTrans: boolean;
    setShowTrans: (value: boolean) => void;
    script: string;
    setScript: (value: string) => void;
};

const Settings = ({ closeSettings }: SettingsProps) => {
    const insets = useSafeAreaInsets();
    const {
        script,
        showTrans,
        engFontSize,
        arabicFont,
        translationSource,
        setEngFontSize,
        setShowTrans,
        setScript,
        setArabicFont,
        setTranslationSource,
        clearAllData
    } = useQuran();
    const [pressed, setPressed] = useState(false);
    return (
        <View style={styles.container}>
            <View style={[styles.TopBar, { paddingTop: 10 + insets.top }]}>
                <Text style={styles.text}>Settings Panel</Text>
                <Entypo
                    name="squared-cross"
                    size={30}
                    color="red"
                    onPress={closeSettings}
                />
            </View>

            <View style={styles.content}>
                {/* Toggle Translation */}


                {/* Toggle Script (Uthmani | IndoPak) */}
                <View style={[styles.card]}>
                    <Text style={styles.label}>Script</Text>
                    <View style={styles.toggleGroup}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                script === 'uthmani' && styles.activeToggle,
                            ]}
                            onPress={() => setScript('uthmani')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    script === 'uthmani' && styles.activeToggleText,
                                ]}
                            >
                                Uthmani
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                script === 'indopak' && styles.activeToggle,
                            ]}
                            onPress={() => setScript('indopak')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    script === 'indopak' && styles.activeToggleText,
                                ]}
                            >
                                IndoPak
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                script === 'of' && styles.activeToggle,
                            ]}
                            onPress={() => setScript('of')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    script === 'of' && styles.activeToggleText,
                                ]}
                            >
                                OFF
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Translation</Text>
                    <View style={styles.toggleGroup}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                translationSource === 'clear-quran' && styles.activeToggle,
                            ]}
                            onPress={() => setTranslationSource('clear-quran')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    translationSource === 'clear-quran' && styles.activeToggleText,
                                ]}
                            >
                                Clear Quran
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                translationSource === 'sahih-international' && styles.activeToggle,
                            ]}
                            onPress={() => setTranslationSource('sahih-international')}
                        >
                            <Text
                                style={[
                                    styles.toggleText,
                                    translationSource === 'sahih-international' && styles.activeToggleText,
                                ]}
                            >
                                Sahih Intl
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Show Transliteration</Text>
                    <Switch
                        value={showTrans}
                        onValueChange={setShowTrans}
                        thumbColor={showTrans ? '#1e916c' : '#ccc'}
                        trackColor={{ false: '#555', true: '#1e916c' }}
                    />
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Translation Size</Text>
                    <View style={styles.fontSizeControls}>
                        <TouchableOpacity
                            style={styles.fontButton}
                            onPress={() => setEngFontSize(Math.max(10, engFontSize - 1))}
                        >
                            <Text style={styles.fontButtonText}>−</Text>
                        </TouchableOpacity>

                        <Text style={styles.fontSizeText}>{engFontSize}</Text>

                        <TouchableOpacity
                            style={styles.fontButton}
                            onPress={() => setEngFontSize(Math.min(40, engFontSize + 1))}
                        >
                            <Text style={styles.fontButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.card}>
                    <Text style={styles.label}>Arabic Size</Text>
                    <View style={styles.fontSizeControls}>
                        <TouchableOpacity
                            style={styles.fontButton}
                            onPress={() => setArabicFont(Math.max(20, arabicFont - 1))}
                        >
                            <Text style={styles.fontButtonText}>−</Text>
                        </TouchableOpacity>

                        <Text style={styles.fontSizeText}>{arabicFont}</Text>

                        <TouchableOpacity
                            style={styles.fontButton}
                            onPress={() => setArabicFont(Math.min(60, arabicFont + 1))}
                        >
                            <Text style={styles.fontButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.feedback}>
                    <Pressable
                        onPress={() => {
                            Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSeOKX2lA2IYPNPCnS1n4vbQtER8GvgjXB6tGm_0aDjClQ8BCQ/viewform?usp=dialog');
                        }}
                        style={styles.Feedbutton}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>FeedBack/Report</Text>
                    </Pressable>
                </View>
                <View style={styles.BTNcontainer}>
                    <Pressable
                        onPress={() => clearAllData?.()}
                        onPressIn={() => setPressed(true)}
                        onPressOut={() => setPressed(false)}
                        style={({ pressed: isPressed }) => [
                            styles.button,
                            isPressed || pressed ? styles.buttonPressed : null
                        ]}
                    >
                        <Text style={styles.buttonText}>Default Settings</Text>
                    </Pressable>
                </View>

            </View>
        </View>
    );
};

export default Settings;


const styles = StyleSheet.create({
    container: {},
    TopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'black',
        padding: 20,
    },
    text: {
        color: 'white',
        fontSize: 18,
    },
    content: {
        padding: 20,
    },
    card: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        color: 'white',
        fontSize: 16,
    },
    toggleGroup: {
        flexDirection: 'row',
        backgroundColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 15,
    },
    toggleText: {
        color: '#ccc',
        fontSize: 15,
    },
    activeToggle: {
        backgroundColor: '#1e916c',
    },
    activeToggleText: {
        color: 'white',
        fontWeight: 'bold',
    },
    fontSizeControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    fontButton: {
        backgroundColor: '#1e916c',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },

    fontButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },

    fontSizeText: {
        color: 'white',
        fontSize: 16,
        marginHorizontal: 10,
        minWidth: 30,
        textAlign: 'center',
    },
    BTNcontainer: {
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#FF4D4D',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        elevation: 4,
    },
    buttonPressed: {
        backgroundColor: '#D93636',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedback: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    Feedbutton: {
        backgroundColor: 'green',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        elevation: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '80%',
    },
});

