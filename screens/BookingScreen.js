import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';

const BookingScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!currentUser) {
      navigation.navigate("Login");
      return;
    }
    fetchBookings();
  }, [currentUser, navigation]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const bookingsRef = collection(db, 'bookings');
      const bookingsQuery = query(bookingsRef, where("userId", "==", currentUser.uid));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const currentDate = new Date();
      const upcomingBookings = bookingsData
        .filter(booking => new Date(booking.bookingDate) >= currentDate)
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
      const pastBookings = bookingsData
        .filter(booking => new Date(booking.bookingDate) < currentDate)
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      setBookings({ upcoming: upcomingBookings, past: pastBookings });
    } catch (error) {
      Alert.alert("Error", "Could not fetch bookings. Please try again later.", [{ text: "OK" }]);
      console.error("Error fetching bookings:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canCancelBooking = (bookingDate) => {
    const currentDate = new Date();
    return new Date(bookingDate) > currentDate;
  };

  const handleCancelBooking = async (booking) => {
    if (!canCancelBooking(booking.bookingDate)) {
      Alert.alert("Cannot Cancel", "Bookings can only be cancelled before the booking date.", [{ text: "OK" }]);
      return;
    }
    Alert.alert(
      "Confirm Cancellation",
      `Are you sure you want to cancel your booking for ${new Date(booking.bookingDate).toLocaleDateString()}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setIsLoading(true);
              const bookingRef = doc(db, 'bookings', booking.id);
              await deleteDoc(bookingRef);
              setBookings(prevBookings => ({
                upcoming: prevBookings.upcoming.filter(b => b.id !== booking.id),
                past: prevBookings.past.filter(b => b.id !== booking.id),
              }));
              Alert.alert("Success", "Your booking has been successfully cancelled.", [{ text: "OK" }]);
            } catch (error) {
              Alert.alert("Error", "Failed to cancel booking. Please try again.", [{ text: "OK" }]);
              console.error("Error cancelling booking:", error.message);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderBookingItem = ({ item, isPast }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingInfo}>
        <Text style={styles.roomText}>Room: {item.roomId}</Text>
        <Text style={styles.dateText}>Date: {new Date(item.bookingDate).toLocaleDateString()}</Text>
        {isPast ? (
          <Text style={styles.statusText}>Status: Completed</Text>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(item)}
            disabled={!canCancelBooking(item.bookingDate)}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5E72E4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>Upcoming Bookings</Text>
        <FlatList
          data={bookings.upcoming}
          keyExtractor={(item) => item.id}
          renderItem={(props) => renderBookingItem({ ...props, isPast: false })}
          ListEmptyComponent={<Text style={styles.emptyText}>No upcoming bookings</Text>}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>Past Bookings</Text>
        <FlatList
          data={bookings.past}
          keyExtractor={(item) => item.id}
          renderItem={(props) => renderBookingItem({ ...props, isPast: true })}
          ListEmptyComponent={<Text style={styles.emptyText}>No past bookings</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F2F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#344675',
  },
  bookingItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingInfo: {
    gap: 8,
  },
  roomText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  dateText: {
    fontSize: 16,
    color: '#777',
  },
  statusText: {
    fontSize: 16,
    color: '#34A853',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FF4B55',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default BookingScreen;
