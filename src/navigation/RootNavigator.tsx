import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from '@/types';
import { tokens } from '@/theme/tokens';

// Screens
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { ProfileSetupScreen } from '@/screens/auth/ProfileSetupScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { CameraScreen } from '@/screens/camera/CameraScreen';
import { AnalyzingScreen } from '@/screens/analysis/AnalyzingScreen';
import { ResultScreen } from '@/screens/analysis/ResultScreen';
import { DetectionFailedScreen } from '@/screens/analysis/DetectionFailedScreen';
import { AnalysisFailedScreen } from '@/screens/analysis/AnalysisFailedScreen';
import { MealLogDetailScreen } from '@/screens/record/MealLogDetailScreen';
import { ProfileEditScreen } from '@/screens/settings/ProfileEditScreen';
import { LifestyleScreen } from '@/screens/settings/LifestyleScreen';
import { HealthKitScreen } from '@/screens/settings/HealthKitScreen';
import { TermsScreen } from '@/screens/settings/TermsScreen';
import { NotifSettingsScreen } from '@/screens/settings/NotifSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading, isProfileComplete } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.bg,
        }}
      >
        <ActivityIndicator size="large" color={tokens.green} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !isProfileComplete ? (
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Analyzing"
              component={AnalyzingScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="DetectionFailed"
              component={DetectionFailedScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen
              name="AnalysisFailed"
              component={AnalysisFailedScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen
              name="MealDetail"
              component={MealLogDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ProfileEdit"
              component={ProfileEditScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Lifestyle"
              component={LifestyleScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="HealthKit"
              component={HealthKitScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="NotifSettings"
              component={NotifSettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
