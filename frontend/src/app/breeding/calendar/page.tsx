'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { ArrowLeft, Plus, Filter, Calendar as CalendarIcon, Search, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Link from 'next/link';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  breedingSlice,
  fetchCalendarEvents,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '@/lib/store/slices/breedingSlice';
import { RootState, CalendarEvent } from '@/lib/types';
import { useNotificationReminders } from '@/hooks/useNotificationReminders';

const localizer = momentLocalizer(moment);

interface EventFormData {
  title: string;
  animalName: string;
  type: 'breeding' | 'vaccination' | 'checkup' | 'delivery';
  date: string;
  time: string;
  description: string;
  notificationEnabled: boolean;
}

const BreedingCalendar: React.FC = () => {
  const dispatch = useDispatch();
  const { calendarEvents, filters, loading, selectedEvent } = useSelector((state: RootState) => state.breeding as any);
  
  // Initialize notification reminders
  const { notifications, unreadCount, markAsRead } = useNotificationReminders();
  
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    animalName: '',
    type: 'breeding',
    date: '',
    time: '09:00',
    description: '',
    notificationEnabled: true
  });

  // Load events on component mount
  useEffect(() => {
    dispatch(fetchCalendarEvents() as any);
  }, [dispatch]);

  // Reset form data when dialog closes
  useEffect(() => {
    if (!showAddEvent && !editingEvent) {
      resetForm();
    }
  }, [showAddEvent, editingEvent]);

  // Mock animals data (this would come from animals slice in complete implementation)
  const mockAnimals = [
    { id: 'animal-1', name: 'Ganga' },
    { id: 'animal-2', name: 'Lakshmi' },
    { id: 'animal-3', name: 'Shyama' },
    { id: 'animal-4', name: 'Kamdhenu' },
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      animalName: '',
      type: 'breeding',
      date: '',
      time: '09:00',
      description: '',
      notificationEnabled: true
    });
  };

  const handleFormChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEvent = async () => {
    try {
      // Validate form
      if (!formData.title || !formData.animalName || !formData.date) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create date object from form data
      const eventDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const eventData: Omit<CalendarEvent, 'id'> = {
        title: formData.title,
        start: eventDateTime.toISOString(),
        end: eventDateTime.toISOString(),
        type: formData.type,
        animalId: mockAnimals.find(a => a.name === formData.animalName)?.id || 'unknown',
        animalName: formData.animalName,
        description: formData.description,
        notificationEnabled: formData.notificationEnabled
      };

      if (editingEvent) {
        // Update existing event
        await dispatch(updateCalendarEvent({ ...eventData, id: editingEvent.id }) as any);
        toast.success('Event updated successfully!');
      } else {
        // Add new event
        await dispatch(addCalendarEvent(eventData) as any);
        toast.success('Event added successfully!');
      }

      setShowAddEvent(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      animalName: event.animalName,
      type: event.type,
      date: moment(new Date(event.start)).format('YYYY-MM-DD'),
      time: moment(new Date(event.start)).format('HH:mm'),
      description: event.description || '',
      notificationEnabled: event.notificationEnabled || false
    });
    setShowAddEvent(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await dispatch(deleteCalendarEvent(eventId) as any);
      toast.success('Event deleted successfully!');
      dispatch(breedingSlice.actions.setSelectedEvent(null));
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    dispatch(breedingSlice.actions.updateFilters({ [filterType]: value }));
  };

  const clearAllFilters = () => {
    dispatch(breedingSlice.actions.clearFilters());
  };

  // Apply filters to events
  const filteredEvents = useMemo(() => {
    let filtered = calendarEvents || [];

    // Filter by event type
    if (filters.eventType && filters.eventType !== 'all') {
      filtered = filtered.filter((event: CalendarEvent) => event.type === filters.eventType);
    }

    // Filter by animal
    if (filters.animalId && filters.animalId !== 'all') {
      filtered = filtered.filter((event: CalendarEvent) => event.animalId === filters.animalId);
    }

    // Filter by date range
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter((event: CalendarEvent) => {
        const eventDate = new Date(event.start);
        const startDate = new Date(filters.dateRange.start!);
        const endDate = new Date(filters.dateRange.end!);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    // Transform events to have Date objects for the calendar component
    return filtered.map((event: CalendarEvent) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
  }, [calendarEvents, filters]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
      breeding: { backgroundColor: '#22c55e', border: 'none' },
      vaccination: { backgroundColor: '#eab308', border: 'none' },
      checkup: { backgroundColor: '#3b82f6', border: 'none' },
      delivery: { backgroundColor: '#ef4444', border: 'none' }
    };

    return {
      style: colors[event.type]
    };
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return filteredEvents
      .filter((event: CalendarEvent) => {
        const eventDate = new Date(event.start);
        return eventDate >= now && eventDate <= nextWeek;
      })
      .sort((a: CalendarEvent, b: CalendarEvent) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [filteredEvents]);

  const todaysEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return filteredEvents.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link href="/breeding">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Breeding Calendar</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="icon"
                className="relative"
                onClick={() => {
                  // Show recent notifications in a toast
                  const recentNotifications = notifications
                    .filter(n => !n.read)
                    .slice(0, 3)
                    .map(n => `• ${n.title}: ${n.message}`)
                    .join('\n');
                  
                  if (recentNotifications) {
                    toast.info(`Recent Reminders:\n${recentNotifications}`);
                    
                    // Mark displayed notifications as read
                    notifications.filter(n => !n.read).slice(0, 3).forEach(n => {
                      markAsRead(n.id);
                    });
                  }
                }}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Input 
                      id="event-title" 
                      placeholder="Enter event title"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="animal-select">Select Animal *</Label>
                    <Select
                      value={formData.animalName}
                      onValueChange={(value) => handleFormChange('animalName', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose animal" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockAnimals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.name}>
                            {animal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => handleFormChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breeding">🐄 Breeding</SelectItem>
                        <SelectItem value="vaccination">💉 Vaccination</SelectItem>
                        <SelectItem value="checkup">🏥 Health Checkup</SelectItem>
                        <SelectItem value="delivery">🍼 Expected Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Date *</Label>
                      <Input 
                        id="event-date" 
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Time</Label>
                      <Input 
                        id="event-time" 
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleFormChange('time', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea 
                      id="event-description" 
                      placeholder="Add notes or description (optional)"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notification"
                      checked={formData.notificationEnabled}
                      onCheckedChange={(checked) => handleFormChange('notificationEnabled', checked)}
                    />
                    <Label htmlFor="notification" className="text-sm">
                      Enable reminder notifications
                    </Label>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      className="flex-1"
                      onClick={handleSaveEvent}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Save Event')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowAddEvent(false);
                        setEditingEvent(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Filter Controls */}
        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Events
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    value={filters.eventType}
                    onValueChange={(value) => handleFilterChange('eventType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="breeding">🐄 Breeding</SelectItem>
                      <SelectItem value="vaccination">💉 Vaccination</SelectItem>
                      <SelectItem value="checkup">🏥 Health Checkup</SelectItem>
                      <SelectItem value="delivery">🍼 Expected Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Animal</Label>
                  <Select
                    value={filters.animalId}
                    onValueChange={(value) => handleFilterChange('animalId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All animals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Animals</SelectItem>
                      {mockAnimals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Quick Filters</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(today.getDate() + 7);
                        handleFilterChange('dateRange', { start: today.toISOString(), end: nextWeek.toISOString() });
                      }}
                    >
                      Next 7 Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const nextMonth = new Date();
                        nextMonth.setMonth(today.getMonth() + 1);
                        handleFilterChange('dateRange', { start: today.toISOString(), end: nextMonth.toISOString() });
                      }}
                    >
                      Next Month
                    </Button>
                  </div>
                </div>
              </div>
              
              {(filters.eventType !== 'all' || filters.animalId !== 'all' || filters.dateRange.start) && (
                <div className="flex items-center gap-2 mt-4 p-2 bg-muted rounded-md">
                  <span className="text-sm font-medium">Active filters:</span>
                  {filters.eventType !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {filters.eventType}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange('eventType', 'all')}
                      />
                    </Badge>
                  )}
                  {filters.animalId !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Animal: {mockAnimals.find(a => a.id === filters.animalId)?.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange('animalId', 'all')}
                      />
                    </Badge>
                  )}
                  {filters.dateRange.start && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Date Range
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange('dateRange', { start: null, end: null })}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Today's Events */}
        {todaysEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Today's Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <Badge variant={
                      event.type === 'delivery' ? 'destructive' : 
                      event.type === 'vaccination' ? 'secondary' : 
                      'default'
                    }>
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        <Card>
          <CardContent className="p-6">
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event) => {
                  dispatch(breedingSlice.actions.setSelectedEvent(event));
                }}
                onSelectSlot={(slotInfo) => {
                  setFormData(prev => ({
                    ...prev,
                    date: moment(slotInfo.start).format('YYYY-MM-DD'),
                    time: moment(slotInfo.start).format('HH:mm')
                  }));
                  setShowAddEvent(true);
                }}
                selectable
                popup
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                messages={{
                  next: 'Next',
                  previous: 'Previous',
                  today: 'Today',
                  month: 'Month',
                  week: 'Week',
                  day: 'Day',
                  agenda: 'Agenda',
                  noEventsInRange: 'No events in this range',
                  showMore: (total) => `+${total} more`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No upcoming events in the next 7 days
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === 'breeding' ? 'bg-green-500' :
                        event.type === 'vaccination' ? 'bg-yellow-500' :
                        event.type === 'checkup' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {moment(event.start).format('MMM DD, YYYY')} - {event.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {moment(event.start).fromNow()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog 
          open={!!selectedEvent} 
          onOpenChange={() => dispatch(breedingSlice.actions.setSelectedEvent(null))}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  selectedEvent.type === 'breeding' ? 'bg-green-500' :
                  selectedEvent.type === 'vaccination' ? 'bg-yellow-500' :
                  selectedEvent.type === 'checkup' ? 'bg-blue-500' :
                  'bg-red-500'
                }`} />
                {selectedEvent.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Animal</Label>
                  <p className="text-sm font-medium">{selectedEvent.animalName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {selectedEvent.type === 'breeding' ? '🐄' :
                       selectedEvent.type === 'vaccination' ? '💉' :
                       selectedEvent.type === 'checkup' ? '🏥' : '🍼'}
                      {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                  <p className="text-sm font-medium">{moment(selectedEvent.start).format('MMMM DD, YYYY')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                  <p className="text-sm font-medium">{moment(selectedEvent.start).format('hh:mm A')}</p>
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm bg-muted p-2 rounded-md">{selectedEvent.description}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Reminders</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedEvent.notificationEnabled ? 'default' : 'secondary'}>
                    {selectedEvent.notificationEnabled ? '🔔 Enabled' : '🔕 Disabled'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    handleEditEvent(selectedEvent);
                    dispatch(breedingSlice.actions.setSelectedEvent(null));
                  }}
                >
                  Edit Event
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this event?')) {
                      handleDeleteEvent(selectedEvent.id);
                    }
                  }}
                >
                  Delete Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BreedingCalendar;