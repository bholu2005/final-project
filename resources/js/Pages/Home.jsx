import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

// ==========================================
// 👤 USER COMPONENTS & PAGES IMPORT
// ==========================================
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import CookieBanner from '../Components/CookieBanner';

import HeroSection from './HeroSection';
import ScanPage from './ScanPage';
import ScanningProcess from './ScanningProcess';
import Dashboard from './Dashboard';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import LiveToolsPage from './LiveToolsPage';
import PricingPage from './PricingPage';
import ProfilePage from './ProfilePage';
import AuthPage from './AuthPage';
import NotificationsPage from './NotificationsPage';
import BillingPage from './BillingPage';
import SupportPage from './SupportPage';
import DevelopersPage from './DevelopersPage';
import TeamPage from './TeamPage';
import MonitorPage from './MonitorPage';
import CodePatchSandboxPage from './CodePatchSandboxPage';
import ApiPlaygroundPage from './ApiPlaygroundPage';
import SecurityThreatsPage from './SecurityThreatsPage';
import IntegrationsPage from './IntegrationsPage';
import AiAssistantPage from './AiAssistantPage';
// ==========================================
// 👑 ADMIN COMPONENTS & PAGES IMPORT
// ==========================================
import AdminNavbar from '../Components/AdminNavbar';
import AdminLayout from '../Layouts/AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminScans from './AdminScans';
import AdminTickets from './AdminTickets';
import AdminFinance from './AdminFinance';
import AdminSettings from './AdminSettings';
import AdminProfilePage from './AdminProfilePage'; 
import AdminNotifications from './AdminNotifications';

