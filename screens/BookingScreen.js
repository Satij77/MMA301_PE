import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
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
      Alert.alert(
        "Error",
        "Could not fetch bookings. Please try again later.",
        [{ text: "OK" }]
      );
      console.error("Error fetching bookings:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canCancelBooking = (bookingDate) => {
    const currentDate = new Date();
    const bookingDateTime = new Date(bookingDate);
    // Chỉ cho phép hủy đặt phòng trước ngày đặt
    return bookingDateTime > currentDate;
  };

  const handleCancelBooking = async (booking) => {
    if (!canCancelBooking(booking.bookingDate)) {
      Alert.alert(
        "Cannot Cancel",
        "Bookings can only be cancelled before the booking date.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Confirm Cancellation",
      `Are you sure you want to cancel your booking for ${new Date(booking.bookingDate).toLocaleDateString()}?`,
      [
        {
          text: "No",
          style: "cancel"
        },
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

              Alert.alert(
                "Success",
                "Your booking has been successfully cancelled.",
                [{ text: "OK" }]
              );
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to cancel booking. Please try again.",
                [{ text: "OK" }]
              );
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
        <Text style={styles.dateText}>
          Date: {new Date(item.bookingDate).toLocaleDateString()}
        </Text>
        {isPast ? (
          <Text style={styles.statusText}>Status: Completed</Text>
        ) : (
          <Button
            title="Cancel Booking"
            onPress={() => handleCancelBooking(item)}
            color="#ff4444"
            disabled={!canCancelBooking(item.bookingDate)}
          />
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
          ListEmptyComponent={
            <Text style={styles.emptyText}>No upcoming bookings</Text>
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Past Bookings</Text>
        <FlatList
          data={bookings.past}
          keyExtractor={(item) => item.id}
          renderItem={(props) => renderBookingItem({ ...props, isPast: true })}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No past bookings</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    flex: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  bookingItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  bookingInfo: {
    gap: 8,
  },
  roomText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statusText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default BookingScreen;