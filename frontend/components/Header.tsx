'use client';
import React, { useEffect, useState } from 'react';
import { CloudSun, UserCircle } from 'lucide-react';

interface UserInfo {
  firstName: string;
  lastName: string;
  role: string;
}

const Header = () => {
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        // Get user info from localStorage (set during login)
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        }
    }, []);

    const displayName = user ? `${user.firstName} ${user.lastName}` : 'Guest User';
    const displayRole = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Student';

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Weather Widget */}
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-sms border border-slate-200">
                <CloudSun className="text-stelfly-navy" size={20} />
                <div className="text-xs font-mono text-slate-700">
                    <span className="font-bold text-stelfly-navy">FASH:</span> 121800Z 18005KT CAVOK 24/16 Q1013
                </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-bold text-stelfly-navy">{displayName}</p>
                    <p className="text-xs text-slate-500">{displayRole}</p>
                </div>
                <div className="h-10 w-10 text-slate-300">
                    <UserCircle size={40} />
                </div>
            </div>
        </header>
    );
};

export default Header;
