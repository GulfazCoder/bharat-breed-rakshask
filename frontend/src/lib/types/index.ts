/**
 * Type definitions for Bharat Breed Rakshask
 * Cattle and Buffalo Breed Management System
 */

// Breed Information Types
export interface Breed {
  id: number;
  breedName: string;
  category: 'Cattle' | 'Buffalo';
  type: string;
  origin: string;
  mainDistribution: string;
  primaryUse: string;
  milkYield: string;
  milkFat: string;
  averageMaleWeight: string;
  averageFemaleWeight: string;
  heightAtWithers: string;
  bodyColor: string;
  hornShape: string;
  earType: string;
  hump: string;
  tailSwitch: string;
  diseaseResistance: string;
  climateTolerance: string;
  uniqueTraits: string;
  averageLifespan: string;
  productiveAge: string;
  ageAtFirstCalving: string;
  calvingInterval: string;
  milkImportance: string;
  conservationStatus: string;
  govtPrograms: string;
}

// Animal Profile Types
export interface Animal {
  id: string;
  name: string;
  breedId: number;
  category: 'Cattle' | 'Buffalo';
  gender: 'Male' | 'Female';
  birthDate: Date;
  age: number;
  height: number;
  weight: number;
  isPregnant: boolean;
  pregnancyDueDate?: Date;
  healthStatus: 'Healthy' | 'Sick' | 'Under Treatment' | 'Critical';
  lastVaccination?: Date;
  nextVaccination?: Date;
  images: string[];
  owner: string;
  farmId?: string;
  parentIds?: {
    motherId?: string;
    fatherId?: string;
  };
  offspringIds?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Breeding Management Types
export interface BreedingRecord {
  id: string;
  animalId: string;
  matingDate: Date;
  expectedDueDate: Date;
  actualDueDate?: Date;
  mateId?: string;
  breedingMethod: 'Natural' | 'AI' | 'ET';
  pregnancyStatus: 'Confirmed' | 'Expected' | 'Failed' | 'Delivered';
  offspringCount?: number;
  offspringIds?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vaccination and Health Types
export interface VaccinationRecord {
  id: string;
  animalId: string;
  vaccineName: string;
  vaccineType: string;
  administeredDate: Date;
  nextDueDate: Date;
  veterinarianId?: string;
  batchNumber?: string;
  notes?: string;
  createdAt: Date;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  recordType: 'Illness' | 'Treatment' | 'Checkup' | 'Injury';
  description: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  veterinarianId?: string;
  recordDate: Date;
  followUpDate?: Date;
  resolved: boolean;
  createdAt: Date;
}

// User and Farm Types
export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  role: 'Farmer' | 'Admin' | 'Veterinarian';
  farmIds: string[];
  language: 'en' | 'hi';
  aadhaarVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: {
    state: string;
    district: string;
    village: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  animalCount: number;
  farmType: 'Dairy' | 'Breeding' | 'Mixed';
  totalArea?: number;
  createdAt: Date;
  updatedAt: Date;
}

// AI Classification Types
export interface ClassificationResult {
  breedId: number;
  breedName: string;
  confidence: number;
  category: 'Cattle' | 'Buffalo';
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: {
    [key: string]: { x: number; y: number };
  };
}

export interface ATCScore {
  overall: number;
  bodyStructure: number;
  udder: number;
  legs: number;
  dairy: number;
  recommendations: string[];
}

// Government and Veterinary Types
export interface GovernmentScheme {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string;
  contactInfo: string;
  state?: string;
  category: 'Breeding' | 'Health' | 'Insurance' | 'Subsidy' | 'Training';
  isActive: boolean;
}

export interface VeterinaryContact {
  id: string;
  name: string;
  qualification: string;
  phoneNumber: string;
  address: string;
  district: string;
  state: string;
  specialization: string[];
  availability: {
    days: string[];
    hours: string;
  };
  emergencyAvailable: boolean;
  rating: number;
  reviewCount: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Camera and File Upload Types
export interface CapturedImage {
  id: string;
  file: File;
  preview: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface UploadedImage {
  id: string;
  originalUrl: string;
  compressedUrl: string;
  thumbnailUrl: string;
  metadata: {
    size: number;
    dimensions: { width: number; height: number };
    format: string;
  };
  uploadedAt: Date;
}

// Redux Store Types
export interface RootState {
  auth: AuthState;
  animals: AnimalsState;
  breeds: BreedsState;
  breeding: BreedingState;
  notifications: NotificationsState;
  offline: OfflineState;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AnimalsState {
  animals: Animal[];
  selectedAnimal: Animal | null;
  loading: boolean;
  error: string | null;
  filters: {
    category?: 'Cattle' | 'Buffalo';
    breedId?: number;
    healthStatus?: string;
    isPregnant?: boolean;
  };
}

export interface BreedsState {
  breeds: Breed[];
  selectedBreed: Breed | null;
  loading: boolean;
  error: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'breeding' | 'vaccination' | 'checkup' | 'delivery';
  animalId: string;
  animalName: string;
  description?: string;
  notificationEnabled?: boolean;
}

export interface BreedingState {
  breedingRecords: BreedingRecord[];
  upcomingEvents: BreedingRecord[];
  calendarEvents: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  filters: {
    eventType: string;
    animalId: string;
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
  };
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface OfflineState {
  isOnline: boolean;
  pendingActions: unknown[];
  lastSyncTime: Date | null;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface NavigationItem {
  id: string;
  label: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

// Form Types
export interface AnimalFormData {
  name: string;
  breedId: number;
  category: 'Cattle' | 'Buffalo';
  gender: 'Male' | 'Female';
  birthDate: string;
  height: number;
  weight: number;
  isPregnant: boolean;
  pregnancyDueDate?: string;
  healthStatus: 'Healthy' | 'Sick' | 'Under Treatment' | 'Critical';
  lastVaccination?: string;
  nextVaccination?: string;
  notes?: string;
}

export interface BreedingFormData {
  animalId: string;
  matingDate: string;
  mateId?: string;
  breedingMethod: 'Natural' | 'AI' | 'ET';
  expectedDueDate: string;
  notes?: string;
}

// Export Types
export interface ExportOptions {
  format: 'PDF' | 'Excel' | 'CSV';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeImages: boolean;
  animals?: string[];
  sections: {
    basicInfo: boolean;
    healthRecords: boolean;
    breedingRecords: boolean;
    vaccinations: boolean;
  };
}