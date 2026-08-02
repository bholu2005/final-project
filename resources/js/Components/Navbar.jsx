import React, { useState, useEffect } from 'react';
import { 
    Home, LayoutDashboard, ScanSearch, FileText, Globe, 
    Hexagon, LogIn, LogOut, User, Menu, X, Bell, Settings, 
    Crown, UserCircle, LifeBuoy, CreditCard, Activity, Sparkles,
    ChevronLeft, ChevronRight, Sun, Moon, Search, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Navbar({ activePage = 'Home', onNavigate, user, onLogout, onToggleView }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [scansHistory, setScansHistory] = useState([]);
    const [isDark, setIsDark] = useState(false);

    // Fetch Recents Scans list for Sidebar History (ChatGPT style!)
    useEffect(() => {
        if (user && activePage !== 'Home') {
            const fetchHistory = async () => {
                try {
                    const token = sessionStorage.getItem('auth_token');
                    if (token) {
                        const res = await axios.get('http://127.0.0.1:8000/api/scans', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setScansHistory(res.data.data || []);
                    }
                } catch (e) {}
            };
            fetchHistory();
        }
    }, [user, activePage]);

    const handleNavClick = (id) => {
        if (onNavigate) onNavigate(id);
        setIsMobileOpen(false);
    };

    const handleAuthClick = () => {
        setIsMobileOpen(false);
        if (user) {
            if(onLogout) onLogout();
        } else {
            if(onNavigate) onNavigate('Auth');
        }
    };

    // Toggle Dark Mode Simulation on the body element
    const handleThemeToggle = () => {
        setIsDark(!isDark);
        document.body.classList.toggle('dark-mode-sim');
    };

    // Main App Navigation Items
    const navItems = [
        { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'Scan', icon: ScanSearch, label: 'New Scan' },
        { id: 'AiAssistant', icon: Sparkles, label: 'Try AI', color: 'text-purple-500' },
        { id: 'Monitor', icon: Activity, label: 'Monitor' },
        { id: 'Reports', icon: FileText, label: 'Reports' },
        { id: 'Live', icon: Globe, label: 'Live Tools' },
    ];

    // Other Utility Navigation Items (Settings, Billing, Support)
    const utilItems = [
        { id: 'Pricing', icon: Crown, label: 'Upgrade Plan' },
        { id: 'Billing', icon: CreditCard, label: 'Billing' },
        { id: 'Support', icon: LifeBuoy, label: 'Support' },
        { id: 'Settings', icon: Settings, label: 'Settings' },
    ];

    // ==========================================
    // 🌐 HORIZONTAL NAV FOR LANDING PAGE
    // ==========================================
    if (activePage === 'Home') {
        return (
            <>
                <nav className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8 font-body">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">

                        {/* Brand Logo */}
                        <div className="flex items-center gap-3 cursor-pointer z-50" onClick={() => handleNavClick('Home')}>
                            <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center shadow-xl border-2 border-white/10 rotate-3 hover:rotate-0 transition-all duration-300">
                                <Hexagon size={22} className="text-white fill-white/20" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-heading text-lg font-bold text-black leading-none">Merlin</span>
                                <span className="text-[10px] uppercase tracking-widest text-black/60 font-bold">Security</span>
                            </div>
                        </div>

                        {/* Public guest navigators */}
                        <div className="hidden lg:flex items-center gap-6 bg-white/75 backdrop-blur-md px-6 py-2 rounded-full border border-black/5 shadow-sm">
                            <button onClick={() => handleNavClick('Home')} className="text-sm font-bold text-black">Home</button>
                            <button onClick={() => handleNavClick('Pricing')} className="text-sm font-bold text-black/60 hover:text-black transition">Pricing</button>
                            <button onClick={() => handleNavClick('AiAssistant')} className="text-sm font-bold text-purple-600 hover:scale-105 transition flex items-center gap-1"><Sparkles size={14}/> Try AI</button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleAuthClick}
                                className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-xs md:text-sm hover:scale-105 transition shadow-lg flex items-center gap-2"
                            >
                                {user ? (<><span>Logout</span><LogOut size={14}/></>) : (<><span>Login / Register</span><LogIn size={14}/></>)}
                            </button>
                        </div>
                    </div>
                </nav>
            </>
        );
    }

    // ==========================================
    // 💻 CHATGPT / CLAUDE STYLE LEFT SIDEBAR NAV (FOR APP PAGES)
    // ==========================================
    return (
        <>
            {/* Sidebar toggle button for mobile */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-6 right-6 z-[100] w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition"
            >
                {isMobileOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>

            {/* Main Docked Left Sidebar */}
            <div
                className={`fixed top-0 left-0 bottom-0 z-40 bg-[#1e1e24] text-gray-300 font-body transition-all duration-300 border-r border-white/5 flex flex-col justify-between shadow-2xl
                    ${isCollapsed ? 'w-20' : 'w-72'}
                    ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                `}
                onMouseEnter={() => isCollapsed && setIsCollapsed(false)}
            >
                {/* 1. Header (Logo & Expand Toggle) */}
                <div className="p-5 flex items-center justify-between border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('Home')}>
                        <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-lg border border-white/10 hover:rotate-6 transition-transform duration-300">
                            <Hexagon size={20} className="fill-black/10" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-heading text-base font-bold text-white leading-none">Merlin Sec</span>
                                <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-0.5">Control panel</span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="hidden lg:flex p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                {/* 2. Middle area: Menu options and Recents History (ChatGPT style!) */}
                <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">

                    {/* App Links */}
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = activePage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group
                                        ${isActive
                                            ? 'bg-white text-black shadow-lg'
                                            : 'hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <item.icon size={18} className={isActive ? 'text-black' : item.color || 'text-gray-400 group-hover:text-white'} />
                                    {!isCollapsed && <span>{item.label}</span>}

                                    {isCollapsed && (
                                        <div className="absolute left-24 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Chat/Audit History Section (ChatGPT / Claude Style!) */}
                    {!isCollapsed && (
                        <div className="pt-4 border-t border-white/5 space-y-3">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block px-4">Recent Audits</span>
                            <div className="space-y-1.5">
                                {scansHistory.length > 0 ? (
                                    scansHistory.slice(0, 5).map((scan) => (
                                        <button
                                            key={scan.id}
                                            onClick={() => {
                                                if (onNavigate) {
                                                    // Dynamic set active scan page
                                                    onNavigate('Dashboard');
                                                }
                                            }}
                                            className="w-full text-left px-4 py-2.5 bg-white/2 hover:bg-white/5 rounded-xl text-xs text-white/60 hover:text-white transition flex items-center gap-2 truncate"
                                        >
                                            <FileText size={12} className="text-white/25 shrink-0" />
                                            <span className="truncate flex-grow">{scan.scan_reference} ({scan.target_type.toUpperCase()})</span>
                                        </button>
                                    ))
                                ) : (
                                    <span className="text-[10px] text-white/20 block px-4">No recent audits</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Utils links */}
                    <div className="pt-4 border-t border-white/5 space-y-1">
                        {utilItems.map((item) => {
                            const isActive = activePage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative group
                                        ${isActive
                                            ? 'bg-white text-black shadow-lg'
                                            : 'hover:bg-white/5 hover:text-white text-gray-400'
                                        }
                                    `}
                                >
                                    <item.icon size={16} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Bottom Area: Dark mode and Profile card */}
                <div className="p-4 border-t border-white/5 bg-[#1b1b20] shrink-0 space-y-3">

                    {/* Theme mode toggle */}
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 text-xs">
                        {!isCollapsed && <span className="font-bold text-white/50">Dark Theme</span>}
                        <button 
                            onClick={handleThemeToggle}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition"
                        >
                            {isDark ? <Sun size={14}/> : <Moon size={14}/>}
                        </button>
                    </div>

                    {/* User Profile display card (ChatGPT Bottom panel style!) */}
                    {user && (
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-2xl border border-white/5 group relative">
                            <div className="w-10 h-10 bg-skin text-black font-bold uppercase rounded-xl flex items-center justify-center shadow-lg shrink-0">
                                {user.name ? user.name.charAt(0) : <User size={18}/>}
                            </div>

                            {!isCollapsed && (
                                <div className="flex-grow min-w-0 flex flex-col">
                                    <span className="text-xs font-bold text-white truncate">{user.name}</span>
                                    <span className="text-[9px] font-bold text-skin uppercase tracking-wider mt-0.5">{user.plan_type} Partner</span>
                                </div>
                            )}

                            {/* Quick Logout hover trigger */}
                            <button
                                onClick={handleAuthClick}
                                className="p-2 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition shrink-0"
                                title="Logout Session"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Sidebar collapse placeholder for spacing on large screens */}
            {!isCollapsed && (
                <div className="hidden lg:block w-72 shrink-0 pointer-events-none transition-all duration-300" />
            )}
            {isCollapsed && (
                <div className="hidden lg:block w-20 shrink-0 pointer-events-none transition-all duration-300" />
            )}
        </>
    );
}
