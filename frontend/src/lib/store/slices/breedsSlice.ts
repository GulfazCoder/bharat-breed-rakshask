import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Breed, BreedsState } from '@/lib/types';
import breedsData from '@/lib/constants/breeds-database.json';

const initialState: BreedsState = {
  breeds: [],
  selectedBreed: null,
  loading: false,
  error: null,
};

export const fetchBreeds = createAsyncThunk(
  'breeds/fetchBreeds',
  async () => {
    return breedsData as Breed[];
  }
);

export const breedsSlice = createSlice({
  name: 'breeds',
  initialState,
  reducers: {
    setSelectedBreed: (state, action) => {
      state.selectedBreed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBreeds.fulfilled, (state, action) => {
        state.breeds = action.payload;
        state.loading = false;
      });
  },
});
