import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useState, createContext, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import InternshipsScreen from './screens/student/InternshipsScreen';
import ApplicationsScreen from './screens/student/ApplicationsScreen';
import OffersScreen from './screens/student/OffersScreen';
import ProfileScreen from './screens/student/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Context
export const AuthContext = createContext(null);

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1a1a2e',
        tabBarInactiveTintColor: '#888',
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: 'white',
      }}
    >
      <Tab.Screen name="Browse" component={InternshipsScreen} options={{ tabBarIcon: () => null, tabBarLabel: '🔍 Browse' }} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} options={{ tabBarIcon: () => null, tabBarLabel: '📋 Applied' }} />
      <Tab.Screen name="Offers" component={OffersScreen} options={{ tabBarIcon: () => null, tabBarLabel: '🎉 Offers' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: () => null, tabBarLabel: '👤 Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (e) {
      setIsLoggedIn(false);
    }
    setIsLoading(false);
  };

  const signIn = async (token, user) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setIsLoggedIn(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isLoggedIn }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Main" component={StudentTabs} />
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}