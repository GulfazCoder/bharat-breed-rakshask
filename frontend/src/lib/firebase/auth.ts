// Mock Firebase auth imports to prevent initialization errors
import { auth, firestore } from './config';
// Temporarily disable User import to fix any potential issues
// import { User } from '@/lib/types';

// Simple User type definition for mock
type User = {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  role: string;
  farmIds: string[];
  language: string;
  aadhaarVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
};

// Mock Firebase Auth types and functions
interface RecaptchaVerifier {
  render: () => Promise<number>;
  verify: () => Promise<string>;
}

interface FirebaseUser {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  email: string | null;
}

interface ConfirmationResult {
  verificationId: string;
  confirm: (code: string) => Promise<any>;
}

// Mock implementations
const signInWithPhoneNumber = (auth: any, phone: string, verifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
  return Promise.resolve({
    verificationId: 'mock-verification-id',
    confirm: () => Promise.resolve({ user: { uid: 'mock-user', phoneNumber: phone } })
  });
};

const RecaptchaVerifier = class {
  constructor(auth: any, element: string, options: any) {}
  render() { return Promise.resolve(1); }
  verify() { return Promise.resolve('mock-token'); }
};

const PhoneAuthProvider = {
  credential: (verificationId: string, code: string) => ({ verificationId, code })
};

const signInWithCredential = (auth: any, credential: any) => {
  return Promise.resolve({ user: { uid: 'mock-user', phoneNumber: '+911234567890' } });
};

const firebaseSignOut = (auth: any) => Promise.resolve();

const onAuthStateChanged = (auth: any, callback: (user: any) => void) => {
  callback(null);
  return () => {};
};

// Mock Firestore functions
const doc = (firestore: any, collection: string, id: string) => ({ collection, id });
const setDoc = (doc: any, data: any, options?: any) => Promise.resolve();
const getDoc = (doc: any) => Promise.resolve({ exists: () => false, data: () => ({}) });

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