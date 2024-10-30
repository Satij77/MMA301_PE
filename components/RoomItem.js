import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const RoomItem = ({ room, onPress }) => (
  <TouchableOpacity onPress={() => onPress(room)} style={styles.container}>
    <Image source={{ uri: room.image }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.location}>{room.location}</Text>
      <Text style={styles.price}>${room.pricePerNight} / night</Text>
      <Text style={styles.description}>{room.description}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', margin: 10, borderRadius: 10, overflow: 'hidden' },
  image: { width: 100, height: 100 },
  info: { flex: 1, padding: 10 },
  location: { fontWeight: 'bold' },
  price: { color: 'green' },
  description: { color: 'gray' }
});

export default RoomItem;
