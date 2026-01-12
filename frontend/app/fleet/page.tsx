'use client';

import { useState } from 'react';
import { Plane, Clock, Wrench, AlertTriangle, Calendar, MapPin, Filter, Plus } from 'lucide-react';

interface Aircraft {
  id: string;
  registration: string;
  type: string;
  imageUrl: string;
  status: 'active' | 'serviceable' | 'maintenance' | 'grounded';
  totalHours: number;
  totalFlights: number;
  defects: {
    critical: number;
    major: number;
    minor: number;
  };
  lastFlight: string;
  nextJourney: string;
  maintenanceSchedule: string;
  nextMaintenance: string;
  operator: string;
  assignedBase: string;
  aircraftAge: string;
}

const aircraft: Aircraft[] = [
  {
    id: 'zsohh',
    registration: 'ZS-OHH',
    type: '152 (G5N-08284)',
    imageUrl: '/aircraft/zsohh.jpg',
    status: 'maintenance',
    totalHours: 4420.42,
    totalFlights: 2387,
    defects: { critical: 0, major: 0, minor: 1 },
    lastFlight: '2025 Jan 29 - VERYON+8832',
    nextJourney: '2025-01-29T17:00:00',
    maintenanceSchedule: '4325 MP Rev-02',
    nextMaintenance: '2025-01-29T17:05:00',
    operator: 'Stellenbosch Flying Club',
    assignedBase: 'FASH',
    aircraftAge: '7 Years (Nov 2018)'
  },
  {
    id: 'zsohi',
    registration: 'ZS-OHI',
    type: '152 (G5N-DAP1)',
    imageUrl: '/aircraft/zsohi.jpg',
    status: 'serviceable',
    totalHours: 3446.44,
    totalFlights: 1840,
    defects: { critical: 0, major: 1, minor: 0 },
    lastFlight: '2025 Jan 29 - VERYON+8838',
    nextJourney: 'Next Journey',
    maintenanceSchedule: '4325 MP Rev-02',
    nextMaintenance: '2025-01-29T17:40:00',
    operator: 'Stellenbosch Flying Club',
    assignedBase: 'FASH',
    aircraftAge: '7 Years (Jul 2018)'
  },
  {
    id: 'zsslm',
    registration: 'ZS-SLM',
    type: '152 (G5N-06733)',
    imageUrl: '/aircraft/zsslm.jpg',
    status: 'serviceable',
    totalHours: 3429.98,
    totalFlights: 1738,
    defects: { critical: 0, major: 1, minor: 0 },
    lastFlight: '2025 Jan 29 - VERYON+5844',
    nextJourney: 'Next Journey',
    maintenanceSchedule: '4325 MP Rev-02',
    nextMaintenance: '2025-01-29T17:40:00',
    operator: 'Stellenbosch Flying Club',
    assignedBase: 'FASH',
    aircraftAge: '6 Years (Jun 2019)'
  },
  {
    id: 'zssms',
    registration: 'ZS-SMS',
    type: '172 (74HN6487)',
    imageUrl: '/aircraft/zssms.jpg',
    status: 'serviceable',
    totalHours: 4417.34,
    totalFlights: 1763,
    defects: { critical: 0, major: 0, minor: 0 },
    lastFlight: '2025 Jan 29 - VERYON+9820',
    nextJourney: 'Next Journey',
    maintenanceSchedule: '2342 Sep-R13',
    nextMaintenance: '2025-02-15T17:30:00',
    operator: 'Stellenbosch Flying Club',
    assignedBase: 'FASH',
    aircraftAge: '12 Years (Jan 2013)'
  },
  {
    id: 'zskui',
    registration: 'ZS-KUI',
    type: '152 (G5N-1472)',
    imageUrl: '/aircraft/zskui.jpg',
    status: 'serviceable',
    totalHours: 2933.19,
    totalFlights: 1703,
    defects: { critical: 0, major: 0, minor: 0 },
    lastFlight: '2025 Jan 29 - VERYON+9910',
    nextJourney: 'Next Journey',
    maintenanceSchedule: '2342 Sep-R13',
    nextMaintenance: '2025-02-02T17:00:00',
    operator: 'Stellenbosch Flying Club',
    assignedBase: 'FASH',
    aircraftAge: '8 Years (Feb 2008)'
  }
];

const statusColors = {
  active: 'bg-blue-500',
  serviceable: 'bg-green-500',
  maintenance: 'bg-red-500',
  grounded: 'bg-gray-500'
};

const statusText = {
  active: 'ACTIVE',
  serviceable: 'SERVICEABLE',
  maintenance: 'UNDER MAINTENANCE',
  grounded: 'GROUNDED'
};

export default function FleetPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAircraft = filterStatus === 'all' 
    ? aircraft 
    : aircraft.filter(a => a.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-stelfly-navy">Aircraft</h1>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-stelfly-navy text-white rounded hover:bg-opacity-90 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Bulk Filter
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  X Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aircraft List */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {filteredAircraft.map((ac) => {
            return (
              <div key={ac.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center p-6 gap-6">
                  {/* Aircraft Image */}
                  <div className="flex-shrink-0 w-32 h-24 relative">
                    <div className="w-full h-full bg-gradient-to-br from-stelfly-navy to-blue-600 rounded flex items-center justify-center">
                      <Plane className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${ac.status === 'active' || ac.status === 'serviceable' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {ac.status === 'active' || ac.status === 'serviceable' ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  </div>

                  {/* Aircraft Info */}
                  <div className="flex-1 grid grid-cols-4 gap-6">
                    {/* Column 1: Registration & Status */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xl font-bold text-gray-900">{ac.registration}</div>
                        <div className="text-sm text-gray-500">➜ {ac.type}</div>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded ${statusColors[ac.status]}`}>
                          {statusText[ac.status]}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Flight Hours & Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs uppercase">Total Flying Hours</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {ac.totalHours.toFixed(2)} FH
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-600">
                          <span className="font-semibold">TOTAL FLIGHTS</span>
                          <div className="text-gray-900">{ac.totalFlights} FC</div>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-semibold">LAST JOURNEY</span>
                          <div className="text-xs text-gray-900">{ac.lastFlight}</div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Defects & Maintenance */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Wrench className="w-4 h-4" />
                        <span className="text-xs uppercase">Defects</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span className="text-sm text-gray-900">{ac.defects.critical}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                          <span className="text-sm text-gray-900">{ac.defects.major}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          <span className="text-sm text-gray-900">{ac.defects.minor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-600">
                          <span className="font-semibold">MAINTENANCE SCHEDULE</span>
                          <div className="text-xs text-gray-900">{ac.maintenanceSchedule}</div>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-semibold">NEXT JOURNEY</span>
                          <div className="text-xs text-gray-900">{ac.nextMaintenance}</div>
                        </div>
                      </div>
                    </div>

                    {/* Column 4: Operator Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs uppercase">Operator</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{ac.operator}</div>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-600">
                          <span className="font-semibold">ASSIGNED BASE</span>
                          <div className="text-gray-900">{ac.assignedBase}</div>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-semibold">AIRCRAFT AGE</span>
                          <div className="text-gray-900">{ac.aircraftAge}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expand Arrow */}
                  <div className="flex-shrink-0">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
