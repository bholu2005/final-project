import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    Settings, Trash2, Moon, Sun, Info, Shield, CheckCircle, Database, 
    CreditCard, LifeBuoy, ChevronRight, Terminal, Users 
} from 'lucide-react';

export default function SettingsPage({ onNavigate }) {
    const [isDark, setIsDark] = useState(false); // Theme Toggle Simulation
    const [clearing, setClearing] = useState(false);
    const [message, setMessage] = useState('');

    // 🔥 CLEAR HISTORY LOGIC
    const handleClearHistory = async () => {
        if (!confirm("Are you sure? This will delete ALL scan reports permanently. This action cannot be undone.")) return;
        
        setClearing(true);
        try {
            const token = sessionStorage.getItem('auth_token');
            await axios.delete('http://127.0.0.1:8000/api/scans/clear', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessage('History Cleared Successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Failed to clear history. Try again.');
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto min-h-screen font-body text-black">
            
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                <span className="text-xs font-bold tracking-widest uppercase bg-black/5 px-3 py-1 rounded-full border border-black/10">System Control</span>
                <h2 className="font-heading text-4xl md:text-5xl mt-3">Settings</h2>
                <p className="text-black/60 mt-2">Manage preferences, integrations, and system data.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Main Settings */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* 1. Account & Integrations (Navigation) */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-white/50">
                        <h3 className="font-heading text-xl mb-6 flex items-center gap-2">Account & Integrations</h3>
                        
                        <div className="space-y-2">
                            {/* Billing Link */}
                            <div onClick={() => onNavigate('Billing')} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition"><CreditCard size={20}/></div>
                                    <div><p className="font-bold text-sm">Billing History</p><p className="text-xs text-black/50">Invoices & Plans</p></div>
                                </div>
                                <ChevronRight size={18} className="text-black/30 group-hover:text-black transition"/>
                            </div>

                            {/* Team Management Link (NEW) */}
                            <div onClick={() => onNavigate('Team')} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition"><Users size={20}/></div>
                                    <div><p className="font-bold text-sm">Team Members</p><p className="text-xs text-black/50">Manage Access & Roles</p></div>
                                </div>
                                <ChevronRight size={18} className="text-black/30 group-hover:text-black transition"/>
                            </div>

                            {/* Support Link */}
                            <div onClick={() => onNavigate('Support')} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition"><LifeBuoy size={20}/></div>
                                    <div><p className="font-bold text-sm">Help & Support</p><p className="text-xs text-black/50">Create Ticket</p></div>
                                </div>
                                <ChevronRight size={18} className="text-black/30 group-hover:text-black transition"/>
                            </div>

                            {/* Developer API Link */}
                            <div onClick={() => onNavigate('Developers')} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition group">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition"><Terminal size={20}/></div>
                                    <div><p className="font-bold text-sm">Developer API</p><p className="text-xs text-black/50">Manage API Keys & Docs</p></div>
                                </div>
                                <ChevronRight size={18} className="text-black/30 group-hover:text-black transition"/>
                            </div>
                        </div>
                    </div>

                    {/* 2. Appearance */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-white/50">
                        <h3 className="font-heading text-xl mb-4 flex items-center gap-2"><Sun size={20}/> Appearance</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-black/5">
                            <div>
                                <p className="font-bold text-sm">Theme Mode</p>
                                <p className="text-xs text-black/50">Switch between Light and Dark (Beta)</p>
                            </div>
                            <button 
                                onClick={() => setIsDark(!isDark)}
                                className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${isDark ? 'bg-black justify-end' : 'bg-gray-300 justify-start'}`}
                            >
                                <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                            </button>
                        </div>
                    </div>

                    {/* 3. Data Management */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-white/50">
                        <h3 className="font-heading text-xl mb-4 flex items-center gap-2 text-red-600"><Database size={20}/> Data Zone</h3>
                        
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                            <div>
                                <p className="font-bold text-sm text-red-900">Clear Scan History</p>
                                <p className="text-xs text-red-700/60">Permanently remove all reports and uploaded files.</p>
                            </div>
                            <button 
                                onClick={handleClearHistory}
                                disabled={clearing}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-md flex items-center gap-2 disabled:opacity-70"
                            >
                                {clearing ? 'Deleting...' : <><Trash2 size={16}/> Clear All</>}
                            </button>
                        </div>
                        
                        {message && <p className="mt-3 text-center text-sm font-bold text-green-600 flex justify-center items-center gap-2 animate-pulse"><CheckCircle size={14}/> {message}</p>}
                    </div>

                </div>

                {/* RIGHT COLUMN: System Info (Sidebar) */}
                <div>
                    <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden sticky top-32">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-skin/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <h3 className="font-heading text-xl mb-6 flex items-center gap-2"><Info size={20}/> System Info</h3>
                        
                        <div className="space-y-4 text-sm text-white/70">
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>Version</span>
                                <span className="font-bold text-white">v2.4.0 (Stable)</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>Engine</span>
                                <span className="font-bold text-white">Laravel 11 + React</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>Environment</span>
                                <span className="font-bold text-white">Production</span>
                            </div>
                            <div className="flex justify-between border-b border-white/10 pb-2">
                                <span>Status</span>
                                <span className="font-bold text-green-400 flex items-center gap-1"><Shield size={12}/> Secure</span>
                            </div>
                            <div className="flex justify-between">
                                <span>License</span>
                                <span className="font-bold text-white">Enterprise</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-xs text-white/40">Designed by Merlin Team</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}