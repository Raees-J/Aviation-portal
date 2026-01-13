'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BookingModal from './BookingModal';

// Mock Resources
const resources = [
    { id: 'zs-sfc', name: 'ZS-SFC (C172)', type: 'aircraft', maintenanceDue: 45 }, // Healthy
    { id: 'zs-ghk', name: 'ZS-GHK (PA28)', type: 'aircraft', maintenanceDue: 4 },  // Critical
    { id: 'zs-abc', name: 'ZS-ABC (C152)', type: 'aircraft', maintenanceDue: 89 },
    { id: 'inst-mav', name: 'M. Maverick', type: 'instructor' },
    { id: 'inst-goo', name: 'N. Goose', type: 'instructor' },
];

// Mock Bookings
const initialBookings = [
    { id: 1, resourceId: 'zs-sfc', startTime: '08:00', duration: 2, title: 'Training - Student A', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { id: 2, resourceId: 'zs-ghk', startTime: '10:00', duration: 1.5, title: 'Solo - Student B', color: 'bg-green-100 border-green-300 text-green-800' },
    { id: 3, resourceId: 'inst-mav', startTime: '08:00', duration: 2, title: 'Briefing', color: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
];

const Scheduler = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 06:00 to 19:00
    const [selectedSlot, setSelectedSlot] = useState<{resource: string, time: string} | null>(null);

    const handleSlotClick = (resourceId: string, hour: number) => {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const resource = resources.find(r => r.id === resourceId);
        
        // Find if this resource is critical (maintenance < 5hrs)
        // In real app, this logic goes deeper
        setSelectedSlot({
            resource: resource?.name || 'Unknown',
            time: timeString
        });
    };

    const getResourceMaintenanceStatus = (name: string) => {
        // Safe check for maintenance status based on name passed to modal
        const res = resources.find(r => r.name === name);
        return res?.type === 'aircraft' && (res.maintenanceDue || 0) < 5;
    }

    return (
        <div className="bg-white rounded-sms shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                    <h2 className="font-bold text-aviation-navy text-lg">Daily Schedule</h2>
                    <div className="flex items-center bg-white border border-slate-300 rounded-sms p-1">
                        <button className="p-1 hover:bg-slate-100 rounded-sms"><ChevronLeft size={16}/></button>
                        <span className="px-3 text-sm font-semibold text-slate-700">Today, 24 Oct</span>
                        <button className="p-1 hover:bg-slate-100 rounded-sms"><ChevronRight size={16}/></button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm"></span>
                        <span>Training</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></span>
                        <span>Solo</span>
                    </div>
                </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto relative">
                {/* Header Row (Times) */}
                <div className="flex sticky top-0 z-20 bg-slate-50 border-b border-slate-200 min-w-max">
                    <div className="w-48 shrink-0 p-3 border-r border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-wider bg-slate-100">
                        Resource
                    </div>
                    {hours.map(hour => (
                        <div key={hour} className="w-32 shrink-0 p-3 border-r border-slate-100 font-mono text-xs text-slate-500 text-center font-bold">
                            {hour}:00
                        </div>
                    ))}
                </div>

                {/* Resource Rows */}
                <div className="min-w-max">
                    {resources.map(resource => (
                        <div key={resource.id} className="flex border-b border-slate-100 group hover:bg-slate-50 transition-colors">
                            {/* Row Label */}
                            <div className="w-48 shrink-0 p-3 border-r border-slate-200 flex flex-col justify-center sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                                <span className="font-bold text-sm text-aviation-navy truncate">{resource.name}</span>
                                {resource.type === 'aircraft' && (
                                    <span className={`text-[10px] uppercase font-bold tracking-tight ${resource.maintenanceDue && resource.maintenanceDue < 5 ? 'text-amber-600' : 'text-slate-400'}`}>
                                        {resource.maintenanceDue}h rem.
                                    </span>
                                )}
                            </div>

                            {/* Time Slots */}
                            <div className="flex relative">
                                {hours.map(hour => (
                                    <div 
                                        key={hour} 
                                        className="w-32 h-20 border-r border-slate-100 relative cursor-pointer hover:bg-blue-50/50"
                                        onClick={() => handleSlotClick(resource.id, hour)}
                                    >
                                        {/* Grid line helper */}
                                        <div className="absolute inset-x-0 top-1/2 border-t border-slate-50 border-dashed"></div>
                                    </div>
                                ))}

                                {/* Render Bookings for this row */}
                                {initialBookings
                                    .filter(b => b.resourceId === resource.id)
                                    .map(booking => {
                                        // Calculate position: (StartHour - 6) * width
                                        const startHour = parseInt(booking.startTime.split(':')[0]);
                                        const startMinute = parseInt(booking.startTime.split(':')[1]) || 0;
                                        const offset = (startHour - 6) + (startMinute / 60);
                                        const left = offset * 128; // 128px is w-32
                                        const width = booking.duration * 128;

                                        return (
                                            <div 
                                                key={booking.id}
                                                className={`absolute top-1 bottom-1 rounded-sms border shadow-sm p-2 text-xs flex flex-col justify-center overflow-hidden hover:brightness-95 cursor-move z-10 ${booking.color}`}
                                                style={{ left: `${left}px`, width: `${width}px` }}
                                            >
                                                <span className="font-bold truncate">{booking.title}</span>
                                                <span className="opacity-75">{booking.startTime} ({booking.duration}h)</span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <BookingModal 
                isOpen={selectedSlot !== null} 
                onClose={() => setSelectedSlot(null)}
                resourceName={selectedSlot?.resource || null}
                timeSlot={selectedSlot?.time || null}
                isMaintenanceSoon={selectedSlot ? getResourceMaintenanceStatus(selectedSlot.resource) : false}
            />
        </div>
    );
};

export default Scheduler;
