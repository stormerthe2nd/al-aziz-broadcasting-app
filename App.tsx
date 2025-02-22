/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  Clipboard,
  Alert,
  Linking,
  AppState,
  NativeModules
} from 'react-native';

import notifee, { AndroidImportance } from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken, onMessage, requestPermission } from '@react-native-firebase/messaging';
import {
  Colors,
  Header
} from 'react-native/Libraries/NewAppScreen';
// @ts-ignore
import PushNotification from 'react-native-push-notification';

import { checkNotifications, openSettings, requestNotifications, RESULTS } from 'react-native-permissions';

import { Header as RNEHeader } from 'react-native-elements';

// Initialize Firebase app (if not already done)
const app = getApp();
const messaging = getMessaging(app);

function App(): React.JSX.Element {

  async function setupNotifications() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'al-aziz',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    }
  }

  // const requestNotificationFirebase = async () => {
  //   try {
  //     const authStatus = await requestPermission(messaging);
  //     console.log('Notification permission status:', authStatus);

  //     if (authStatus === 1) {
  //       console.log('Push notifications are enabled!');
  //     } else {
  //       console.log('Push notifications are not enabled');
  //     }
  //   } catch (error) {
  //     console.error('Failed to request notification permission:', error);
  //   }
  // };

  const checkNotificationPermission = async () => {
    const { status } = await checkNotifications();
    if (status === RESULTS.DENIED) {
      // Ask for permission
      const { status: newStatus } = await requestNotifications(['alert', 'sound']);
      if (newStatus !== RESULTS.GRANTED) {
        setNotificationPermission(true)
        console.log('User denied notification permissions.');
      }
    } else if (status === RESULTS.BLOCKED) {
      console.log('Notifications are blocked. Ask user to enable manually.');
      checkAndPromptNotifications()
    } else {
      console.log('Notifications are enabled.');
    }
  };

  const notifMsgHandlers = async () => {
    try {
      onMessage(messaging, async (remoteMessage) => {
        try {
          console.log('A new FCM message arrived!', remoteMessage);
          await PushNotification.localNotification({
            title: remoteMessage.notification?.title || 'New Notification',
            message: remoteMessage.notification?.body || '',
            channelId: 'al-aziz',
          });
        } catch (error) {
          console.error('Error handling foreground message:', error);
        }
      });

      messaging.setBackgroundMessageHandler(async remoteMessage => {
        try {
          console.log('Message handled in the background!', remoteMessage);
          await PushNotification.localNotification({
            title: remoteMessage.notification?.title || 'New Notification',
            message: remoteMessage.notification?.body || '',
            channelId: 'al-aziz',
          });
        } catch (error) {
          console.error('Error handling background message:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up message handlers:', error);
    }
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:'); // iOS settings
    } else {
      openSettings();
    }
  };

  const promptEnableNotifications = () => {
    Alert.alert(
      'Enable Notifications',
      'Notifications are disabled. Please enable them to get the Latest Updates.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openAppSettings },
      ]
    );
  };


  const checkAndPromptNotifications = async () => {
    checkNotifications().then(status => {
      if (status.status === RESULTS.BLOCKED || status.status === RESULTS.DENIED) {
        promptEnableNotifications();
      }
    });
  };


  const isDarkMode = useColorScheme() === 'dark';
  const [fcmToken, setFcmToken] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  const getFCMToken = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const token = await getToken(messaging);
        if (token) {
          setFcmToken(token);
          return token;
        }
        console.log(`Retrying... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Error getting token:', error);
      }
    }
    console.log('Failed to get FCM token after retries.');
    return null;
  };

  const copyToClipboard = () => {
    if (!fcmToken) {
      // Alert.alert('Error', 'No token available to copy');
      return;
    }
    try {
      Clipboard.setString(fcmToken);
      // Alert.alert('Success', 'Token copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Alert.alert('Error', 'Failed to copy token');
    }
  };

  useEffect(() => {
    setupNotifications(); // creating channel for notifications
    notifMsgHandlers() // firebase message handlers
    checkNotificationPermission() // request user permissions
    // requestNotificationFirebase();
    getFCMToken() // get firebase token to send to backend
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const unsubscribe = messaging.onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      setFcmToken(token);
    });

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from token refresh:', error);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextAppState => {
      if (nextAppState === 'active') {
        const { status } = await checkNotifications();
        if (status === RESULTS.GRANTED) {
          setNotificationPermission(false);
        } else setNotificationPermission(true);
      }
    });


    return () => subscription.remove(); // Cleanup
  }, []);


  const safePadding = '5%';

  const handlePermissionRequest = async () => {
    const { status } = await checkNotifications();
    if (status === RESULTS.BLOCKED) {
      // Open settings if permissions are blocked
      openAppSettings()
    } else {
      // Request permissions if they're just denied
      const { status: newStatus } = await requestNotifications(['alert', 'sound']);
      if (newStatus === RESULTS.GRANTED) {
        setNotificationPermission(newStatus === RESULTS.GRANTED);
      } else {
        openAppSettings()
      }
    }
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <RNEHeader
        backgroundColor={isDarkMode ? '#000' : '#fff'}
        leftComponent={{
          text: 'Al Aziz',
          style: styles.headerTitle
        }}
        rightComponent={
          notificationPermission ? {
            text: 'Enable Notifications',
            onPress: handlePermissionRequest,
            style: styles.buttonTitle
          } : undefined
        }
      />
      <ScrollView
        style={backgroundStyle}>
        <View style={{ paddingRight: safePadding }}>
          <Header />
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            paddingHorizontal: safePadding,
            paddingBottom: safePadding,
          }}>
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenLabel}>Your FCM Token:</Text>
            <Text style={styles.tokenText} numberOfLines={2}>
              {fcmToken || 'Loading token...'}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyToClipboard}
            >
              <Text style={styles.copyButtonText}>Copy Token</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  tokenContainer: {
    padding: 16,
    marginVertical: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  tokenLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tokenText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    color: '#2089dc',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTitle: {
    fontSize: 14,
    color: '#2089dc',
  },
  content: {
    flex: 1,
  },
});

export default App;
