import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Settings, Save, Server, ShieldAlert, Bell, Loader2, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        maintenance_mode: 'false',
        free_scan_limit: '3',
        global_announcement: '',
        registration_open: 'true',
        enable_ai_engine: 'true',
        detailed_security_logs: 'true'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const token = sessionStorage.getItem('auth_token');

    // Fetch Settings
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setSettings(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Save Settings
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('http://127.0.0.1:8000/api/admin/settings', settings, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setMsg('System Configuration Updated!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg('Failed to update settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-black/50" size={40}/></div>;

    return (
        <div className="bg-[#FDFBF7] p-8 md:p-12 rounded-[2rem] shadow-xl border border-white/50 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h2 className="font-heading text-4xl mb-2">System Configuration</h2>
                    <p className="text-black/50">Manage global settings, maintenance mode, and limits.</p>
                </div>
                <div className="bg-black/5 p-4 rounded-full"><Settings size={32} className="text-black/30"/></div>
            </div>

            {msg && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl font-bold flex items-center gap-2"><CheckCircle size={18}/> {msg}</div>}

            <form onSubmit={handleSave} className="space-y-8 relative z-10">
                
                {/* 1. System Controls */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-red-600 font-bold">
                            <Server size={20}/> Maintenance Mode
                        </div>
                        <p className="text-xs text-black/50 mb-4">When enabled, only Admins can access the site.</p>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button type="button" onClick={() => setSettings({...settings, maintenance_mode: 'false'})} className={`flex-1 py-2 rounded-md text-xs font-bold transition ${settings.maintenance_mode === 'false' ? 'bg-white shadow-sm text-green-600' : 'text-black/40'}`}>Live</button>
                            <button type="button" onClick={() => setSettings({...settings, maintenance_mode: 'true'})} className={`flex-1 py-2 rounded-md text-xs font-bold transition ${settings.maintenance_mode === 'true' ? 'bg-red-500 text-white shadow-sm' : 'text-black/40'}`}>Maintenance</button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4 text-blue-600 font-bold">
                            <ShieldAlert size={20}/> Free Scan Limit
                        </div>
                        <p className="text-xs text-black/50 mb-4">Daily scan limit for non-premium users.</p>
                        <input 
                            type="number" 
                            value={settings.free_scan_limit} 
                            onChange={(e) => setSettings({...settings, free_scan_limit: e.target.value})}
                            className="w-full bg-gray-50 border border-black/10 rounded-xl px-4 py-2 font-bold focus:outline-none focus:border-black transition"
                        />
                    </div>
                </div>

                {/* 1b. Additional Admin Toggles */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Registration Toggle */}
                    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                        <h4 className="font-bold text-sm mb-2 text-black">New Registration Status</h4>
                        <p className="text-xs text-black/50 mb-4">Allow new users to sign up.</p>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button type="button" onClick={() => setSettings({...settings, registration_open: 'true'})} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${settings.registration_open === 'true' ? 'bg-white shadow-sm text-black' : 'text-black/40'}`}>Open</button>
                            <button type="button" onClick={() => setSettings({...settings, registration_open: 'false'})} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${settings.registration_open === 'false' ? 'bg-white shadow-sm text-red-500' : 'text-black/40'}`}>Closed</button>
                        </div>
                    </div>

                    {/* AI Engine Toggle */}
                    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                        <h4 className="font-bold text-sm mb-2 text-black">Enable AI Analysis Engine</h4>
                        <p className="text-xs text-black/50 mb-4">Allow users to view AI Fix Suggestions.</p>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button type="button" onClick={() => setSettings({...settings, enable_ai_engine: 'true'})} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${settings.enable_ai_engine === 'true' ? 'bg-white shadow-sm text-black' : 'text-black/40'}`}>Enabled</button>
                            <button type="button" onClick={() => setSettings({...settings, enable_ai_engine: 'false'})} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${settings.enable_ai_engine === 'false' ? 'bg-white shadow-sm text-red-500' : 'text-black/40'}`}>Disabled</button>
                        </div>
                    </div>

                    {/* Detailed intrusion logging Toggle */}
                    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                        <h4 className="font-bold text-sm mb-2 text-black">Intrusion Detection Logging</h4>
                        <p className="text-xs text-black/50 mb-4">Log deep payload security alerts.</p>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button type="button" onClick={() => setSettings({...settings, detailed_security_logs: 'true'})} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${settings.detailed_security_logs === 'true' ? 'bg-white shadow-sm text-black' : 'text-black/40'}`}>Active</button>
                            <button type="button" onClick={() => setSettings({...settings, detailed_security_logs: 'false'})} className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${settings.detailed_security_logs === 'false' ? 'bg-white shadow-sm text-red-500' : 'text-black/40'}`}>Muted</button>
                        </div>
                    </div>
                </div>

                {/* 2. Announcement Banner */}
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-orange-600 font-bold">
                        <Bell size={20}/> Global Announcement
                    </div>
                    <p className="text-xs text-black/50 mb-4">Message shown to all users on Dashboard (Leave empty to hide).</p>
                    <textarea 
                        value={settings.global_announcement} 
                        onChange={(e) => setSettings({...settings, global_announcement: e.target.value})}
                        placeholder="e.g., Server maintenance scheduled for Sunday..."
                        className="w-full h-24 bg-gray-50 border border-black/10 rounded-xl p-4 text-sm focus:outline-none focus:border-black transition resize-none"
                    />
                </div>

                {/* 3. Action */}
                <div className="flex justify-end">
                    <button 
                        disabled={saving}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold text-lg hover:scale-105 transition shadow-lg flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin"/> : <><Save size={20}/> Save Configuration</>}
                    </button>
                </div>

            </form>
        </div>
    );
}