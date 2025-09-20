'use client';

import React from 'react';
import { ArrowLeft, Calendar, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const BreedingPage: React.FC = () => {
  // Mock data for demonstration
  const upcomingEvents = [
    {
      id: '1',
      animal: 'Ganga',
      type: 'Due Date',
      date: '2024-12-15',
      daysLeft: 25,
      status: 'pregnant'
    },
    {
      id: '2',
      animal: 'Lakshmi', 
      type: 'Vaccination',
      date: '2024-11-30',
      daysLeft: 10,
      status: 'scheduled'
    }
  ];

  const breedingRecords = [
    {
      id: '1',
      animal: 'Ganga',
      matingDate: '2024-03-15',
      expectedDate: '2024-12-15',
      status: 'Confirmed Pregnancy',
      method: 'Natural'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Breeding</h1>
          </div>
          <Button size="icon" className="rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">1</div>
              <div className="text-xs text-muted-foreground">Pregnant</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{upcomingEvents.length}</div>
              <div className="text-xs text-muted-foreground">Upcoming</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground">0</div>
              <div className="text-xs text-muted-foreground">Born This Month</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
          
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Upcoming Events
                </h3>
                <p className="text-muted-foreground">
                  Schedule breeding or add vaccination reminders
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {event.animal} - {event.type}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={event.daysLeft <= 7 ? 'destructive' : 'secondary'}>
                        {event.daysLeft} days left
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Breeding Records */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Breeding</h2>
          
          {breedingRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{record.animal}</h3>
                    <p className="text-sm text-muted-foreground">
                      Mated: {new Date(record.matingDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(record.expectedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      {record.method}
                    </Badge>
                    <br />
                    <Badge variant="default">
                      {record.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="accessibility-button h-auto py-4">
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <div>Schedule Breeding</div>
            </div>
          </Button>
          <Button variant="outline" className="accessibility-button h-auto py-4">
            <div className="text-center">
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <div>Add Record</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BreedingPage;