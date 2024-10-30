// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoomListScreen from '../screens/RoomListScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import BookingScreen from '../screens/BookingScreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="Login">
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="RoomList" component={RoomListScreen} />
    <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    
  </Stack.Navigator>
);

export default AppNavigator;
