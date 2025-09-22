// Mock Firebase services to prevent initialization errors during development

// Mock Firebase Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    // Mock implementation - immediately call with null user
    callback(null);
    return () => {}; // Unsubscribe function
  },
  signOut: () => Promise.resolve(),
  signInWithPhoneNumber: () => Promise.reject(new Error('Mock Firebase - not implemented')),
  signInWithCredential: () => Promise.reject(new Error('Mock Firebase - not implemented'))
};

// Mock Firestore
export const firestore = {
  collection: () => ({
    doc: () => ({
      set: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] })
    })
  })
};

// Alias for compatibility
export const db = firestore;

// Mock Firebase Storage
export const storage = {
  ref: () => ({
    put: () => Promise.resolve({
      ref: {
        getDownloadURL: () => Promise.resolve('mock-url')
      }
    }),
    putString: () => Promise.resolve({
      ref: {
        getDownloadURL: () => Promise.resolve('mock-url')
      }
    }),
    getDownloadURL: () => Promise.resolve('mock-url')
  })
};

// Mock app instance
const app = {
  name: 'mock-app',
  options: {}
};

export default app;
