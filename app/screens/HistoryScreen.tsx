import React from 'react';
import { View, FlatList, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SignInData {
  name: string;
  timestamp: string;
}

const HistoryScreen = () => {
  const [signIns, setSignIns] = React.useState<SignInData[]>([]);

  React.useEffect(() => {
    loadSignIns();
  }, []);

  const loadSignIns = async () => {
    try {
      const existingData = await AsyncStorage.getItem('signIns');
      if (existingData) {
        const parsedData = JSON.parse(existingData);
        if (Array.isArray(parsedData)) {
          setSignIns(parsedData);
        }
      }
    } catch (error) {
      console.error('Failed to load sign-ins:', error);
    }
  };

  const renderItem = ({ item }: { item: SignInData }) => (
    <View style={{ 
      padding: 10, 
      borderBottomWidth: 1, 
      borderBottomColor: '#ccc',
      marginBottom: 5
    }}>
      <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ color: '#666' }}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 20
      }}>
        Sign-In History ({signIns.length} people)
      </Text>
      
      <FlatList
        data={signIns}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            No sign-ins yet
          </Text>
        }
      />
    </View>
  );
};

export default HistoryScreen;
