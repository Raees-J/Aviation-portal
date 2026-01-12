/**
 * Maintenance utilities for tracking aircraft MPI (Maintenance Plan Inspection)
 * Handles 50hr, 100hr, and Annual inspections
 */

export interface MaintenanceStatus {
  hoursRemaining: number;
  inspectionType: '50hr' | '100hr' | 'Annual';
  isWarning: boolean;      // < 10 hours remaining
  isCritical: boolean;     // < 5 hours remaining
  isGrounded: boolean;     // 0 or negative hours
}

export interface AircraftMaintenance {
  tailNumber: string;
  currentTachTime: number;
  next50hrDue: number;
  next100hrDue: number;
  annualDueDate: Date;
}

/**
 * Warning threshold in hours - aircraft flagged when below this
 */
export const MPI_WARNING_THRESHOLD = 10;

/**
 * Critical threshold in hours - restricts long cross-country flights
 */
export const MPI_CRITICAL_THRESHOLD = 5;

/**
 * Calculates maintenance status for an aircraft
 */
export function calculateMaintenanceStatus(aircraft: AircraftMaintenance): MaintenanceStatus {
  const hoursTo50 = aircraft.next50hrDue - aircraft.currentTachTime;
  const hoursTo100 = aircraft.next100hrDue - aircraft.currentTachTime;
  
  // Find the next upcoming inspection
  const hoursRemaining = Math.min(hoursTo50, hoursTo100);
  const inspectionType = hoursTo50 < hoursTo100 ? '50hr' : '100hr';
  
  return {
    hoursRemaining: Math.max(0, hoursRemaining),
    inspectionType,
    isWarning: hoursRemaining <= MPI_WARNING_THRESHOLD && hoursRemaining > MPI_CRITICAL_THRESHOLD,
    isCritical: hoursRemaining <= MPI_CRITICAL_THRESHOLD && hoursRemaining > 0,
    isGrounded: hoursRemaining <= 0
  };
}

/**
 * Checks if a booking duration would exceed maintenance limits
 */
export function canBookDuration(
  aircraft: AircraftMaintenance, 
  requestedHours: number
): { allowed: boolean; reason?: string } {
  const status = calculateMaintenanceStatus(aircraft);
  
  if (status.isGrounded) {
    return { 
      allowed: false, 
      reason: `${aircraft.tailNumber} is grounded - ${status.inspectionType} inspection overdue` 
    };
  }
  
  if (requestedHours > status.hoursRemaining) {
    return { 
      allowed: false, 
      reason: `Booking exceeds available hours. Only ${status.hoursRemaining.toFixed(1)}h until ${status.inspectionType} inspection.` 
    };
  }
  
  return { allowed: true };
}

/**
 * Returns CSS class for maintenance status highlighting
 */
export function getMaintenanceHighlightClass(status: MaintenanceStatus): string {
  if (status.isGrounded) return 'bg-red-100 border-red-500 text-red-800';
  if (status.isCritical) return 'bg-stelfly-gold/20 border-stelfly-gold text-amber-800';
  if (status.isWarning) return 'bg-amber-50 border-amber-300 text-amber-700';
  return '';
}

/**
 * Formats hours remaining for display
 */
export function formatHoursRemaining(hours: number): string {
  if (hours <= 0) return 'OVERDUE';
  if (hours < 1) return `${Math.round(hours * 60)}min`;
  return `${hours.toFixed(1)}h`;
}
