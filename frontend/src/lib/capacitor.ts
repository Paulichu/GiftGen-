import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushNotifications } from '@capacitor/push-notifications';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

export function isNative(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

export async function initNative(): Promise<void> {
  if (!isNative()) return;

  try {
    // Set StatusBar to Dark style with black background
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0A0A0B' });
  } catch (err) {
    console.warn('[Native] StatusBar setup error:', err);
  }

  try {
    // Hide splash screen after initialization
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[Native] SplashScreen hide error:', err);
  }

  try {
    // Request push notification permissions and register listeners
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive === 'granted') {
      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('[Native] Push registration token:', token.value);
        if (typeof window !== 'undefined') {
          localStorage.setItem('emergent_push_token', token.value);
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.warn('[Native] Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Native] Push received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('[Native] Push action performed:', action);
      });
    }
  } catch (err) {
    console.warn('[Native] PushNotifications init error:', err);
  }
}

/**
 * Biometric authentication helper for native devices (Fingerprint, FaceID, Device Credential)
 */
export async function authenticateBiometric(reason = 'Odblokuj dostęp do Vibe Engine'): Promise<boolean> {
  if (!isNative()) {
    console.log('[Biometric] Non-native environment, authentication bypassed');
    return true;
  }

  try {
    const checkResult = await BiometricAuth.checkBiometry();
    if (!checkResult.isAvailable) {
      console.warn('[Biometric] Biometry not available:', checkResult.reason);
      return false;
    }

    await BiometricAuth.authenticate({
      reason,
      cancelTitle: 'Anuluj',
      allowDeviceCredential: true,
      iosFallbackTitle: 'Użyj kodu PIN',
    });
    return true;
  } catch (err) {
    console.warn('[Biometric] Authentication failed or cancelled:', err);
    return false;
  }
}
