import React from 'react';
import { MaintenanceStatus, getMaintenanceHighlightClass, formatHoursRemaining } from '../../lib/maintenance';

export interface Booking {
  id: string | number;
  startTime: string;
  duration: number;
  title: string;
  type: 'Training' | 'Solo' | 'PPL Test' | 'Intro' | 'Other';
  pilotName?: string;
  instructorName?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'aircraft' | 'instructor';
  maintenanceStatus?: MaintenanceStatus;
}

interface ResourceRowProps {
  resource: Resource;
  hours: number[]; // Array of hour values (e.g., [7, 8, 9, ...])
  bookings: Booking[];
  onSlotClick: (resourceId: string, hour: number) => void;
}

const BOOKING_COLORS: Record<Booking['type'], string> = {
  'Training': 'bg-blue-100 border-blue-300 text-blue-800',
  'Solo': 'bg-green-100 border-green-300 text-green-800',
  'PPL Test': 'bg-purple-100 border-purple-300 text-purple-800',
  'Intro': 'bg-pink-100 border-pink-300 text-pink-800',
  'Other': 'bg-gray-100 border-gray-300 text-gray-800',
};

const ResourceRow: React.FC<ResourceRowProps> = ({ resource, hours, bookings, onSlotClick }) => {
  const maintenanceClass = resource.maintenanceStatus 
    ? getMaintenanceHighlightClass(resource.maintenanceStatus) 
    : '';
  
  const isCritical = resource.maintenanceStatus?.isCritical || resource.maintenanceStatus?.isGrounded;

  return (
    <div className={`flex border-b border-slate-100 group hover:bg-slate-50 transition-colors ${maintenanceClass}`}>
      {/* Row Label - Sticky Column */}
      <div className="w-48 shrink-0 p-3 border-r border-slate-200 flex flex-col justify-center sticky left-0 bg-white group-hover:bg-slate-50 z-20">
        <span className="font-bold text-sm text-stelfly-navy truncate">{resource.name}</span>
        {resource.type === 'aircraft' && resource.maintenanceStatus && (
          <span className={`text-[10px] uppercase font-bold tracking-tight ${
            isCritical ? 'text-red-600' : 
            resource.maintenanceStatus.isWarning ? 'text-amber-600' : 'text-slate-400'
          }`}>
            MPI in {formatHoursRemaining(resource.maintenanceStatus.hoursRemaining)}
          </span>
        )}
        {resource.type === 'instructor' && (
          <span className="text-[10px] uppercase font-bold tracking-tight text-slate-400">
            Instructor
          </span>
        )}
      </div>

      {/* Time Slots */}
      <div className="flex relative overflow-visible">
        {hours.map(hour => (
          <div 
            key={hour} 
            className="w-32 h-20 border-r border-slate-100 relative cursor-pointer hover:bg-blue-50/50"
            onClick={() => onSlotClick(resource.id, hour)}
          >
            {/* Grid line helper */}
            <div className="absolute inset-x-0 top-1/2 border-t border-slate-50 border-dashed"></div>
          </div>
        ))}

        {/* Render Bookings for this row */}
        {bookings.map(booking => {
          // Calculate position: (StartHour - firstHour) * width
          const startHour = parseInt(booking.startTime.split(':')[0]);
          const startMinute = parseInt(booking.startTime.split(':')[1]) || 0;
          const offset = (startHour - hours[0]) + (startMinute / 60);
          const left = offset * 128; // 128px is w-32
          const width = booking.duration * 128;
          
          // Get booking color with fallback
          const bookingColor = BOOKING_COLORS[booking.type] || BOOKING_COLORS['Other'];
          const bookingColorBase = bookingColor.split(' ')[0];

          return (
            <div 
              key={`${resource.id}-${booking.id}`}
              className={`absolute top-1 bottom-1 rounded-sms border shadow-sm p-2 text-xs flex flex-col justify-center cursor-pointer z-10 group/booking ${bookingColor}`}
              style={{ left: `${left}px`, width: `${width}px` }}
            >
              <span className="font-bold truncate">{booking.title}</span>
              <span className="opacity-75">{booking.startTime} ({booking.duration}h)</span>
              
              {/* Hover Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 invisible group-hover/booking:opacity-100 group-hover/booking:visible transition-all duration-200 z-[100]">
                <div className="bg-slate-900 text-white p-4 rounded-lg shadow-2xl min-w-[280px] text-sm border border-slate-700">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                    <div className={`w-3 h-3 rounded ${bookingColorBase}`}></div>
                    <span className="font-bold text-base">{booking.type}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wide">Time</span>
                      <p className="font-semibold">{booking.startTime} - {
                        (() => {
                          const endHour = startHour + booking.duration;
                          return `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                        })()
                      }</p>
                    </div>
                    
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wide">Duration</span>
                      <p className="font-semibold">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                    </div>
                    
                    {booking.pilotName && (
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wide">Pilot</span>
                        <p className="font-semibold">{booking.pilotName}</p>
                      </div>
                    )}
                    
                    {booking.instructorName && (
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wide">Instructor</span>
                        <p className="font-semibold">{booking.instructorName}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wide">Booking ID</span>
                      <p className="font-mono text-xs text-slate-300">{booking.id}</p>
                    </div>
                  </div>
                  
                  {/* Tooltip arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceRow;
