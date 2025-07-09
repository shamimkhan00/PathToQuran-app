import Ionicons from 'react-native-vector-icons/Ionicons';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useQuran } from './Context';
import Settings from '../Components/Settings';
const { width, height } = Dimensions.get('window');

const Header = () => {

    const {
        script,
        setScript,
        showTrans,
        setShowTrans,
        isSettingsVisible,
        setIsSettingsVisible,
        slideAnim,
      } = useQuran();

    const toggleSettings = () => {
        Animated.timing(slideAnim, {
            toValue: isSettingsVisible ? width : 0,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setIsSettingsVisible(!isSettingsVisible);
        });
    };

    const closeSettings = () => {
        Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            setIsSettingsVisible(false);
        });
    };
    return (
        <>
            {/* <StatusBar barStyle="light-content" backgroundColor="#09130f" /> */}
            <View style={styles.header}>
                <Text style={styles.headerText} >Path To Quran</Text>
                <TouchableOpacity onPress={toggleSettings}style={styles.settings}>
                    <Ionicons name="settings-outline" size={27} color="#1e916c" />
                </TouchableOpacity>
            </View>
            <Animated.View
                style={[
                    styles.settingsPanel,
                    { transform: [{ translateX: slideAnim }] },
                ]}
            >
                <Settings script={script} setScript={setScript} showTrans={showTrans} setShowTrans={setShowTrans} closeSettings={closeSettings} />
            </Animated.View>
        </>
    );
};

export default Header;


const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingHorizontal: 10,

    },
    headerText: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#1e916c',
    },
    settings: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsPanel: {
        position: 'absolute',
        top: 0,
        right: 0,
        width,
        height,
        backgroundColor: '#222',
        zIndex: 10,
    },
});

