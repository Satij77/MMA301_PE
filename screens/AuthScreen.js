import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { auth } from '../config/firebaseConfig';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigation.navigate('RoomList');
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignup = async () => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      navigation.navigate('RoomList');
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={handleSignup} />
    </View>
  );
}
