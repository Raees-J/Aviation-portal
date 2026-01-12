import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    resourceName: string | null;
    timeSlot: string | null;
    isMaintenanceSoon?: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, resourceName, timeSlot, isMaintenanceSoon }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-sms shadow-xl border-t-4 border-aviation-navy overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-aviation-navy">New Booking</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Context Info */}
                    <div className="flex gap-4 text-sm bg-slate-50 p-3 rounded-sms border border-slate-200">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-aviation-gold" />
                            <span className="font-medium text-slate-700">{timeSlot || '--:--'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-aviation-gold" />
                            <span className="font-medium text-slate-700">{resourceName || 'Global'}</span>
                        </div>
                    </div>

                    {/* Maintenance Warning */}
                    {isMaintenanceSoon && (
                        <div className="bg-amber-50 border-l-4 border-aviation-gold p-3 rounded-r-sms flex items-start gap-3">
                            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-sm font-bold text-amber-800">Maintenance Warning</h4>
                                <p className="text-xs text-amber-700 mt-1">This aircraft is within 5 hours of a mandatory 100hr inspection. Long cross-country flights are restricted.</p>
                            </div>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Student / Renter</label>
                            <input type="text" className="w-full border border-slate-300 rounded-sms px-3 py-2 text-sm focus:outline-none focus:border-aviation-navy focus:ring-1 focus:ring-aviation-navy" placeholder="Search name..." />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Duration</label>
                            <select className="w-full border border-slate-300 rounded-sms px-3 py-2 text-sm focus:outline-none focus:border-aviation-navy">
                                <option>1.0 Hour</option>
                                <option>1.5 Hours</option>
                                <option>2.0 Hours</option>
                                <option>3.0 Hours</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Mission Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button className="border border-aviation-navy bg-aviation-navy text-white py-2 text-xs font-bold rounded-sms">Dual Training</button>
                                <button className="border border-slate-300 text-slate-600 py-2 text-xs font-bold rounded-sms hover:bg-slate-50">Solo Hiring</button>
                                <button className="border border-slate-300 text-slate-600 py-2 text-xs font-bold rounded-sms hover:bg-slate-50">Intro Flight</button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="instructor" className="mr-2" />
                            <label htmlFor="instructor" className="text-sm text-slate-700">Instructor Required</label>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800">Cancel</button>
                    <button className="px-6 py-2 text-sm font-bold bg-aviation-navy text-white rounded-sms shadow-md hover:bg-aviation-navy-light transition-all">Confirm Booking</button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
