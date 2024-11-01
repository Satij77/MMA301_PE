import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MapView, { Marker } from 'react-native-maps';
import { AuthContext } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          setRoom(roomSnap.data());
        } else {
          Alert.alert("Error", "Room not found.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching room details:", error.message);
        Alert.alert("Error", "Unable to load room details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoomDetails();
  }, [roomId, navigation]);

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleBooking = async () => {
    if (!currentUser) {
      Alert.alert("Booking Failed", "You must be logged in to book a room.");
      navigation.navigate("Login");
      return;
    }
  
    try {
      const bookingRef = collection(db, 'bookings');
      await addDoc(bookingRef, {
        roomId,
        bookingDate: selectedDate.toISOString(),
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      
      Alert.alert(
        "Booking Successful", 
        `Your booking has been confirmed for ${selectedDate.toLocaleDateString()}!`,
        [
          {
            text: "View My Bookings",
            onPress: () => navigation.navigate("Booking")
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
    } catch (error) {
      console.error("Booking error:", error.message);
      Alert.alert("Booking Failed", "Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0340bd" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.container}>
        <Text>Room details not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: room.image }} 
          style={styles.image}
          blurRadius={1}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        />
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.location}>{room.location}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>VND {room.price}</Text>
          </View>
        </View>

        <Text style={styles.description}>{room.description}</Text>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <FlatList
            data={room.amenities}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.amenityChip}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={showDatepicker}
          >
            <Ionicons name="calendar" size={20} color="#0340bd" />
            <Text style={styles.dateButtonText}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: room.latitude,
              longitude: room.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker 
              coordinate={{ 
                latitude: room.latitude, 
                longitude: room.longitude 
              }} 
            />
          </MapView>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <LinearGradient
            colors={['#040229', '#0340bd']}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewBookingsButton}
          onPress={() => navigation.navigate("Booking")}
        >
          <Text style={styles.viewBookingsButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0340bd',
  },
  
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  amenityChip: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  amenityText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
  },
  dateButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  bookButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewBookingsButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 15,
    marginTop: 15,
  },
  viewBookingsButtonText: {
    color: '#0340bd',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
});

export default RoomDetailScreen;