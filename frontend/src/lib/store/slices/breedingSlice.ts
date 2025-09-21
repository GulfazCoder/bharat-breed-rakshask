import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BreedingState, BreedingRecord, CalendarEvent } from '@/lib/types';

const initialState: BreedingState = {
  breedingRecords: [
    {
      id: '1',
      animalId: 'animal-1',
      matingDate: new Date('2024-03-15'),
      expectedDueDate: new Date('2024-12-15'),
      breedingMethod: 'Natural',
      pregnancyStatus: 'Confirmed',
      notes: 'Healthy pregnancy progress',
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }
  ],
  upcomingEvents: [],
  calendarEvents: [
    {
      id: '1',
      title: 'Ganga - Due Date',
      start: new Date(2024, 11, 15),
      end: new Date(2024, 11, 15),
      type: 'delivery',
      animalId: 'animal-1',
      animalName: 'Ganga',
      description: 'Expected delivery date',
      notificationEnabled: true
    },
    {
      id: '2',
      title: 'Lakshmi - Vaccination',
      start: new Date(2024, 10, 30),
      end: new Date(2024, 10, 30),
      type: 'vaccination',
      animalId: 'animal-2',
      animalName: 'Lakshmi',
      description: 'Annual vaccination due',
      notificationEnabled: true
    },
    {
      id: '3',
      title: 'Shyama - Breeding',
      start: new Date(2024, 11, 5),
      end: new Date(2024, 11, 5),
      type: 'breeding',
      animalId: 'animal-3',
      animalName: 'Shyama',
      description: 'Optimal breeding time',
      notificationEnabled: true
    },
    {
      id: '4',
      title: 'Kamdhenu - Health Checkup',
      start: new Date(2024, 11, 8),
      end: new Date(2024, 11, 8),
      type: 'checkup',
      animalId: 'animal-4',
      animalName: 'Kamdhenu',
      description: 'Monthly health checkup',
      notificationEnabled: false
    }
  ],
  selectedEvent: null,
  filters: {
    eventType: 'all',
    animalId: 'all',
    dateRange: {
      start: null,
      end: null
    }
  },
  loading: false,
  error: null,
};

// Async thunks for API calls (mock implementations)
export const fetchBreedingRecords = createAsyncThunk(
  'breeding/fetchRecords',
  async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return initialState.breedingRecords;
  }
);

export const fetchCalendarEvents = createAsyncThunk(
  'breeding/fetchEvents',
  async () => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialState.calendarEvents;
  }
);

export const addCalendarEvent = createAsyncThunk(
  'breeding/addEvent',
  async (eventData: Omit<CalendarEvent, 'id'>) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}`
    };
    return newEvent;
  }
);

export const updateCalendarEvent = createAsyncThunk(
  'breeding/updateEvent',
  async (eventData: CalendarEvent) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return eventData;
  }
);

export const deleteCalendarEvent = createAsyncThunk(
  'breeding/deleteEvent',
  async (eventId: string) => {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return eventId;
  }
);

export const breedingSlice = createSlice({
  name: 'breeding',
  initialState,
  reducers: {
    addBreedingRecord: (state, action) => {
      state.breedingRecords.push(action.payload);
    },
    updateBreedingRecord: (state, action) => {
      const index = state.breedingRecords.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.breedingRecords[index] = action.payload;
      }
    },
    deleteBreedingRecord: (state, action) => {
      state.breedingRecords = state.breedingRecords.filter(record => record.id !== action.payload);
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch breeding records
      .addCase(fetchBreedingRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBreedingRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.breedingRecords = action.payload;
      })
      .addCase(fetchBreedingRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch breeding records';
      })
      // Fetch calendar events
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.calendarEvents = action.payload;
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch calendar events';
      })
      // Add calendar event
      .addCase(addCalendarEvent.fulfilled, (state, action) => {
        state.calendarEvents.push(action.payload);
      })
      // Update calendar event
      .addCase(updateCalendarEvent.fulfilled, (state, action) => {
        const index = state.calendarEvents.findIndex(event => event.id === action.payload.id);
        if (index !== -1) {
          state.calendarEvents[index] = action.payload;
        }
      })
      // Delete calendar event
      .addCase(deleteCalendarEvent.fulfilled, (state, action) => {
        state.calendarEvents = state.calendarEvents.filter(event => event.id !== action.payload);
      });
  },
});
