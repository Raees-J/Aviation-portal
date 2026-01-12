'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, isToday } from 'date-fns';
import BookingModal from './BookingModal';
import ResourceRow, { Resource, Booking } from './ResourceRow';
import { calculateMaintenanceStatus, AircraftMaintenance } from '../../lib/maintenance';

// Real Stellenbosch Flying Club Fleet Data
const aircraftData: AircraftMaintenance[] = [
  { tailNumber: 'ZS-OHH', currentTachTime: 1455, next50hrDue: 1500, next100hrDue: 1550, annualDueDate: new Date('2026-06-15') },
  { tailNumber: 'ZS-OHI', currentTachTime: 2103, next50hrDue: 2107, next100hrDue: 2150, annualDueDate: new Date('2026-08-20') },
  { tailNumber: 'ZS-SLM', currentTachTime: 890, next50hrDue: 950, next100hrDue: 1000, annualDueDate: new Date('2026-04-10') },
  { tailNumber: 'ZS-SMS', currentTachTime: 750, next50hrDue: 800, next100hrDue: 850, annualDueDate: new Date('2026-07-22') },
  { tailNumber: 'ZS-KUI', currentTachTime: 620, next50hrDue: 650, next100hrDue: 700, annualDueDate: new Date('2026-05-30') },
];

// Build resources from aircraft data with correct models
const aircraftModels: Record<string, string> = {
  'ZS-OHH': 'C172 (N)',
  'ZS-OHI': 'C172 (N)',
  'ZS-SLM': 'C172 (P)',
  'ZS-SMS': 'C172 (R)',
  'ZS-KUI': 'C172RG Cutlass',
};

const resources: Resource[] = [
  ...aircraftData.map(ac => ({
    id: ac.tailNumber.toLowerCase().replace('-', ''),
    name: `${ac.tailNumber} ${aircraftModels[ac.tailNumber] || ''}`,
    type: 'aircraft' as const,
    maintenanceStatus: calculateMaintenanceStatus(ac),
  })),
  { id: 'inst-peter', name: 'Peter Erasmus', type: 'instructor' },
  { id: 'inst-jondre', name: 'Jondré Kallis', type: 'instructor' },
  { id: 'inst-tristan', name: 'Tristan Storkey', type: 'instructor' },
  { id: 'inst-jason', name: 'Jason Rossouw', type: 'instructor' },
  { id: 'inst-sarah', name: 'Sarah Smit', type: 'instructor' },
  { id: 'inst-christo', name: 'Christo Smit', type: 'instructor' },
  { id: 'inst-rhyno', name: 'Rhyno Louw', type: 'instructor' },
  { id: 'inst-bernard', name: 'Bernard Leicher', type: 'instructor' },
  { id: 'inst-emil', name: 'Emil Wissink', type: 'instructor' },
  { id: 'inst-alwyn', name: 'Alwyn Vorster', type: 'instructor' },
  { id: 'inst-alewyn', name: 'Alewyn Burger', type: 'instructor' },
  { id: 'inst-charles', name: 'Charles Peck', type: 'instructor' },
];

// Sample bookings by date (format: YYYY-MM-DD)
const getInitialBookings = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('aviationBookings');
    if (stored) return JSON.parse(stored);
  }
  
  return {
    '2026-01-10': {
      'zsohh': [
        { id: 1, startTime: '08:00', duration: 2, title: 'Training - P. Smith', type: 'Training' as const },
        { id: 2, startTime: '14:00', duration: 1.5, title: 'PPL Test - J. Doe', type: 'PPL Test' as const },
      ],
      'zsohi': [
        { id: 3, startTime: '10:00', duration: 1, title: 'Solo - M. Jones', type: 'Solo' as const },
      ],
      'zsslm': [
        { id: 4, startTime: '10:00', duration: 1, title: 'Solo - M. Jones', type: 'Solo' as const },
      ],
      'inst-peter': [
        { id: 5, startTime: '08:00', duration: 2, title: 'CPL Training', type: 'Training' as const },
      ],
      'inst-jondre': [
        { id: 6, startTime: '11:00', duration: 1.5, title: 'Intro Flight', type: 'Intro' as const },
      ],
    },
    '2026-01-11': {
      'zsohh': [
        { id: 7, startTime: '09:00', duration: 1.5, title: 'Navigation - K. Brown', type: 'Training' as const },
      ],
      'zsslm': [
        { id: 8, startTime: '13:00', duration: 2, title: 'Cross Country', type: 'Solo' as const },
      ],
    },
  };
};

// Mock data for dropdowns
export const mockPilots = [
  { id: 'p1', name: 'Peter Smith' },
  { id: 'p2', name: 'Mary Jones' },
  { id: 'p3', name: 'John Doe' },
  { id: 'p4', name: 'Emma Wilson' },
];

