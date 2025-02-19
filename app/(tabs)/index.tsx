import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ title: 'Employee Sign-In' }}
      />
      <Stack.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'Sign-In History' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
