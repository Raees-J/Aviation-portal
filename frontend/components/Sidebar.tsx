'use client';

import React from 'react';
import { LayoutDashboard, Calendar, Plane, Users, BookOpen, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
    const router = useRouter();
    
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { name: 'Scheduler', icon: Calendar, href: '/scheduler' },
        { name: 'Fleet', icon: Plane, href: '/fleet' },
        { name: 'Instructors', icon: Users, href: '/instructors' },
        { name: 'My Logbook', icon: BookOpen, href: '/logbook' },
    ];

    const handleSignOut = () => {
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-stelfly-navy text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-xl font-bold tracking-wider uppercase text-stelfly-gold">Stellenbosch</h1>
                <p className="text-xs text-slate-300 tracking-widest">FLYING CLUB</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link 
                        key={item.name} 
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sms hover:bg-stelfly-navy-light text-slate-200 hover:text-white transition-colors"
                    >
                        <item.icon size={18} className="text-stelfly-gold" />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 w-full hover:bg-red-900/30 rounded-sms transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
