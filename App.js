import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, BackHandler, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import html from './htmlContent';

const BG = '#0f172a';

const SCREEN_ORDER = ['Entry', 'Exit', 'Date', 'Result'];

export default function App() {
  const webRef = useRef(null);

  const onAndroidBack = useCallback(() => {
    webRef.current?.injectJavaScript(`(function() {
      try {
        const idx = ${JSON.stringify(SCREEN_ORDER)}.indexOf(state.currentScreen);
        if (idx > 0) { goToScreen(${JSON.stringify(SCREEN_ORDER)}[idx - 1]); }
        else { window.ReactNativeWebView.postMessage('exit'); }
      } catch (e) { window.ReactNativeWebView.postMessage('exit'); }
    })(); true;`);
    return true;
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', onAndroidBack);
    return () => sub.remove();
  }, [onAndroidBack]);

  const onMessage = useCallback((e) => {
    if (e.nativeEvent.data === 'exit' && Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={BG} translucent={false} />
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://localhost/' }}
          style={styles.webview}
          containerStyle={styles.webviewContainer}
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures={false}
          bounces={false}
          overScrollMode="never"
          setSupportMultipleWindows={false}
          onMessage={onMessage}
          androidLayerType="hardware"
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  webview: { flex: 1, backgroundColor: BG },
  webviewContainer: { backgroundColor: BG },
});
