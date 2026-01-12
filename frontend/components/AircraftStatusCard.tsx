import React from 'react';
import { BadgeCheck, AlertTriangle, Wrench, Plane } from 'lucide-react';

interface AircraftStatusProps {
    tailNumber: string;
    model: string;
    nextServiceHours: number; // Remaining hours
    status: 'Airworthy' | 'Maintenance' | 'In-Flight';
}

const AircraftStatusCard: React.FC<AircraftStatusProps> = ({ tailNumber, model, nextServiceHours, status }) => {
    const isCritical = nextServiceHours < 5;
    
    // Status Logic
    let statusColor = 'bg-green-100 text-green-800';
    let StatusIcon = BadgeCheck;
    
    if (status === 'Maintenance') {
        statusColor = 'bg-red-100 text-red-800';
        StatusIcon = Wrench;
    } else if (status === 'In-Flight') {
        statusColor = 'bg-blue-100 text-blue-800';
        StatusIcon = Plane;
    }

    // Progress bar calculation (assuming 100hr interval)
    const progress = Math.max(0, Math.min(100, (100 - nextServiceHours))); 

    return (
        <div className="bg-white p-4 rounded-sms border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-stelfly-navy">{tailNumber}</h3>
                    <p className="text-sm text-slate-500">{model}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColor}`}>
                    {status === 'Maintenance' ? <Wrench size={12}/> : <BadgeCheck size={12}/>}
                    {status}
                </span>
            </div>

            <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Until Service</span>
                    <span className={`font-bold ${isCritical ? 'text-stelfly-gold' : 'text-stelfly-navy'}`}>
                        {nextServiceHours} hrs
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className={`h-full ${isCritical ? 'bg-stelfly-gold' : 'bg-stelfly-navy'}`} 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                {isCritical && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 bg-amber-50 p-1.5 rounded-sms border border-amber-200">
                        <AlertTriangle size={12} />
                        <span>Approaching 100hr Check</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AircraftStatusCard;
