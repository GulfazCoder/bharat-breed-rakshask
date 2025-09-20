import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Animal, AnimalsState } from '@/lib/types';

// Initial state
const initialState: AnimalsState = {
  animals: [],
  selectedAnimal: null,
  loading: false,
  error: null,
  filters: {},
};

// Mock data
const mockAnimals: Animal[] = [
  {
    id: '1',
    name: 'Ganga',
    breedId: 1,
    category: 'Cattle',
    gender: 'Female',
    birthDate: new Date('2021-03-15'),
    age: 3,
    height: 125,
    weight: 450,
    isPregnant: true,
    pregnancyDueDate: new Date('2024-12-15'),
    healthStatus: 'Healthy',
    lastVaccination: new Date('2024-06-01'),
    nextVaccination: new Date('2025-06-01'),
    images: [],
    owner: 'farmer1',
    farmId: 'farm1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Lakshmi',
    breedId: 47,
    category: 'Buffalo',
    gender: 'Female',
    birthDate: new Date('2020-08-20'),
    age: 4,
    height: 140,
    weight: 550,
    isPregnant: false,
    healthStatus: 'Healthy',
    lastVaccination: new Date('2024-05-15'),
    nextVaccination: new Date('2025-05-15'),
    images: [],
    owner: 'farmer1',
    farmId: 'farm1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Async thunks
export const fetchAnimals = createAsyncThunk(
  'animals/fetchAnimals',
  async () => {
    // Mock API call
    return new Promise<Animal[]>((resolve) => {
      setTimeout(() => resolve(mockAnimals), 500);
    });
  }
);

export const addAnimal = createAsyncThunk(
  'animals/addAnimal',
  async (animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Mock API call
    const newAnimal: Animal = {
      ...animalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newAnimal;
  }
);

export const updateAnimal = createAsyncThunk(
  'animals/updateAnimal',
  async ({ id, updates }: { id: string; updates: Partial<Animal> }) => {
    // Mock API call
    return { id, updates: { ...updates, updatedAt: new Date() } };
  }
);

export const deleteAnimal = createAsyncThunk(
  'animals/deleteAnimal',
  async (id: string) => {
    // Mock API call
    return id;
  }
);

// Animals slice
export const animalsSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    setSelectedAnimal: (state, action: PayloadAction<Animal | null>) => {
      state.selectedAnimal = action.payload;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch animals
      .addCase(fetchAnimals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnimals.fulfilled, (state, action) => {
        state.loading = false;
        state.animals = action.payload;
        state.error = null;
      })
      .addCase(fetchAnimals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch animals';
      })
      // Add animal
      .addCase(addAnimal.fulfilled, (state, action) => {
        state.animals.push(action.payload);
      })
      // Update animal
      .addCase(updateAnimal.fulfilled, (state, action) => {
        const index = state.animals.findIndex(animal => animal.id === action.payload.id);
        if (index !== -1) {
          state.animals[index] = { ...state.animals[index], ...action.payload.updates };
        }
      })
      // Delete animal
      .addCase(deleteAnimal.fulfilled, (state, action) => {
        state.animals = state.animals.filter(animal => animal.id !== action.payload);
        if (state.selectedAnimal?.id === action.payload) {
          state.selectedAnimal = null;
        }
      });
  },
});