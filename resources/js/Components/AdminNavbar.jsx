import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, Users, Activity, Ticket, CreditCard, Settings, 
    Hexagon, LogOut, User, Menu, X, Bell, Crown, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AdminNavbar({ activePage, onNavigate, user, onLogout }) { 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // 🔥 ADMIN SPECIFIC LINKS (But Style is Same as Client)
    const navItems = [
        { id: 'AdminDashboard', icon: LayoutDashboard, label: 'Overview' },
        { id: 'AdminUsers', icon: Users, label: 'Users' },
        { id: 'AdminScans', icon: Activity, label: 'Scans' },
        { id: 'AdminTickets', icon: Ticket, label: 'Support' },
        { id: 'AdminFinance', icon: CreditCard, label: 'Finance' },
        { id: 'AdminSettings', icon: Settings, label: 'System' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsMobileMenuOpen(false);
        window.addEventListener('scroll', handleScroll);
        
        // Fetch Notifications Logic
        const checkNotifs = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                const res = await axios.get('http://127.0.0.1:8000/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUnreadCount(res.data.data.length);
            } catch(e) {}
        };
        checkNotifs();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (id) => {
        if (onNavigate) onNavigate(id);
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8 font-body">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    
                    {/* 1️⃣ LEFT: BRAND LOGO (Same Style) */}
                    <div className="flex items-center gap-3 cursor-pointer z-50" onClick={() => handleNavClick('AdminDashboard')}>
                        <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-xl border-2 border-white/10 rotate-3 hover:rotate-0 transition-all duration-300">
                            <Hexagon size={22} className="text-white fill-white/20" />
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="font-heading text-lg font-bold text-black leading-none">Merlin</span>
                            <span className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Admin Panel</span>
                        </div>
                    </div>

                    {/* 2️⃣ CENTER: DESKTOP NAVIGATION (Floating Pill) */}
                    <div className="hidden md:flex bg-black p-1.5 rounded-full items-center shadow-2xl border border-gray-800">
                        {navItems.map((item) => {
                            const isActive = activePage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`relative flex items-center justify-center h-10 rounded-full transition-all duration-300 px-1 ${
                                        isActive ? 'text-black' : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="admin-nav-pill" 
                                            className="absolute inset-0 bg-white rounded-full" 
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-2 px-2">
                                        <item.icon size={20} strokeWidth={2} />
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.span 
                                                    initial={{ width: 0, opacity: 0 }} 
                                                    animate={{ width: 'auto', opacity: 1 }} 
                                                    exit={{ width: 0, opacity: 0 }} 
                                                    className="text-sm font-bold whitespace-nowrap overflow-hidden"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* 3️⃣ RIGHT: ACTIONS */}
                    <div className="flex items-center gap-3 z-50">
                        
                        {/* Notification */}
                        <button 
                            onClick={() => handleNavClick('AdminNotifications')}
                            className="relative w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition shadow-sm group"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white group-hover:border-black animate-pulse"></span>}
                        </button>

                        <button onClick={onLogout} className="hidden sm:flex bg-black text-white px-5 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-gray-900 transition shadow-lg items-center gap-2">
                            <span>Logout</span><LogOut size={14}/>
                        </button>

                        {/* Admin Avatar */}
                        {user && (
                            <div 
                                onClick={() => handleNavClick('AdminProfile')}
                                className="w-10 h-10 bg-black text-white border-2 border-white rounded-full flex items-center justify-center shadow-lg font-bold uppercase cursor-pointer hover:scale-110 transition"
                            >
                                {user.name ? user.name.charAt(0) : <ShieldCheck size={20}/>}
                            </div>
                        )}

                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-11 h-11 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition">
                            {isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
                        </button>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-skin/95 backdrop-blur-xl pt-28 px-6 pb-10 flex flex-col md:hidden">
                        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-white/50">
                            <h3 className="font-heading text-xl mb-6 text-black/50 uppercase tracking-widest text-center">Admin Controls</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {navItems.map((item) => (
                                    <button key={item.id} onClick={() => handleNavClick(item.id)} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${activePage === item.id ? 'bg-black text-white shadow-lg scale-105' : 'bg-gray-50 text-black hover:bg-gray-100'}`}>
                                        <item.icon size={24} className="mb-2" />
                                        <span className="font-bold text-sm">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={onLogout} className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                <LogOut size={18}/> Logout Admin
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}