export const mockInstructors = [
  { id: 'inst-peter', name: 'Peter Erasmus (Chief CFI)' },
  { id: 'inst-jondre', name: 'Jondré Kallis' },
  { id: 'inst-tristan', name: 'Tristan Storkey' },
  { id: 'inst-jason', name: 'Jason Rossouw' },
  { id: 'inst-sarah', name: 'Sarah Smit' },
  { id: 'inst-christo', name: 'Christo Smit' },
  { id: 'inst-rhyno', name: 'Rhyno Louw' },
  { id: 'inst-bernard', name: 'Bernard Leicher' },
  { id: 'inst-emil', name: 'Emil Wissink' },
  { id: 'inst-alwyn', name: 'Alwyn Vorster' },
  { id: 'inst-alewyn', name: 'Alewyn Burger' },
  { id: 'inst-charles', name: 'Charles Peck' },
];

const Scheduler = () => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 7);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Record<string, Record<string, Booking[]>>>(getInitialBookings);
  const [selectedSlot, setSelectedSlot] = useState<{
    resourceId: string;
    resourceName: string;
    resourceType: 'aircraft' | 'instructor';
    hour: number;
    maintenanceWarning?: boolean;
  } | null>(null);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aviationBookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const handleSlotClick = (resourceId: string, hour: number) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    setSelectedSlot({
      resourceId,
      resourceName: resource.name,
      resourceType: resource.type,
      hour,
      maintenanceWarning: resource.maintenanceStatus?.isCritical || resource.maintenanceStatus?.isWarning,
    });
  };

  const handleBookingCreate = (bookingData: any) => {
    if (!selectedSlot) return;
    
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const pilotName = mockPilots.find(p => p.id === bookingData.pilotId)?.name || 'Unknown';
    
    const newBooking: Booking = {
      id: Date.now(),
      startTime: `${selectedSlot.hour.toString().padStart(2, '0')}:00`,
      duration: bookingData.duration,
      title: `${bookingData.bookingType} - ${pilotName}`,
      type: bookingData.bookingType,
    };

    setBookings(prev => {
      const updated = { ...prev };
      if (!updated[dateKey]) {
        updated[dateKey] = {};
      }
      if (!updated[dateKey][selectedSlot.resourceId]) {
        updated[dateKey][selectedSlot.resourceId] = [];
      }
      updated[dateKey][selectedSlot.resourceId] = [
        ...updated[dateKey][selectedSlot.resourceId],
        newBooking
      ];
      
      // If instructor selected, also add to instructor schedule
      if (bookingData.instructorId) {
        if (!updated[dateKey][bookingData.instructorId]) {
          updated[dateKey][bookingData.instructorId] = [];
        }
        updated[dateKey][bookingData.instructorId] = [
          ...updated[dateKey][bookingData.instructorId],
          { ...newBooking, title: bookingData.bookingType + ' w/ ' + pilotName }
        ];
      }
      
      return updated;
    });
    
    // Dispatch custom event to notify the page component
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bookingCreated', { detail: newBooking }));
    }
    
    setSelectedSlot(null);
  };

  const goToPreviousDay = () => setCurrentDate(prev => subDays(prev, 1));
  const goToNextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const currentBookings = bookings[dateKey] || {};

  return (
    <div className="bg-white rounded-sms shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-stelfly-navy text-lg">Daily Schedule</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-300 rounded-sms overflow-hidden">
              <button 
                onClick={goToPreviousDay}
                className="p-2 hover:bg-slate-100 border-r border-slate-300"
                title="Previous Day"
              >
                <ChevronLeft size={16}/>
              </button>
              <span className="px-4 text-sm font-semibold text-slate-700 min-w-[180px] text-center">
                {isToday(currentDate) ? 'Today, ' : ''}{format(currentDate, 'EEE, d MMM yyyy')}
              </span>
              <button 
                onClick={goToNextDay}
                className="p-2 hover:bg-slate-100 border-l border-slate-300"
                title="Next Day"
              >
                <ChevronRight size={16}/>
              </button>
            </div>
            {!isToday(currentDate) && (
              <button 
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-bold bg-stelfly-navy text-white rounded-sms hover:bg-stelfly-navy-light"
              >
                Today
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm"></span>
            <span>Training</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></span>
            <span>Solo</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded-sm"></span>
            <span>PPL Test</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="flex sticky top-0 z-30 bg-slate-50 border-b border-slate-200 min-w-max">
          <div className="w-48 shrink-0 p-3 border-r border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider bg-slate-100 sticky left-0 z-30">
            Resource
          </div>
          {hours.map(hour => (
            <div key={hour} className="w-32 shrink-0 p-3 border-r border-slate-100 font-mono text-xs text-slate-500 text-center font-bold">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        <div className="min-w-max">
          {resources.map(resource => (
            <ResourceRow
              key={resource.id}
              resource={resource}
              hours={hours}
              bookings={currentBookings[resource.id] || []}
              onSlotClick={handleSlotClick}
            />
          ))}
        </div>
      </div>

      <BookingModal 
        isOpen={selectedSlot !== null} 
        onClose={() => setSelectedSlot(null)}
        onConfirm={handleBookingCreate}
        resourceName={selectedSlot?.resourceName || null}
        resourceId={selectedSlot?.resourceId || null}
        resourceType={selectedSlot?.resourceType || null}
        timeSlot={selectedSlot ? `${selectedSlot.hour.toString().padStart(2, '0')}:00` : null}
        isMaintenanceWarning={selectedSlot?.maintenanceWarning || false}
        pilots={mockPilots}
        instructors={mockInstructors}
      />
    </div>
  );
};

export default Scheduler;
