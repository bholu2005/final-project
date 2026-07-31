import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, Trash2, Play, Clock, Globe, ShieldCheck, Loader2, ArrowLeft, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function MonitorPage({ onBack }) {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // UI States for Feedback
    const [processingId, setProcessingId] = useState(null); // Which item is scanning
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', text: '' }

    const [form, setForm] = useState({ name: '', target: '', frequency: 'daily' });
    const token = sessionStorage.getItem('auth_token');

    // Show Notification Helper
    const showNotify = (type, text) => {
        setNotification({ type, text });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchMonitors = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/monitor/list', { headers: { Authorization: `Bearer ${token}` } });
            setMonitors(res.data.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchMonitors(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/monitor/add', form, { headers: { Authorization: `Bearer ${token}` } });
            setShowForm(false);
            setForm({ name: '', target: '', frequency: 'daily' });
            fetchMonitors();
            showNotify('success', 'Monitor Added Successfully!');
        } catch (err) {
            showNotify('error', err.response?.data?.message || "Failed to add monitor.");
        }
    };

    const handleRunNow = async (id) => {
        setProcessingId(id);
        try {
            await axios.post(`http://127.0.0.1:8000/api/monitor/${id}/run`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchMonitors();
            showNotify('success', 'Scan Complete! Result saved to Dashboard.');
        } catch (e) { 
            showNotify('error', "Scan Failed. Check URL.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Stop monitoring this target?")) return;
        await axios.delete(`http://127.0.0.1:8000/api/monitor/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchMonitors();
        showNotify('info', 'Monitor Removed.');
    };

    if (loading) return <div className="flex justify-center h-screen items-center bg-[#E8D5C6]"><Loader2 className="animate-spin text-black" size={40}/></div>;

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen font-body text-black relative">
            
            {/* 🔥 FLOATING NOTIFICATION */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-24 right-4 md:right-10 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm border-l-4 ${
                            notification.type === 'success' ? 'bg-white border-green-500 text-green-700' : 
                            notification.type === 'error' ? 'bg-white border-red-500 text-red-700' : 'bg-white border-blue-500 text-blue-700'
                        }`}
                    >
                        {notification.type === 'success' && <CheckCircle size={18}/>}
                        {notification.type === 'error' && <XCircle size={18}/>}
                        {notification.type === 'info' && <Activity size={18}/>}
                        {notification.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-black/50 hover:text-black mb-4"><ArrowLeft size={16}/> Back</button>
                    <h2 className="font-heading text-4xl md:text-5xl">Active Defense</h2>
                    <p className="text-black/60 mt-2">Real-time security monitoring for your assets.</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition flex items-center gap-2 shadow-lg">
                    <Plus size={20}/> Add Target
                </button>
            </div>

            {/* ADD FORM */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-black/5">
                            <h3 className="font-bold text-xl mb-6">New Monitor</h3>
                            <form onSubmit={handleAdd} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1 block">Project Name</label><input type="text" className="w-full border-b-2 border-black/10 py-2 outline-none focus:border-black bg-transparent" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required placeholder="My Portfolio"/></div>
                                    <div><label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1 block">Target URL</label><input type="url" className="w-full border-b-2 border-black/10 py-2 outline-none focus:border-black bg-transparent" value={form.target} onChange={e=>setForm({...form, target: e.target.value})} required placeholder="https://example.com"/></div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2 block">Frequency</label>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={()=>setForm({...form, frequency: 'daily'})} className={`px-6 py-2 rounded-lg text-sm font-bold border transition ${form.frequency==='daily' ? 'bg-black text-white' : 'border-black/10'}`}>Daily</button>
                                        <button type="button" onClick={()=>setForm({...form, frequency: 'weekly'})} className={`px-6 py-2 rounded-lg text-sm font-bold border transition ${form.frequency==='weekly' ? 'bg-black text-white' : 'border-black/10'}`}>Weekly</button>
                                    </div>
                                </div>
                                <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-md">Start Monitoring</button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MONITOR LIST */}
            <div className="grid md:grid-cols-2 gap-6">
                {monitors.map(m => (
                    <motion.div key={m.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#FDFBF7] p-6 rounded-[2rem] shadow-lg border border-white/50 relative overflow-hidden group hover:shadow-xl transition">
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-black/5"><Globe size={24}/></div>
                                <div>
                                    <h4 className="font-bold text-lg">{m.name}</h4>
                                    <p className="text-xs text-black/50 font-mono">{m.target}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 ${m.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                {m.status}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-xs text-black/60 font-bold mb-6 bg-white/50 p-3 rounded-xl">
                            <span className="flex items-center gap-1"><Clock size={14}/> {m.frequency.toUpperCase()}</span>
                            <span className="flex items-center gap-1"><Activity size={14}/> Last Check: {m.last_scan_at ? new Date(m.last_scan_at).toLocaleDateString() : 'Pending'}</span>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleRunNow(m.id)} 
                                disabled={processingId === m.id}
                                className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition flex justify-center gap-2 items-center disabled:opacity-70"
                            >
                                {processingId === m.id ? <Loader2 size={16} className="animate-spin"/> : <Play size={16} fill="currentColor"/>}
                                {processingId === m.id ? 'Scanning...' : 'Check Now'}
                            </button>
                            <button onClick={() => handleDelete(m.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition border border-red-100">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {monitors.length === 0 && !showForm && (
                <div className="text-center py-20 opacity-50">
                    <ShieldCheck size={48} className="mx-auto mb-4"/>
                    <p>No active monitors found.</p>
                </div>
            )}
        </div>
    );
}