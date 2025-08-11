import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  History: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

type Props = {
  navigation: SignInScreenNavigationProp;
};

interface SignInData {
  employeeId: string;
  name: string;
  timestamp: string;
  isLate: boolean;
  lateByMinutes: number;
  signInTime: string;
}

const SignInScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const checkIfLate = (signInTime: Date): { isLate: boolean; lateByMinutes: number } => {
    const lateThreshold = new Date();
    lateThreshold.setHours(8, 30, 0, 0); // 8:30 AM
    
    if (signInTime > lateThreshold) {
      const lateByMinutes = Math.floor((signInTime.getTime() - lateThreshold.getTime()) / (1000 * 60));
      return { isLate: true, lateByMinutes };
    }
    return { isLate: false, lateByMinutes: 0 };
  };

  const handleSignIn = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!employeeId.trim()) {
      Alert.alert('Error', 'Please enter your employee ID');
      return;
    }

    const signInTime = new Date();
    const { isLate, lateByMinutes } = checkIfLate(signInTime);

    const signInData: SignInData = {
      employeeId: employeeId.trim(),
      name: name.trim(),
      timestamp: signInTime.toLocaleString(),
      isLate,
      lateByMinutes,
      signInTime: signInTime.toISOString(),
    };

    try {
      const existingData = await AsyncStorage.getItem('signIns');
      const signIns = existingData ? JSON.parse(existingData) : [];
      signIns.push(signInData);
      await AsyncStorage.setItem('signIns', JSON.stringify(signIns));
      
      const message = isLate 
        ? `Sign-in recorded. You are ${lateByMinutes} minutes late!`
        : 'Sign-in recorded successfully. You are on time!';
      
      Alert.alert('Success', message);
      
      setName('');
      setEmployeeId('');
    } catch (error) {
      console.error('Failed to save sign-in data:', error);
      Alert.alert('Error', 'Failed to save sign-in data');
    }

    try {
      const { isConnected } = await NetInfo.fetch();
      if (isConnected) {
        setIsSyncing(true);
        setSyncError(null);
        try {
          await syncData();
        } catch (error) {
          setSyncError('Failed to sync data. Will retry automatically.');
        } finally {
          setIsSyncing(false);
        }
      } else {
        setSyncError('You\'re offline. Data will sync when you\'re back online.');
      }
    } catch (error) {
      console.error('Network check failed:', error);
      setSyncError('Network error. Please check your connection.');
    }
  };

  const SERVER_URL = 'https://api.yourdomain.com/signins'; // Update with your actual server URL

  const syncData = async () => {
    try {
      const signIns = await AsyncStorage.getItem('signIns');
      console.log('Sign-in data retrieved:', signIns);
      if (!signIns) {
        console.log('No sign-ins to sync');
        return;
      }

      console.log('Attempting to sync sign-ins:', signIns);
      
      const response = await fetch(SERVER_URL, {
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
      Alert.alert('Sync Status', 'Failed to connect to server. Your data has been saved locally and will be synced automatically when you\'re back online.');
    }
  };


  const colorScheme = useColorScheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 30,
      marginTop: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Colors[colorScheme ?? 'light'].text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: Colors[colorScheme ?? 'light'].tabIconDefault,
      opacity: 0.8,
    },
    formCard: {
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      borderRadius: 15,
      padding: 25,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors[colorScheme ?? 'light'].text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      borderColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      color: Colors[colorScheme ?? 'light'].text,
      backgroundColor: Colors[colorScheme ?? 'light'].background,
      fontSize: 16,
    },
    signInButton: {
      backgroundColor: '#007AFF',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
    },
    disabledButton: {
      backgroundColor: '#C7C7CC',
    },
    signInButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    historyButton: {
      backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    historyButtonText: {
      color: Colors[colorScheme ?? 'light'].text,
      fontSize: 16,
      fontWeight: '600',
    },
    errorText: {
      color: '#FF3B30',
      marginTop: 10,
      textAlign: 'center',
      fontSize: 14,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Employee Sign-In</Text>
        <Text style={styles.subtitle}>Track your daily attendance</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          placeholder="Enter your employee ID"
          placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
          value={employeeId}
          onChangeText={setEmployeeId}
          style={styles.input}
          keyboardType="default"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="Enter your full name"
          placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TouchableOpacity 
          style={[styles.signInButton, isSyncing && styles.disabledButton]} 
          onPress={handleSignIn} 
          disabled={isSyncing}
        >
          <Text style={styles.signInButtonText}>
            {isSyncing ? "Signing In..." : "Sign In Now"}
          </Text>
        </TouchableOpacity>

        {syncError && (
          <Text style={styles.errorText}>
            {syncError}
          </Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyButtonText}>📊 View Sign-In History</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignInScreen;
