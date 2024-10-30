import { initializeApp, getApps } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3SkVN43lKAlC0YY2W-UTkHfeyWVMWYao",
  authDomain: "roomrentalapp-2c69a.firebaseapp.com",
  projectId: "roomrentalapp-2c69a",
  storageBucket: "roomrentalapp-2c69a.appspot.com",
  messagingSenderId: "390669216680",
  appId: "1:390669216680:web:1e2c5849532ed600e38b9d",
  measurementId: "G-TC5VBBTLHL"
};

// Initialize Firebase app if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];  // use the existing initialized app
}

// Initialize Auth with AsyncStorage for persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  if (error.code === "auth/already-initialized") {
    auth = getAuth(app);  // use the already initialized auth instance
  } else {
    throw error;
  }
}

export { auth };
export const db = getFirestore(app);
export default app;
