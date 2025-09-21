import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  PhoneAuthProvider, 
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './config';
import { User } from '@/lib/types';

// Initialize reCAPTCHA verifier
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (elementId: string): RecaptchaVerifier => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }
  return recaptchaVerifier;
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string, recaptcha: RecaptchaVerifier) => {
  try {
    // Format phone number with country code
    const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
    
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptcha);
    return {
      success: true,
      verificationId: confirmationResult.verificationId,
      confirmationResult
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify OTP and sign in
export const verifyOTP = async (verificationId: string, otp: string) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const result = await signInWithCredential(auth, credential);
    
    // Create or update user document in Firestore
    const userDoc = await createOrUpdateUser(result.user);
    
    return {
      success: true,
      user: userDoc
    };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create or update user document in Firestore
export const createOrUpdateUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userRef = doc(firestore, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  
  const now = new Date();
  
  if (userSnap.exists()) {
    // Update existing user
    const userData = userSnap.data() as User;
    const updatedUser = {
      ...userData,
      lastLogin: now
    };
    
    await setDoc(userRef, updatedUser, { merge: true });
    return updatedUser;
  } else {
    // Create new user
    const newUser: User = {
      id: firebaseUser.uid,
      phoneNumber: firebaseUser.phoneNumber || '',
      name: firebaseUser.displayName || 'Farmer',
      email: firebaseUser.email || undefined,
      role: 'Farmer',
      farmIds: [],
      language: 'en',
      aadhaarVerified: false,
      createdAt: now,
      lastLogin: now
    };
    
    await setDoc(userRef, newUser);
    return newUser;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await createOrUpdateUser(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};