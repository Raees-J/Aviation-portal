'use client';
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, User, Users, Plane } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BookingFormData) => void;
  resourceName: string | null;
  resourceId: string | null;
  resourceType: 'aircraft' | 'instructor' | null;
  timeSlot: string | null;
  isMaintenanceWarning?: boolean;
  pilots: { id: string; name: string }[];
  instructors: { id: string; name: string }[];
}

interface BookingFormData {
  pilotId: string;
  instructorId: string;
  bookingType: 'Training' | 'Solo' | 'PPL Test';
  duration: number;
  notes: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  resourceName,
  resourceId,
  resourceType, 
  timeSlot, 
  isMaintenanceWarning,
  pilots,
  instructors 
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    pilotId: '',
    instructorId: '',
    bookingType: 'Training',
    duration: 1,
    notes: '',
  });

  // Auto-fill instructor when modal opens with an instructor resource
  useEffect(() => {
    if (isOpen && resourceType === 'instructor' && resourceId) {
      setFormData(prev => ({
        ...prev,
        instructorId: resourceId
      }));
    } else if (isOpen) {
      // Reset form when opening with aircraft
      setFormData({
        pilotId: '',
        instructorId: '',
        bookingType: 'Training',
        duration: 1,
        notes: '',
      });
    }
  }, [isOpen, resourceType, resourceId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-sms shadow-xl border-t-4 border-stelfly-navy overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-stelfly-navy">Create Booking</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Context Info */}
          <div className="flex gap-4 text-sm bg-slate-50 p-3 rounded-sms border border-slate-200">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-stelfly-gold" />
              <span className="font-medium text-slate-700">{timeSlot || '--:--'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane size={16} className="text-stelfly-gold" />
              <span className="font-medium text-slate-700">{resourceName || 'Select Resource'}</span>
            </div>
          </div>

          {/* Maintenance Warning */}
          {isMaintenanceWarning && (
            <div className="bg-amber-50 border-l-4 border-stelfly-gold p-3 rounded-r-sms flex items-start gap-3">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-amber-800">MPI Warning</h4>
                <p className="text-xs text-amber-700 mt-1">
                  This aircraft is approaching its Maintenance Plan Inspection. 
                  Long cross-country flights are restricted.
                </p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Booking Type Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Booking Type
              </label>
              <select 
                className="w-full border border-slate-300 rounded-sms px-3 py-2 text-sm focus:outline-none focus:border-stelfly-navy focus:ring-1 focus:ring-stelfly-navy"
                value={formData.bookingType}
                onChange={(e) => setFormData({ ...formData, bookingType: e.target.value as any })}
              >
                <option value="Training">Training (Dual)</option>
                <option value="Solo">Solo Hiring</option>
                <option value="PPL Test">PPL Test</option>
              </select>
            </div>

            {/* Pilot Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                <User size={12} className="inline mr-1" />
                Pilot / Student
              </label>
              <select 
                className="w-full border border-slate-300 rounded-sms px-3 py-2 text-sm focus:outline-none focus:border-stelfly-navy focus:ring-1 focus:ring-stelfly-navy"
                value={formData.pilotId}
                onChange={(e) => setFormData({ ...formData, pilotId: e.target.value })}
                required
              >
                <option value="">Select Pilot...</option>
                {pilots.map(pilot => (
                  <option key={pilot.id} value={pilot.id}>{pilot.name}</option>
                ))}
              </select>
            </div>

            {/* Instructor Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                <Users size={12} className="inline mr-1" />
                Instructor
              </label>
              <select 
                className="w-full border border-slate-300 rounded-sms px-3 py-2 text-sm focus:outline-none focus:border-stelfly-navy focus:ring-1 focus:ring-stelfly-navy"
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                disabled={formData.bookingType === 'Solo'}
              >
                <option value="">
                  {formData.bookingType === 'Solo' ? 'N/A (Solo Flight)' : 'Select Instructor...'}
                </option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Duration
              </label>
              <select 
                className="w-full border border-slate-300 rounded-sms px-3 py-2 text-sm focus:outline-none focus:border-stelfly-navy"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
              >
                <option value={1}>1.0 Hour</option>
                <option value={1.5}>1.5 Hours</option>
                <option value={2}>2.0 Hours</option>
                <option value={2.5}>2.5 Hours</option>
                <option value={3}>3.0 Hours</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Notes (Optional)
              </label>
              <textarea 
                className="w-full border border-slate-300 rounded-sms px-3 py-2 text-sm focus:outline-none focus:border-stelfly-navy resize-none"
                rows={2}
                placeholder="Navigation exercise, circuit work, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 text-sm font-bold bg-stelfly-navy text-white rounded-sms shadow-md hover:bg-stelfly-navy-light transition-all"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
