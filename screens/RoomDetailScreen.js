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
  Platform
} from 'react-native';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MapView, { Marker } from 'react-native-maps';
import { AuthContext } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

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
        bookingDate: selectedDate.toISOString(),  // Chỉ lưu ngày đặt phòng
        userId: currentUser.uid, // Nếu bạn muốn lưu ID người dùng
        createdAt: serverTimestamp(), // Sử dụng serverTimestamp để lưu thời gian hiện tại
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
        <ActivityIndicator size="large" color="#0000ff" />
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
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: room.image }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.location}>{room.location}</Text>
        <Text style={styles.price}>Price: ${room.price}/night</Text>
        <Text style={styles.description}>{room.description}</Text>
        
        <Text style={styles.sectionTitle}>Amenities:</Text>
        <FlatList
          data={room.amenities}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Text style={styles.amenityItem}>• {item}</Text>
          )}
          scrollEnabled={false}
        />

        <View style={styles.datePickerContainer}>
          <Text style={styles.sectionTitle}>Select Date:</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={showDatepicker}
          >
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

        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>

        {/* Nút chuyển đến xem danh sách đặt phòng */}
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 16,
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: '#2196F3',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  amenityItem: {
    fontSize: 16,
    marginLeft: 8,
    marginBottom: 4,
    color: '#444',
  },
  datePickerContainer: {
    marginVertical: 16,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  map: {
    width: '100%',
    height: 200,
    marginVertical: 16,
    borderRadius: 8,
  },
  bookButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  viewBookingsButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  viewBookingsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RoomDetailScreen;
