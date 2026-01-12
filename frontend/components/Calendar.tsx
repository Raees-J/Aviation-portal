import React from 'react';

const Calendar = () => {
    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h2 className="text-xl font-bold mb-4">Flight Calendar</h2>
            <div className="grid grid-cols-7 gap-2">
                {/* Mock Calendar Grid */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-semibold text-center py-2 border-b">
                        {day}
                    </div>
                ))}
                {/* Placeholder empty slots */}
                {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-24 border p-1 text-sm bg-gray-50 hover:bg-blue-50 cursor-pointer">
                        <span className="text-gray-400">{i + 1}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
