'use client';
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Scheduler from '../components/Calendar/Scheduler';
import AircraftStatusCard from '../components/AircraftStatusCard';
import { Calendar, Clock, User } from 'lucide-react';

export default function Home() {
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [showBookingNotification, setShowBookingNotification] = useState(false);

  useEffect(() => {
    // Helper function to load bookings from localStorage
    const loadRecentBookings = () => {
      const stored = localStorage.getItem('aviationBookings');
      if (stored) {
        const allBookings = JSON.parse(stored);
        const recent: any[] = [];
        
        // Get all bookings from all dates
        Object.entries(allBookings).forEach(([date, resources]: [string, any]) => {
          Object.entries(resources).forEach(([resourceId, bookings]: [string, any]) => {
            bookings.forEach((booking: any) => {
              recent.push({ ...booking, date, resourceId });
            });
          });
        });
        
        // Sort by date and time, get last 5
        recent.sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.startTime.localeCompare(a.startTime);
        });
        
        setRecentBookings(recent.slice(0, 5));
      }
    };

    // Load initial bookings
    if (typeof window !== 'undefined') {
      loadRecentBookings();
    }

    // Listen for custom booking created event (same-page updates)
    const handleBookingCreated = () => {
      setShowBookingNotification(true);
      loadRecentBookings();
      setTimeout(() => setShowBookingNotification(false), 2500);
    };

    // Listen for storage changes (cross-tab updates)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'aviationBookings') {
        setShowBookingNotification(true);
        loadRecentBookings();
        setTimeout(() => setShowBookingNotification(false), 2500);
      }
    };

    window.addEventListener('bookingCreated', handleBookingCreated as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
  
  // Stellenbosch Flying Club Fleet
  const fleet = [
      { id: 'zs-ohh', tail: 'ZS-OHH', model: 'Cessna 172 (N)', hours: 45, status: 'Airworthy' as const },
      { id: 'zs-ohi', tail: 'ZS-OHI', model: 'Cessna 172 (N)', hours: 4, status: 'Airworthy' as const },
      { id: 'zs-slm', tail: 'ZS-SLM', model: 'Cessna 172 (P)', hours: 60, status: 'Airworthy' as const },
      { id: 'zs-sms', tail: 'ZS-SMS', model: 'Cessna 172 (R)', hours: 55, status: 'Airworthy' as const },
      { id: 'zs-kui', tail: 'ZS-KUI', model: 'C172RG Cutlass', hours: 30, status: 'Airworthy' as const },
  ];

  const todayBookings = recentBookings.filter(b => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return b.date === today;
  }).length;

  return (
    <div className="space-y-6">
      {/* Booking Notification */}
      {showBookingNotification && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-sms shadow-lg animate-fade-in">
          Booking created successfully!
        </div>
      )}
        {/* Top Stats Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-stelfly-navy text-white rounded-sms shadow-lg">
                <h3 className="text-sm opacity-80 uppercase tracking-widest font-semibold">QNH</h3>
                <p className="text-3xl font-bold mt-1">1013</p>
            </div>
             <div className="p-4 bg-white text-stelfly-navy border border-slate-200 rounded-sms shadow-sm">
                <h3 className="text-sm opacity-60 uppercase tracking-widest font-semibold">Density Alt</h3>
                <p className="text-3xl font-bold mt-1">1,200ft</p>
            </div>
             <div className="p-4 bg-white text-stelfly-navy border border-slate-200 rounded-sms shadow-sm">
                <h3 className="text-sm opacity-60 uppercase tracking-widest font-semibold">Today's Bookings</h3>
                <p className="text-3xl font-bold mt-1">{todayBookings}</p>
            </div>
             <div className="p-4 bg-stelfly-gold text-white rounded-sms shadow-lg">
                <h3 className="text-sm opacity-90 uppercase tracking-widest font-semibold">Active Aircraft</h3>
                <p className="text-3xl font-bold mt-1">5</p>
            </div>
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="bg-white p-6 rounded-sms border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-stelfly-navy mb-4">Recent Bookings</h2>
            <div className="space-y-3">
              {recentBookings.map((booking) => {
                const aircraftName = booking.aircraft || 'Unknown Aircraft';
                const instructorName = booking.instructor && booking.instructor !== 'TBD' ? booking.instructor : null;
                const pilotName = booking.pilot || 'Unknown Pilot';
                
                return (
                <div key={`${booking.date}-${booking.id}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-sms hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${
                      booking.type === 'Training' || booking.bookingType === 'Training' ? 'bg-blue-500' :
                      booking.type === 'Solo' || booking.bookingType === 'Solo' ? 'bg-green-500' :
                      booking.type === 'PPL Test' || booking.bookingType === 'PPL Test' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-stelfly-navy">{booking.title}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(booking.date), 'MMM d')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {booking.startTime} ({booking.duration}h)
                        </span>
                        {instructorName && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {instructorName}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {aircraftName}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">{booking.bookingType || booking.type}</span>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Fleet Status */}
        <div>
            <h2 className="text-lg font-bold text-stelfly-navy mb-3">Fleet Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fleet.map(aircraft => (
                    <AircraftStatusCard 
                        key={aircraft.id} 
                        tailNumber={aircraft.tail} 
                        model={aircraft.model}
                        nextServiceHours={aircraft.hours}
                        status={aircraft.status}
                    />
                ))}
            </div>
        </div>

        {/* Main Scheduler */}
        <div>
           <Scheduler /> 
        </div>
    </div>
  );
}
