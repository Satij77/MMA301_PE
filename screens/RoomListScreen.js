import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';

const RoomListScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchRooms = async () => {
      const roomCollection = collection(db, 'rooms');
      const roomSnapshot = await getDocs(roomCollection);
      setRooms(roomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchRooms();
  }, []);

  const handleLogout = async () => {
    try {
      await logout(navigation); // Pass navigation to logout
      Alert.alert("Logged Out", "You have been logged out successfully.");
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const renderRoomItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.price}>{item.price} per night</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoomItem}
        contentContainerStyle={styles.list}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 10,
  },
  location: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#888',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default RoomListScreen;
