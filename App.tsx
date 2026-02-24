import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { tokens } from '@/theme/tokens';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.bg} />
        <RootNavigator />
      </AppProvider>
    </AuthProvider>
  );
}
