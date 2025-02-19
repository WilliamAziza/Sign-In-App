import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  History: undefined;
};

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

type Props = {
  navigation: SignInScreenNavigationProp;
};

const SignInScreen = ({ navigation }: Props) => {
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
      console.log('Sign-in data stored:', signIns);
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
      console.log('Sign-in data retrieved:', signIns);
      if (!signIns) {

        console.log('No sign-ins to sync');
        return;
      }

      console.log('Attempting to sync sign-ins:', signIns);
      
      const response = await fetch('https://your-server.com/api/signins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: signIns,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server responded with error:', response.status, errorText);
        Alert.alert('Sync Error', `Server error: ${response.status}`);
        return;
      }

      const serverResponse = await response.json();
      console.log('Server response:', serverResponse);

      if (serverResponse.success) {
        const syncedIds = serverResponse.syncedIds || [];
        const localSignIns = JSON.parse(signIns);
        const remainingSignIns = localSignIns.filter(
          (signIn: any) => !syncedIds.includes(signIn.id)
        );
        
        await AsyncStorage.setItem('signIns', JSON.stringify(remainingSignIns));
        Alert.alert('Success', 'Sign-in data synced with server');
      } else {
        Alert.alert('Sync Error', serverResponse.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      Alert.alert('Network Error', 'Failed to connect to server. Data will be synced later.');
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
