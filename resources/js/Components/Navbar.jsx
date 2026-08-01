import React, { useState, useEffect } from 'react';
import { 
    Home, LayoutDashboard, ScanSearch, FileText, Globe, 
    Hexagon, LogIn, LogOut, User, Menu, X, Bell, Settings, 
    Crown, UserCircle, LifeBuoy, CreditCard, Activity // 🔥 Activity Icon for Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ activePage = 'Home', onNavigate, user, onLogout }) { 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasNotification, setHasNotification] = useState(true);

    const navItems = [
        { id: 'Home', icon: Home, label: 'Home' },
        { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'Scan', icon: ScanSearch, label: 'New Scan' },
        { id: 'Monitor', icon: Activity, label: 'Monitor' }, // 🔥 NEW OPTION ADDED
        { id: 'Reports', icon: FileText, label: 'Reports' },
        { id: 'Live', icon: Globe, label: 'Live Tools' },
        { id: 'Pricing', icon: Crown, label: 'Upgrade' }, 
        { id: 'Billing', icon: CreditCard, label: 'Billing' },
        { id: 'Support', icon: LifeBuoy, label: 'Support' },
        { id: 'Settings', icon: Settings, label: 'Settings' },
    ];

    useEffect(() => {
        const handleScroll = () => setIsMobileMenuOpen(false);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (id) => {
        if (onNavigate) onNavigate(id);
        setIsMobileMenuOpen(false);
    };

    const handleAuthClick = () => {
        setIsMobileMenuOpen(false);
        if (user) {
            if(onLogout) onLogout();
        } else {
            if(onNavigate) onNavigate('Auth');
        }
    };

    return (
        <>
            <nav className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8 font-body">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    
                    {/* LEFT: BRAND LOGO */}
                    <div className="flex items-center gap-3 cursor-pointer z-50" onClick={() => handleNavClick('Home')}>
                        <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-xl border-2 border-white/10 rotate-3 hover:rotate-0 transition-all duration-300">
                            <Hexagon size={22} className="text-white fill-white/20" />
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="font-heading text-lg font-bold text-black leading-none">Merlin</span>
                            <span className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Security</span>
                        </div>
                    </div>

                    {/* CENTER: NAVIGATION */}
                    <div className="hidden xl:flex bg-black p-1.5 rounded-full items-center shadow-2xl border border-gray-800">
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
                                            layoutId="nav-pill" 
                                            className="absolute inset-0 bg-white rounded-full" 
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} 
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-2 px-2">
                                        <item.icon size={20} strokeWidth={2} className={item.id === 'Pricing' && !isActive ? 'text-yellow-500' : ''} />
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

                    {/* RIGHT: ACTIONS */}
                    <div className="flex items-center gap-3 z-50">
                        
                        {/* Dynamic Usage Limit Indicator */}
                        {user && (
                            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/75 border border-black/10 rounded-full text-xs font-bold shadow-sm">
                                {user.plan_type === 'free' ? (
                                    <>
                                        <span className="text-black/60">Daily Scans:</span>
                                        <span className="text-red-600 animate-pulse">{user.daily_scans_count ?? 0}/3</span>
                                    </>
                                ) : (
                                    <span className="text-yellow-600 flex items-center gap-1.5">
                                        <Crown size={12} className="fill-yellow-600 animate-pulse"/> {user.plan_type.toUpperCase()}
                                    </span>
                                )}
                            </div>
                        )}

                        <button 
                            onClick={() => handleNavClick('Notifications')}
                            className="relative w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition shadow-sm group"
                        >
                            <Bell size={18} />
                            {hasNotification && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white group-hover:border-black"></span>}
                        </button>

                        <button 
                            onClick={handleAuthClick} 
                            className="hidden sm:flex bg-black text-white px-5 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-gray-900 transition shadow-lg items-center gap-2"
                        >
                            {user ? (<><span>Logout</span><LogOut size={14}/></>) : (<><span>Join</span><LogIn size={14}/></>)}
                        </button>

                        {user && (
                            <div 
                                onClick={() => handleNavClick('Profile')} 
                                className={`w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer border-2 font-bold uppercase hover:scale-110 transition ${activePage === 'Profile' ? 'border-yellow-400 text-yellow-400' : 'border-white'}`}
                            >
                                {user.name ? user.name.charAt(0) : <User size={20}/>}
                            </div>
                        )}

                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="xl:hidden w-11 h-11 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition">
                            {isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
                        </button>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-skin/95 backdrop-blur-xl pt-28 px-6 pb-10 flex flex-col md:hidden overflow-y-auto">
                        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-white/50">
                            <h3 className="font-heading text-xl mb-6 text-black/50 uppercase tracking-widest text-center">Menu</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {navItems.map((item) => (
                                    <button key={item.id} onClick={() => handleNavClick(item.id)} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${activePage === item.id ? 'bg-black text-white shadow-lg scale-105' : 'bg-gray-50 text-black hover:bg-gray-100'}`}>
                                        <item.icon size={24} className="mb-2" />
                                        <span className="font-bold text-sm">{item.label}</span>
                                    </button>
                                ))}
                                {user && (
                                    <button onClick={() => handleNavClick('Profile')} className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${activePage === 'Profile' ? 'bg-black text-white shadow-lg scale-105' : 'bg-gray-50 text-black hover:bg-gray-100'}`}>
                                        <UserCircle size={24} className="mb-2" /><span className="font-bold text-sm">My Profile</span>
                                    </button>
                                )}
                            </div>
                            <button onClick={handleAuthClick} className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                                {user ? (<><LogOut size={18}/> Logout ({user.name})</>) : 'Login / Sign Up'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}