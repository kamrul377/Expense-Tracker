// hooks/useNotifications.js
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { savePushToken } from '../services/pushService';

// Expo Go te push notification kaj kore na, ar expo-notifications load korlei error dey.
// Tai Expo Go te package ta load i kora hobe na. Development build / APK te kaj korbe.
const isExpoGo = Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';

let Notifications = null;
if (!isExpoGo) {
    try {
        // eslint-disable-next-line global-require
        Notifications = require('expo-notifications');
        // App khola thakleo notification banner dekhabe
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldShowBanner: true,
                shouldShowList: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
            }),
        });
    } catch (e) {
        console.log('expo-notifications load hoyni:', e?.message);
        Notifications = null;
    }
}

async function registerForPush() {
    if (!Notifications || !Device.isDevice) return null; // emulator e push hoy na

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#10B981',
        });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== 'granted') {
        const res = await Notifications.requestPermissionsAsync();
        status = res.status;
    }
    if (status !== 'granted') return null;

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const res = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return res.data;
}

function whenReady(navigationRef, fn, tries = 0) {
    if (navigationRef.isReady()) fn();
    else if (tries < 25) setTimeout(() => whenReady(navigationRef, fn, tries + 1), 300);
}

function openFromNotification(navigationRef, data) {
    whenReady(navigationRef, () => {
        if (data?.type === 'expense' && data?.groupId) {
            navigationRef.navigate('GroupDetail', { groupId: data.groupId });
        } else {
            navigationRef.navigate('Groups');
        }
    });
}

export default function useNotifications(navigationRef) {
    const { user } = useAuth();
    const handled = useRef(null);

    // Token nite ar Firestore e save korte
    useEffect(() => {
        if (!Notifications || !user || user.isAnonymous || !user.email) return undefined;
        let cancelled = false;
        (async () => {
            try {
                const token = await registerForPush();
                if (token && !cancelled) await savePushToken(user.email, user.uid, token);
            } catch (e) {
                console.log('Push register failed:', e?.message);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.uid, user?.email]);

    // Notification e click korle (app bondho thakleo) sothik screen e niye jabe
    useEffect(() => {
        if (!Notifications) return undefined;
        let mounted = true;

        const handle = (response) => {
            const id = response?.notification?.request?.identifier;
            if (!response || handled.current === id) return;
            handled.current = id;
            openFromNotification(navigationRef, response.notification.request.content.data);
        };

        Notifications.getLastNotificationResponseAsync()
            .then((r) => {
                if (mounted && r) handle(r);
            })
            .catch(() => { });

        const sub = Notifications.addNotificationResponseReceivedListener(handle);
        return () => {
            mounted = false;
            sub.remove();
        };
    }, [navigationRef]);
}