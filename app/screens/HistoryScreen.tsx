import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, Colors } from '../../hooks/useColorScheme';




interface SignInData {
  employeeId: string;
  name: string;
  timestamp: string;
  isLate: boolean;
  lateByMinutes: number;
  signInTime: string;
}

const HistoryScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme as keyof typeof Colors];

  const [signIns, setSignIns] = React.useState<SignInData[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);



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
      padding: 20, 
      marginBottom: 10,
      backgroundColor: item.isLate ? '#ffebee' : '#e8f5e8',
      borderRadius: 15,
      marginHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontWeight: 'bold', 
            fontSize: 18, 
            color: colors.text,
            marginBottom: 4
          }}>
            {item.name}
          </Text>
          <Text style={{ 
            color: colors.tabIconDefault, 
            fontSize: 16,
            marginBottom: 2
          }}>
            ID: {item.employeeId}
          </Text>
          <Text style={{ 
            color: colors.tabIconDefault, 
            fontSize: 14,
            opacity: 0.8
          }}>
            {item.timestamp}
          </Text>
        </View>
        <View style={{ 
          backgroundColor: item.isLate ? '#FF3B30' : '#34C759',
          paddingHorizontal: 15,
          paddingVertical: 8,
          borderRadius: 20,
          minWidth: 80,
          alignItems: 'center'
        }}>
          <Text style={{ 
            color: 'white', 
            fontSize: 14, 
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            {item.isLate ? `LATE\n${item.lateByMinutes} min` : 'ON TIME'}
          </Text>
        </View>
      </View>
    </View>
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSignIns();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>

        Sign-In History ({signIns.length} people)
      </Text>
      
      <FlatList
        data={signIns}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.text }]}>

            No sign-ins yet
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
});



export default HistoryScreen;
