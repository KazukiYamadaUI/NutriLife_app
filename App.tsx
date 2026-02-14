import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { checkBackendHealth } from '@/api/client';
import { tokens } from '@/theme/tokens';

export default function App() {
  useEffect(() => {
    // Check if backend is available on startup
    checkBackendHealth().then((available) => {
      if (!available) {
        console.log('Backend not available, using mock data');
      }
    });
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.bg} />
        <RootNavigator />
      </AppProvider>
    </AuthProvider>
  );
}
