import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

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
      await logout(navigation);
      Alert.alert("Logged Out", "You have been logged out successfully.");
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  const RoomCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })}
      style={styles.cardContainer}
    >
      <BlurView intensity={20} style={styles.card}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage} 
          blurRadius={2}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.locationText}>
                <Feather name="map-pin" size={18} color="white" /> {item.location}
              </Text>
              <Text style={styles.priceText}>
                <FontAwesome5 name="money-bill-wave" size={16} color="#e0e0e0" /> VND {item.price}
              </Text>
            </View>
            
          </View>

          <Text 
            style={styles.descriptionText} 
            numberOfLines={2}
          >
            <MaterialIcons name="description" size={16} color="#e0e0e0" /> {item.description}
          </Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.amenities}>
              <View style={styles.amenityItem}>
                <Ionicons name="wifi" size={18} color="white" />
                <Text style={styles.amenityText}>Free WiFi</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })}
            >
              <Text style={styles.detailButtonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#040229', '#0340bd']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Rooms</Text>
          <View style={styles.headerRow}>
            <Text style={styles.headerSubtitle}>
              <Ionicons name="home" size={16} color="white" /> Find your perfect stay
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RoomCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    paddingVertical: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 20,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardImage: {
    width: '100%',
    height: 220,
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    padding: 15,
    justifyContent: 'flex-end',
    height: 220,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    alignItems: 'center',
  },
  favoriteIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  },
  priceText: {
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 5,
  },
  descriptionText: {
    color: '#e0e0e0',
    fontSize: 14,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenities: {
    flexDirection: 'row',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  amenityText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailButtonText: {
    color: 'white',
    marginRight: 8,
    fontWeight: '600',
  },
});

export default RoomListScreen;