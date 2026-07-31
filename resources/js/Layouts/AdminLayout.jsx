import React from 'react';
import AdminNavbar from '../Components/AdminNavbar';
import { motion } from 'framer-motion';

export default function AdminLayout({ children, activePage, onNavigate, onLogout, user }) {
    return (
        <div className="min-h-screen bg-[#E8D5C6] font-body text-black overflow-x-hidden selection:bg-black selection:text-white">
            
            {/* Admin Navbar */}
            <AdminNavbar 
                activePage={activePage} 
                onNavigate={onNavigate} 
                onLogout={onLogout} 
                user={user} 
            />

            {/* Main Content (No Footer) */}
            <main className="min-h-screen pt-32 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}