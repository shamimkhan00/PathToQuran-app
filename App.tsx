// App.tsx
import { StatusBar } from 'react-native';
import { QuranProvider } from './src/Components/Context';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './src/tabs/Navigation'
import { useEffect } from 'react';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  useEffect(() => {
    changeNavigationBarColor('#043526', false); // color, light icons false = dark icons
  }, []);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#09130f"
      />
      <SafeAreaProvider>
        <QuranProvider>
          <NavigationContainer>
            <BottomTabs />
          </NavigationContainer>
        </QuranProvider>
      </SafeAreaProvider>
    </>
  );
}
