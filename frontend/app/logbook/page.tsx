'use client';

import { useState, useEffect } from 'react';
import { Plus, Plane, Calendar, Clock, MapPin, User, Trophy, TrendingUp, Wrench, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface LogbookEntry {
  id: number;
  date: string;
  aircraft: string;
  registration: string;
  type: string;
  departure: string;
  arrival: string;
  tachoStart: number;
  tachoEnd: number;
  hobbsStart: number;
  hobbsEnd: number;
  dualTime: number;
  picTime: number;
  soloTime: number;
  instructor: string;
  flightType: string;
  notes: string;
}

interface AircraftStatus {
  registration: string;
  type: string;
  currentTacho: number;
  currentHobbs: number;
  nextMPI: number;
  next50hr: number;
  next100hr: number;
  tboHours: number;
  radioExpiry: string;
  insuranceExpiry: string;
  massEmpty: number;
  armEmpty: number;
  compassExpiry: string;
  fireExtExpiry: string;
  firstAidExpiry: string;
}

const aircraftStatuses: AircraftStatus[] = [
  {
    registration: 'ZS-OHH',
    type: 'Cessna 172',
    currentTacho: 4420.42,
    currentHobbs: 4324.6,
    nextMPI: 4325,
    next50hr: 4450,
    next100hr: 4500,
    tboHours: 2000,
    radioExpiry: '2026-06-15',
    insuranceExpiry: '2026-12-31',
    massEmpty: 1534.18,
    armEmpty: 41.100,
    compassExpiry: '2026-03-20',
    fireExtExpiry: '2026-08-15',
    firstAidExpiry: '2026-05-10'
  },
  {
    registration: 'ZS-OHI',
    type: 'Cessna 172',
    currentTacho: 3446.44,
    currentHobbs: 1840,
    nextMPI: 3450,
    next50hr: 3500,
    next100hr: 3550,
    tboHours: 2000,
    radioExpiry: '2026-07-22',
    insuranceExpiry: '2026-12-31',
    massEmpty: 1519.26,
    armEmpty: 38.850,
    compassExpiry: '2026-04-15',
    fireExtExpiry: '2026-09-20',
    firstAidExpiry: '2026-06-05'
  },
  {
    registration: 'ZS-SLM',
    type: 'Cessna 172P',
    currentTacho: 3429.98,
    currentHobbs: 1738,
    nextMPI: 3475,
    next50hr: 3480,
    next100hr: 3530,
    tboHours: 2000,
    radioExpiry: '2026-05-30',
    insuranceExpiry: '2026-12-31',
    massEmpty: 1552.62,
    armEmpty: 40.100,
    compassExpiry: '2026-02-28',
    fireExtExpiry: '2026-07-10',
    firstAidExpiry: '2026-04-20'
  },
  {
    registration: 'ZS-SMS',
    type: 'Cessna 172R',
    currentTacho: 4417.34,
    currentHobbs: 1763,
    nextMPI: 4450,
    next50hr: 4467,
    next100hr: 4517,
    tboHours: 2000,
    radioExpiry: '2026-08-12',
    insuranceExpiry: '2026-12-31',
    massEmpty: 1685.05,
    armEmpty: 40.100,
    compassExpiry: '2026-06-18',
    fireExtExpiry: '2026-10-25',
    firstAidExpiry: '2026-07-30'
  },
  {
    registration: 'ZS-KUI',
    type: 'C172RG',
    currentTacho: 2933.19,
    currentHobbs: 1703,
    nextMPI: 2950,
    next50hr: 2983,
    next100hr: 3033,
    tboHours: 2000,
    radioExpiry: '2026-04-05',
    insuranceExpiry: '2026-12-31',
    massEmpty: 1700.56,
    armEmpty: 39.500,
    compassExpiry: '2026-01-30',
    fireExtExpiry: '2026-06-08',
    firstAidExpiry: '2026-03-15'
  }
];

const LICENSE_REQUIREMENTS = {
  PPL: { total: 45, solo: 10, dual: 25, crossCountry: 5 },
  CPL: { total: 200, solo: 100, dual: 20, crossCountry: 20 },
  ATPL: { total: 1500, pic: 500, crossCountry: 200 }
};

export default function LogbookPage() {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'flights' | 'aircraft'>('flights');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    aircraft: '',
    registration: '',
    type: '',
    departure: 'FASH',
    arrival: 'FASH',
    tachoStart: 0,
    tachoEnd: 0,
    hobbsStart: 0,
    hobbsEnd: 0,
    dualTime: 0,
    picTime: 0,
    soloTime: 0,
    instructor: '',
    flightType: 'Training',
    notes: ''
  });

  // Load entries from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aviationLogbook');
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && entries.length > 0) {
      localStorage.setItem('aviationLogbook', JSON.stringify(entries));
    }
  }, [entries]);

  const handleAircraftChange = (reg: string) => {
    const aircraft = aircraftStatuses.find(a => a.registration === reg);
    if (aircraft) {
      setFormData({
        ...formData,
        aircraft: reg,
        registration: aircraft.registration,
        type: aircraft.type,
        tachoStart: aircraft.currentTacho,
        hobbsStart: aircraft.currentHobbs
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const flightTime = formData.tachoEnd - formData.tachoStart;
    
    const newEntry: LogbookEntry = {
      id: Date.now(),
      date: formData.date,
      aircraft: formData.aircraft,
      registration: formData.registration,
      type: formData.type,
      departure: formData.departure,
      arrival: formData.arrival,
      tachoStart: Number(formData.tachoStart),
      tachoEnd: Number(formData.tachoEnd),
      hobbsStart: Number(formData.hobbsStart),
      hobbsEnd: Number(formData.hobbsEnd),
      dualTime: Number(formData.dualTime),
      picTime: Number(formData.picTime),
      soloTime: Number(formData.soloTime),
      instructor: formData.instructor,
      flightType: formData.flightType,
      notes: formData.notes
    };

    setEntries([newEntry, ...entries]);
    setShowForm(false);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      aircraft: '',
      registration: '',
      type: '',
      departure: 'FASH',
      arrival: 'FASH',
      tachoStart: 0,
      tachoEnd: 0,
      hobbsStart: 0,
      hobbsEnd: 0,
      dualTime: 0,
      picTime: 0,
      soloTime: 0,
      instructor: '',
      flightType: 'Training',
      notes: ''
    });
  };

  // Calculate totals
  const totalDual = entries.reduce((sum, e) => sum + e.dualTime, 0);
  const totalPIC = entries.reduce((sum, e) => sum + e.picTime, 0);
  const totalSolo = entries.reduce((sum, e) => sum + e.soloTime, 0);
  const totalHours = totalDual + totalPIC + totalSolo;

  // Calculate progress to PPL
  const pplProgress = {
    total: (totalHours / LICENSE_REQUIREMENTS.PPL.total) * 100,
    solo: (totalSolo / LICENSE_REQUIREMENTS.PPL.solo) * 100,
    dual: (totalDual / LICENSE_REQUIREMENTS.PPL.dual) * 100,
  };

  const hoursToGo = {
    ppl: Math.max(0, LICENSE_REQUIREMENTS.PPL.total - totalHours),
    cpl: Math.max(0, LICENSE_REQUIREMENTS.CPL.total - totalHours),
    atpl: Math.max(0, LICENSE_REQUIREMENTS.ATPL.total - totalHours),
  };

  const getDaysToGo = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    return days;
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'bg-red-500 text-white';
    if (days <= 30) return 'bg-red-100 text-red-800';
    if (days <= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stelfly-navy">Logbook & Aircraft Status</h1>
            <p className="text-gray-500 text-sm mt-1">Track flights and aircraft maintenance</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('flights')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  viewMode === 'flights' ? 'bg-stelfly-navy text-white' : 'text-gray-600'
                }`}
              >
                Flight Log
              </button>
              <button
                onClick={() => setViewMode('aircraft')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  viewMode === 'aircraft' ? 'bg-stelfly-navy text-white' : 'text-gray-600'
                }`}
              >
                Aircraft Status
              </button>
            </div>
            {viewMode === 'flights' && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-stelfly-navy text-white rounded-md hover:bg-opacity-90 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Flight
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dual Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalDual.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Plane className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Solo Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalSolo.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">PIC Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalPIC.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* License Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-stelfly-navy mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          License Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">PPL (Private Pilot)</span>
              <span className="text-gray-500">{totalHours.toFixed(1)} / {LICENSE_REQUIREMENTS.PPL.total}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(pplProgress.total, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {hoursToGo.ppl > 0 ? `${hoursToGo.ppl.toFixed(1)}h to go` : 'Requirements met!'}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">CPL (Commercial)</span>
              <span className="text-gray-500">{totalHours.toFixed(1)} / {LICENSE_REQUIREMENTS.CPL.total}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((totalHours / LICENSE_REQUIREMENTS.CPL.total) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {hoursToGo.cpl > 0 ? `${hoursToGo.cpl.toFixed(1)}h to go` : 'Requirements met!'}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">ATPL (Airline Transport)</span>
              <span className="text-gray-500">{totalHours.toFixed(1)} / {LICENSE_REQUIREMENTS.ATPL.total}h</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min((totalHours / LICENSE_REQUIREMENTS.ATPL.total) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {hoursToGo.atpl > 0 ? `${hoursToGo.atpl.toFixed(1)}h to go` : 'Requirements met!'}
            </p>
          </div>
        </div>
      </div>

      {/* Add Flight Form */}
      {showForm && viewMode === 'flights' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-stelfly-navy mb-4">New Flight Entry</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Aircraft Registration</label>
              <select
                value={formData.aircraft}
                onChange={(e) => handleAircraftChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                required
              >
                <option value="">Select Aircraft...</option>
                {aircraftStatuses.map(ac => (
                  <option key={ac.registration} value={ac.registration}>
                    {ac.registration} ({ac.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <input
                type="text"
                value={formData.type}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tacho Start</label>
              <input
                type="number"
                step="0.1"
                value={formData.tachoStart}
                onChange={(e) => setFormData({ ...formData, tachoStart: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tacho End</label>
              <input
                type="number"
                step="0.1"
                value={formData.tachoEnd}
                onChange={(e) => setFormData({ ...formData, tachoEnd: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbs Start</label>
              <input
                type="number"
                step="0.1"
                value={formData.hobbsStart}
                onChange={(e) => setFormData({ ...formData, hobbsStart: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hobbs End</label>
              <input
                type="number"
                step="0.1"
                value={formData.hobbsEnd}
                onChange={(e) => setFormData({ ...formData, hobbsEnd: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Departure</label>
              <input
                type="text"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                placeholder="FASH"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Arrival</label>
              <input
                type="text"
                value={formData.arrival}
                onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                placeholder="FASH"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dual Time (hours)</label>
              <input
                type="number"
                step="0.1"
                value={formData.dualTime}
                onChange={(e) => setFormData({ ...formData, dualTime: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Solo Time (hours)</label>
              <input
                type="number"
                step="0.1"
                value={formData.soloTime}
                onChange={(e) => setFormData({ ...formData, soloTime: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">PIC Time (hours)</label>
              <input
                type="number"
                step="0.1"
                value={formData.picTime}
                onChange={(e) => setFormData({ ...formData, picTime: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Type</label>
              <select
                value={formData.flightType}
                onChange={(e) => setFormData({ ...formData, flightType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
              >
                <option value="Training">Training</option>
                <option value="Solo">Solo</option>
                <option value="Cross Country">Cross Country</option>
                <option value="Navigation">Navigation</option>
                <option value="Circuits">Circuits</option>
                <option value="Check Ride">Check Ride</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instructor</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                placeholder="Peter Erasmus"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-stelfly-navy focus:border-transparent"
                rows={2}
                placeholder="Flight details, maneuvers practiced, etc."
              />
            </div>

            <div className="md:col-span-3 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-stelfly-navy text-white rounded-md hover:bg-opacity-90"
              >
                Add Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Aircraft Status Table */}
      {viewMode === 'aircraft' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stelfly-navy text-white">
                <tr>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-bold border-r border-white">General</th>
                  <th colSpan={2} className="px-3 py-2 text-center text-xs font-bold border-r border-white">Current</th>
                  <th colSpan={3} className="px-3 py-2 text-center text-xs font-bold border-r border-white">MPI</th>
                  <th colSpan={3} className="px-3 py-2 text-center text-xs font-bold border-r border-white">TBO & Radio/Insurance</th>
                  <th colSpan={3} className="px-3 py-2 text-center text-xs font-bold border-r border-white">Mass & Balance</th>
                  <th colSpan={3} className="px-3 py-2 text-center text-xs font-bold">Compass/Fire ext/First Aid</th>
                </tr>
                <tr className="bg-stelfly-navy/90">
                  <th className="px-2 py-2 text-left text-xs font-semibold">Reg</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold border-r border-white">Type</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">Tacho/Hobbs</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold border-r border-white">Days to go</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">50hr</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">100hr</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold border-r border-white">MPI hrs</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">TBO hrs</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">Radio</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold border-r border-white">Insurance</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">BE Mass</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">BE Arm</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold border-r border-white">BE Lit</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">Compass</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">Fire Ext</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold">First Aid</th>
                </tr>
              </thead>
              <tbody>
                {aircraftStatuses.map((aircraft) => {
                  const mpiHrs = aircraft.nextMPI - aircraft.currentTacho;
                  const next50hrs = aircraft.next50hr - aircraft.currentTacho;
                  const next100hrs = aircraft.next100hr - aircraft.currentTacho;
                  const radioDays = getDaysToGo(aircraft.radioExpiry);
                  const insuranceDays = getDaysToGo(aircraft.insuranceExpiry);
                  const compassDays = getDaysToGo(aircraft.compassExpiry);
                  const fireExtDays = getDaysToGo(aircraft.fireExtExpiry);
                  const firstAidDays = getDaysToGo(aircraft.firstAidExpiry);

                  return (
                    <tr key={aircraft.registration} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-2 py-3 font-bold text-stelfly-navy">{aircraft.registration}</td>
                      <td className="px-2 py-3 border-r border-gray-200">{aircraft.type}</td>
                      <td className="px-2 py-3 text-right font-mono">{aircraft.currentTacho.toFixed(1)}</td>
                      <td className="px-2 py-3 text-right border-r border-gray-200">-</td>
                      <td className={`px-2 py-3 text-right font-bold ${next50hrs <= 10 ? 'bg-yellow-100' : ''}`}>
                        {next50hrs.toFixed(0)}
                      </td>
                      <td className={`px-2 py-3 text-right font-bold ${next100hrs <= 10 ? 'bg-yellow-100' : ''}`}>
                        {next100hrs.toFixed(0)}
                      </td>
                      <td className={`px-2 py-3 text-right font-bold border-r border-gray-200 ${mpiHrs <= 5 ? 'bg-red-100' : mpiHrs <= 10 ? 'bg-yellow-100' : ''}`}>
                        {mpiHrs.toFixed(0)}
                      </td>
                      <td className="px-2 py-3 text-right">{aircraft.tboHours}</td>
                      <td className={`px-2 py-3 text-right text-xs ${getStatusColor(radioDays)}`}>
                        {radioDays}d
                      </td>
                      <td className={`px-2 py-3 text-right text-xs border-r border-gray-200 ${getStatusColor(insuranceDays)}`}>
                        {insuranceDays}d
                      </td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{aircraft.massEmpty}</td>
                      <td className="px-2 py-3 text-right font-mono text-xs">{aircraft.armEmpty}</td>
                      <td className="px-2 py-3 text-right border-r border-gray-200">-</td>
                      <td className={`px-2 py-3 text-right text-xs ${getStatusColor(compassDays)}`}>
                        {compassDays}d
                      </td>
                      <td className={`px-2 py-3 text-right text-xs ${getStatusColor(fireExtDays)}`}>
                        {fireExtDays}d
                      </td>
                      <td className={`px-2 py-3 text-right text-xs ${getStatusColor(firstAidDays)}`}>
                        {firstAidDays}d
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logbook Table */}
      {viewMode === 'flights' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stelfly-navy text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Reg</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Tacho Start</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Tacho End</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Flight Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Dual</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Solo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">PIC</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                      No flight entries yet. Click "Add Flight" to create your first entry.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const flightTotal = entry.dualTime + entry.soloTime + entry.picTime;
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {format(new Date(entry.date), 'dd MMM yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-stelfly-navy">{entry.registration || entry.aircraft}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.type || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">{entry.tachoStart ? entry.tachoStart.toFixed(1) : '-'}</td>
                        <td className="px-4 py-3 text-sm text-right font-mono">{entry.tachoEnd ? entry.tachoEnd.toFixed(1) : '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {entry.departure} → {entry.arrival}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.flightType}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {entry.dualTime > 0 ? entry.dualTime.toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {entry.soloTime > 0 ? entry.soloTime.toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {entry.picTime > 0 ? entry.picTime.toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-stelfly-navy">
                          {flightTotal.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{entry.instructor || '-'}</td>
                      </tr>
                    );
                  })
                )}
                {entries.length > 0 && (
                  <tr className="bg-stelfly-navy text-white font-bold">
                    <td colSpan={7} className="px-4 py-3 text-sm uppercase">Totals</td>
                    <td className="px-4 py-3 text-sm text-right">{totalDual.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-right">{totalSolo.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-right">{totalPIC.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-right">{totalHours.toFixed(1)}</td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
