import React from 'react';
import { Image, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import HomeTab from './index';
import TafsirTab from './Tafsir';
import AITab from './AI';

// 1. Define your route names as a type
type RootTabParamList = {
  Home: undefined;
  Tafsir: undefined;
  AI: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  
  const TAB_BAR_CONFIG = {
    baseHeight: 50,
    paddingTop: 10,
    activeColor: '#0aa',
    inactiveColor: 'gray',
    backgroundColor: '#043526',
  };

  const getTabBarHeight = () => {
    if (Platform.OS === 'ios') {
      return TAB_BAR_CONFIG.baseHeight + insets.bottom;
    }
    return TAB_BAR_CONFIG.baseHeight + Math.max(insets.bottom, 10);
  };

  // 2. Type the route parameter
  const renderTabIcon = (
    route: { name: keyof RootTabParamList },
    color: string,
    size: number
  ) => {
    const icons = {
      Home: <FontAwesome5 name="quran" size={size} color={color} />,
      Tafsir: <Entypo name="open-book" size={size} color={color} />,
      AI: (
        <Image
          source={require('../../assets/images/AIbutton.png')}
          style={{ width: size, height: size, tintColor: color }}
          resizeMode="contain"
        />
      ),
    };
    return icons[route.name];
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => renderTabIcon(route, color, size),
        tabBarActiveTintColor: TAB_BAR_CONFIG.activeColor,
        tabBarInactiveTintColor: TAB_BAR_CONFIG.inactiveColor,
        tabBarStyle: {
          backgroundColor: TAB_BAR_CONFIG.backgroundColor,
          borderTopWidth: 0,
          height: getTabBarHeight(),
          paddingTop: TAB_BAR_CONFIG.paddingTop,
          paddingBottom: insets.bottom > 0 ? insets.bottom / 2 : 0,
        },
        headerShown: false,
        tabBarLabelStyle: {
          paddingBottom: Platform.select({
            ios: insets.bottom > 0 ? insets.bottom / 3 : 4,
            android: 4,
          }),
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Tafsir" component={TafsirTab} />
      <Tab.Screen name="AI" component={AITab} />
    </Tab.Navigator>
  );
};

export default BottomTabs;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09130f',
  },
});