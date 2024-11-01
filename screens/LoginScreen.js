// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { TextInput, Button, Text, Appbar, Snackbar } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('RoomList');
    } catch (error) {
      setErrorMessage(error.message);
      setVisible(true);
    }
  };

  const onDismissSnackBar = () => setVisible(false);

  return (
    <ImageBackground
      source={{ uri: 'https://img.freepik.com/free-photo/blue-wallpaper-with-blue-background_1340-27532.jpg?t=st=1730461846~exp=1730465446~hmac=93d6d154e868da89b554f4c80fae2688800d13345bd2947734e185728638c0fe&w=740' }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="Login" titleStyle={styles.title} />
        </Appbar.Header>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon={() => <MaterialIcons name="email" size={20} />} />}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          left={<TextInput.Icon icon={() => <MaterialIcons name="lock" size={20} />} />}
        />
        <Button mode="contained" onPress={handleLogin} style={styles.loginButton} labelStyle={styles.buttonText}>
          Login
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Register')} style={styles.registerButton}>
          Don't have an account? Register
        </Button>
      </View>
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'Close',
          onPress: onDismissSnackBar,
        }}
      >
        {errorMessage}
      </Snackbar>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 16,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0340bd',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  loginButton: {
    marginTop: 16,
    borderRadius: 25,
    paddingVertical: 8,
    backgroundColor: '#0340bd',
  },
  registerButton: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#0340bd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;