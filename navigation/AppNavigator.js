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
    <Stack.Screen 
      name="Login" 
      component={LoginScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="RoomList" 
      component={RoomListScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="RoomDetail" 
      component={RoomDetailScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="Booking" 
      component={BookingScreen} 
      options={{ headerShown: true }} 
    />
  </Stack.Navigator>
);

export default AppNavigator;
