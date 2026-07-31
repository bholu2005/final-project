import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, Info, CheckCircle, AlertTriangle, XCircle, Loader2, Filter, Clock } from 'lucide-react';

export default function AdminNotifications({ onBack }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                const res = await axios.get('http://127.0.0.1:8000/api/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifs();
    }, []);

    const filteredList = notifications.filter(n => filter === 'all' || n.type === filter);

    const getTheme = (type) => {
        switch(type) {
            case 'success': return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
            case 'alert': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
            case 'warning': return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
            default: return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#E8D5C6] font-body text-black flex flex-col">
            
            <div className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <button onClick={onBack} className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm hover:bg-white transition hover:scale-105 font-bold text-sm">
                    <ArrowLeft size={18} /> Back Dashboard
                </button>
                <div className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <Bell size={14} className="fill-current" /> Admin Alerts
                </div>
            </div>

            <div className="flex-grow pt-28 pb-10 px-4 md:px-8 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                    <div>
                        <h1 className="font-heading text-5xl md:text-6xl mb-4 text-red-900">System Logs</h1>
                        <p className="text-black/60 text-lg leading-relaxed">System-wide alerts and user activities.</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-white/50 flex flex-col gap-1">
                        {[{ id: 'all', label: 'All Logs', icon: Filter }, { id: 'alert', label: 'Critical Errors', icon: XCircle }, { id: 'success', label: 'Success', icon: CheckCircle }].map((tab) => (
                            <button key={tab.id} onClick={() => setFilter(tab.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${filter === tab.id ? 'bg-black text-white shadow-lg' : 'hover:bg-white/80 text-black/60 hover:text-black'}`}>
                                <tab.icon size={16} /> {tab.label}
                                {filter === tab.id && <motion.div layoutId="active-dot" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20"><Loader2 size={40} className="animate-spin text-black/30 mb-4"/><p className="text-black/40 text-sm font-bold animate-pulse">Fetching logs...</p></div>
                    ) : filteredList.length === 0 ? (
                        <div className="text-center py-20 bg-white/40 rounded-[3rem] border border-white/50"><Bell size={40} className="mx-auto text-black/20 mb-4"/><h3 className="font-heading text-2xl text-black/50">All Clear!</h3><p className="text-black/40 text-sm mt-1">No system alerts.</p></div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {filteredList.map((notif) => {
                                    const theme = getTheme(notif.type);
                                    const Icon = theme.icon;
                                    return (
                                        <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={notif.id} className="group bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 relative overflow-hidden">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
                                            <div className="flex gap-5 items-start">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.color}`}><Icon size={22} strokeWidth={2.5} /></div>
                                                <div className="flex-grow">
                                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                                                        <h3 className="font-bold text-lg text-black group-hover:text-black/80 transition-colors">{notif.title}</h3>
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-black/30 bg-gray-100 px-2 py-1 rounded-full mt-1 md:mt-0 w-fit"><Clock size={10} />{new Date(notif.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-black/60 text-sm leading-relaxed max-w-2xl">{notif.message}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}