export default function Home() {
    // --- 1. AUTH & SYSTEM STATES ---
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('Home');
    const [isAdminView, setIsAdminView] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // --- 2. DATA STATES (Scanning Data) ---
    // Initialized as empty arrays/null to prevent crashes
    const [currentScanId, setCurrentScanId] = useState(null);
    const [scanResults, setScanResults] = useState([]);
    const [fileTree, setFileTree] = useState([]); 
    const [flatList, setFlatList] = useState([]); 
    const [tables, setTables] = useState([]);

    // --- 3. INITIAL LOAD (CHECK SESSION) ---
    useEffect(() => {
        const checkAuth = async () => {
            const token = sessionStorage.getItem('auth_token');
            if (token) {
                try {
                    // Fetch full user details to get 'role'
                    const res = await axios.get('http://127.0.0.1:8000/api/user', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                    
                    // Logic: If Admin logs in, send to AdminDashboard
                    // If User logs in, send to Home
                    if (res.data.role === 'admin' && currentPage === 'Home') {
                        setIsAdminView(true);
                        setCurrentPage('AdminDashboard');
                    }
                } catch (err) {
                    console.error("Session Invalid:", err);
                    sessionStorage.clear();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // --- 4. HANDLERS ---

    const handleLoginSuccess = (userData) => { 
        setUser(userData); 
        // Redirect based on Role
        if (userData.role === 'admin') {
            setIsAdminView(true);
            setCurrentPage('AdminDashboard');
        } else {
            setCurrentPage('Home'); 
        }
    };

    const handleLogout = () => { 
        sessionStorage.clear(); 
        setUser(null); 
        setCurrentPage('Home'); 
    };

    // 🔥 Receive Data from ScanPage -> Pass to ScanningProcess
    const handleScanStart = (scanId, results, flatData, treeData, detectedTables) => {
        console.log("🚀 Starting Scan Process...", { 
            id: scanId, 
            filesCount: flatData?.length 
        });
        
        setCurrentScanId(scanId || 'PENDING');
        setScanResults(results || []);
        setFlatList(flatData || []);
        setFileTree(treeData || []);
        setTables(detectedTables || []);
        
        setCurrentPage('Scanning');
    };

    // --- 5. RENDER LOGIC ---

    // A. Show Nothing while checking auth
    if (isLoading) return null; 
    
    // B. Show Auth Page if not logged in and requesting protected page
    const guestAllowedPages = ['Home', 'Pricing'];
    if (!user && !guestAllowedPages.includes(currentPage)) {
        return <AuthPage onLoginSuccess={handleLoginSuccess} onBackToHome={() => setCurrentPage('Home')} />;
    }

    // ==========================================
    // 👑 ADMIN VIEW RENDER
    // ==========================================
    if (user && user.role === 'admin' && isAdminView) {
        // 🔥 Logic to hide Navbar on full pages (Profile, Notifications)
        const hideAdminNav = ['AdminProfile', 'AdminNotifications'];
        const showAdminNav = !hideAdminNav.includes(currentPage);

        return (
            <div className="min-h-screen bg-skin text-black font-body overflow-x-hidden selection:bg-red-200 selection:text-red-900">
                
                {showAdminNav && (
                    <AdminNavbar 
                        activePage={currentPage === 'Home' ? 'AdminDashboard' : currentPage} 
                        onNavigate={setCurrentPage} 
                        onLogout={handleLogout} 
                        user={user} 
                        onToggleView={() => {
                            setIsAdminView(false);
                            setCurrentPage('Home');
                        }}
                    />
                )}

                <main className={`min-h-screen ${showAdminNav ? 'pt-32 pb-10 px-4 md:px-8 max-w-7xl mx-auto' : ''}`}>
                    <AnimatePresence mode="wait">
                        {(currentPage === 'Home' || currentPage === 'AdminDashboard') && <AdminDashboard />}
                        {currentPage === 'AdminUsers' && <AdminUsers />}
                        {currentPage === 'AdminScans' && <AdminScans />}
                        {currentPage === 'AdminTickets' && <AdminTickets />}
                        {currentPage === 'AdminFinance' && <AdminFinance />}
                        {currentPage === 'AdminSettings' && <AdminSettings />}

                        {currentPage === 'SecurityThreats' && (
                            <motion.div key="secThreats" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <SecurityThreatsPage onBack={() => setCurrentPage('AdminDashboard')} />
                            </motion.div>
                        )}

                        {/* 🔥 ADMIN FULL PAGES */}
                        {currentPage === 'AdminProfile' && (
                            <motion.div key="admProfile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <AdminProfilePage onBack={() => setCurrentPage('AdminDashboard')} />
                            </motion.div>
                        )}

                        {currentPage === 'AdminNotifications' && (
                            <motion.div key="admNotif" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <AdminNotifications onBack={() => setCurrentPage('AdminDashboard')} />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>
                
                {/* Cookie Banner */}
                <CookieBanner />
                {/* No Footer for Admin */}
            </div>
        );
    }

    // ==========================================
    // 👤 USER VIEW RENDER
    // ==========================================

    // Logic to hide Navbar/Footer on immersive pages (Scanning, Profile, Notifications)
    const hideNavFooterPages = ['Scanning', 'Profile', 'Notifications'];
    const showNavFooter = !hideNavFooterPages.includes(currentPage);

    return (
        <div className="min-h-screen bg-skin text-black font-body overflow-x-hidden selection:bg-black selection:text-white">
            
            {/* NAVBAR */}
            {showNavFooter && (
                <Navbar 
                    activePage={currentPage} 
                    onNavigate={setCurrentPage} 
                    user={user} 
                    onLogout={handleLogout} 
                    onToggleView={() => {
                        setIsAdminView(true);
                        setCurrentPage('AdminDashboard');
                    }}
                    isCollapsed={isSidebarCollapsed}
                    onCollapseChange={setIsSidebarCollapsed}
                />
            )}

            {/* DYNAMIC CONTENT AREA */}
            <main className={`min-h-screen transition-all duration-300 ${showNavFooter && currentPage !== 'Home' && currentPage !== 'Scanning' ? (isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72') : ''}`}>
                <AnimatePresence mode="wait">
                    
                    {/* 1. HOME PAGE */}
                    {currentPage === 'Home' && (
                        <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <HeroSection onStartScan={() => setCurrentPage('Scan')} />
                        </motion.div>
                    )}
                    
                    {/* 2. SCAN CONFIGURATION */}
                    {currentPage === 'Scan' && (
                        <motion.div key="scan" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <ScanPage onRunScan={handleScanStart} />
                        </motion.div>
                    )}
                    
                    {/* 3. SCANNING PROCESS (Matrix View) */}
                    {currentPage === 'Scanning' && (
                        <motion.div key="scanning" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <ScanningProcess 
                                scanId={currentScanId} 
                                scanResults={scanResults} 
                                fileTree={fileTree} 
                                flatList={flatList} 
                                tables={tables}
                                user={user} // Pass user for premium check
                                onOpenPricing={() => setCurrentPage('Pricing')} 
                                onComplete={() => setCurrentPage('Dashboard')} 
                            />
                        </motion.div>
                    )}
                    
                    {/* 4. DASHBOARD */}
                    {currentPage === 'Dashboard' && (
                        <motion.div key="dashboard" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <Dashboard scanId={currentScanId} onNavigate={setCurrentPage} />
                        </motion.div>
                    )}
                    
                    {/* 5. REPORTS HISTORY */}
                    {currentPage === 'Reports' && (
                        <motion.div key="reports" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <ReportsPage onViewReport={(id) => { 
                                setCurrentScanId(id); 
                                setCurrentPage('Dashboard'); 
                            }} />
                        </motion.div>
                    )}
                    
                    {/* 6. SETTINGS */}
                    {currentPage === 'Settings' && (
                        <motion.div key="settings" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <SettingsPage onNavigate={setCurrentPage} />
                        </motion.div>
                    )}

                    {/* 7. LIVE TOOLS */}
                    {currentPage === 'Live' && (
                        <motion.div key="live" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <LiveToolsPage />
                        </motion.div>
                    )}

                    {/* 7b. AI SECURITY ASSISTANT */}
                    {currentPage === 'AiAssistant' && (
                        <motion.div key="aiAssistant" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <AiAssistantPage />
                        </motion.div>
                    )}
                    
                    {/* 8. PRICING PAGE */}
                    {currentPage === 'Pricing' && (
                        <motion.div key="pricing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <PricingPage onBack={() => setCurrentPage('Home')} />
                        </motion.div>
                    )}

                    {/* 9. PROFILE PAGE */}
                    {currentPage === 'Profile' && (
                        <motion.div key="profile" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <ProfilePage onBack={() => setCurrentPage('Home')} />
                        </motion.div>
                    )}

                    {/* 10. NOTIFICATIONS PAGE */}
                    {currentPage === 'Notifications' && (
                        <motion.div key="notif" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <NotificationsPage onBack={() => setCurrentPage('Home')} />
                        </motion.div>
                    )}

                    {/* 11. BILLING PAGE */}
                    {currentPage === 'Billing' && (
                        <motion.div key="billing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <BillingPage onBack={() => setCurrentPage('Settings')} />
                        </motion.div>
                    )}

                    {/* 12. SUPPORT PAGE */}
                    {currentPage === 'Support' && (
                        <motion.div key="support" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <SupportPage onBack={() => setCurrentPage('Settings')} />
                        </motion.div>
                    )}

                    {/* 13. DEVELOPERS API PAGE */}
                    {currentPage === 'Developers' && (
                        <motion.div key="developers" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <DevelopersPage onBack={() => setCurrentPage('Settings')} />
                        </motion.div>
                    )}

                    {/* 14. TEAM MANAGEMENT PAGE */}
                    {currentPage === 'Team' && (
                        <motion.div key="team" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <TeamPage onBack={() => setCurrentPage('Settings')} />
                        </motion.div>
                    )}

                    {currentPage === 'Monitor' && (
                        <motion.div key="monitor" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <MonitorPage onBack={() => setCurrentPage('Home')} />
                        </motion.div>
                    )}

                    {currentPage === 'CodePatchSandbox' && (
                        <motion.div key="patchSandbox" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <CodePatchSandboxPage scanId={currentScanId} onBack={() => setCurrentPage('Dashboard')} />
                        </motion.div>
                    )}

                    {currentPage === 'ApiPlayground' && (
                        <motion.div key="apiPlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <ApiPlaygroundPage onBack={() => setCurrentPage('Settings')} />
                        </motion.div>
                    )}

                    {currentPage === 'Integrations' && (
                        <motion.div key="webhooks" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <IntegrationsPage onBack={() => setCurrentPage('Settings')} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* FOOTER */}
            {currentPage === 'Home' && <Footer />}

            {/* Cookie Banner */}
            <CookieBanner />
        </div>
    );
}