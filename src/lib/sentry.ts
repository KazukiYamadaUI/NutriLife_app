import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initSentry() {
  if (!SENTRY_DSN) {
    if (__DEV__) console.debug('[Sentry] DSN not configured, skipping');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    debug: __DEV__,
    enabled: !__DEV__,
  });
}

export { Sentry };
