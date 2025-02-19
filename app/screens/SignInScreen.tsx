import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const SignInScreen = ({ navigation }) => {
  const [name, setName] = useState('');

  const handleSignIn = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    const signInData = {
      name: name.trim(),
      timestamp: new Date().toLocaleString(),
    };

    try {
      const existingData = await AsyncStorage.getItem('signIns');
      const signIns = existingData ? JSON.parse(existingData) : [];
      signIns.push(signInData);
      await AsyncStorage.setItem('signIns', JSON.stringify(signIns));
      Alert.alert('Success', 'Sign-in recorded locally');
      setName('');
    } catch (error) {
      console.error('Failed to save sign-in data:', error);
      Alert.alert('Error', 'Failed to save sign-in data');
    }

    try {
      const { isConnected } = await NetInfo.fetch();
      if (isConnected) {
        await syncData();
      }
    } catch (error) {
      console.error('Network check failed:', error);
    }
  };

  const syncData = async () => {
    try {
      const signIns = await AsyncStorage.getItem('signIns');
      if (signIns) {
        const response = await fetch('https://your-server.com/api/signins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: signIns,
        });

        if (response.ok) {
          await AsyncStorage.removeItem('signIns');
          Alert.alert('Success', 'Sign-in data synced with server');
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
      Alert.alert('Error', 'Failed to sync data with server');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{ 
          borderWidth: 1, 
          padding: 10,
          borderRadius: 5,
          marginBottom: 20
        }}
      />

      <View style={{ marginBottom: 20 }}>
        <Button title="Sign In" onPress={handleSignIn} />
      </View>

      <Button 
        title="View Sign-In History" 
        onPress={() => navigation.navigate('History')}
      />
    </View>
  );
};

export default SignInScreen;
