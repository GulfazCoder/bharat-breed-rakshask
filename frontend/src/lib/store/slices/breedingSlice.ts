import { createSlice } from '@reduxjs/toolkit';
import { BreedingState } from '@/lib/types';

const initialState: BreedingState = {
  breedingRecords: [],
  upcomingEvents: [],
  loading: false,
  error: null,
};

export const breedingSlice = createSlice({
  name: 'breeding',
  initialState,
  reducers: {
    addBreedingRecord: (state, action) => {
      state.breedingRecords.push(action.payload);
    },
  },
});
