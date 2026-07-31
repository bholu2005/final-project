import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LifeBuoy, Send, ArrowLeft, Loader2, MessageSquare, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function SupportPage({ onBack }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
    const [msg, setMsg] = useState(null); // Object: { type: 'success'|'error', text: '' }

    // Fetch Tickets Function
    const fetchTickets = async () => {
        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.get('http://127.0.0.1:8000/api/support/history', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setTickets(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    // Create Ticket Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setMsg(null);

        const token = sessionStorage.getItem('auth_token');
        if (!token) {
            setMsg({ type: 'error', text: 'Session Expired. Please Login.' });
            setSending(false);
            return;
        }

        try {
            await axios.post('http://127.0.0.1:8000/api/support/create', form, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            setMsg({ type: 'success', text: 'Ticket Created Successfully!' });
            setForm({ subject: '', message: '', priority: 'medium' });
            fetchTickets(); // Refresh List
            
            setTimeout(() => setMsg(null), 4000);
        } catch (err) {
            const errorText = err.response?.data?.message || 'Failed to create ticket.';
            setMsg({ type: 'error', text: errorText });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen font-body text-black">
            
            <div className="mb-8">
                 <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-black/50 hover:text-black transition">
                    <ArrowLeft size={16} /> Back to Settings
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
                
                {/* 1. LEFT: Form */}
                <div className="bg-[#FDFBF7] p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-white/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><LifeBuoy size={150} /></div>
                    
                    <h2 className="font-heading text-4xl mb-6">New Request</h2>
                    
                    {msg && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {msg.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>} {msg.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="group">
                            <label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-1 block">Subject</label>
                            <input 
                                type="text" 
                                className="w-full bg-transparent border-b-2 border-black/10 py-3 text-lg focus:outline-none focus:border-black transition font-medium placeholder-black/20" 
                                value={form.subject} 
                                onChange={e => setForm({...form, subject: e.target.value})} 
                                required 
                                placeholder="E.g. Payment Issue" 
                            />
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-1 block">Priority</label>
                            <div className="flex gap-3">
                                {['low', 'medium', 'high'].map(p => (
                                    <button
                                        type="button"
                                        key={p}
                                        onClick={() => setForm({...form, priority: p})}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition capitalize border-2 ${form.priority === p ? 'border-black bg-black text-white' : 'border-transparent bg-gray-100 text-black/60 hover:bg-gray-200'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-xs font-bold uppercase tracking-widest text-black/50 mb-1 block">Message</label>
                            <textarea 
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-black/20 rounded-2xl p-4 outline-none transition h-40 resize-none text-base" 
                                value={form.message} 
                                onChange={e => setForm({...form, message: e.target.value})} 
                                required 
                                placeholder="Describe your issue in detail..." 
                            />
                        </div>

                        <button 
                            disabled={sending} 
                            className="w-full bg-black text-white py-4 rounded-xl font-bold flex justify-center gap-3 hover:scale-[1.02] transition shadow-lg disabled:opacity-70"
                        >
                            {sending ? <Loader2 className="animate-spin"/> : <><Send size={20}/> Submit Ticket</>}
                        </button>
                    </form>
                </div>

                {/* 2. RIGHT: History */}
                <div className="bg-[#FDFBF7] p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-white/50 flex flex-col h-[700px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-heading text-4xl">History</h2>
                        <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-bold">{tickets.length}</span>
                    </div>

                    {loading ? <div className="flex-grow flex items-center justify-center"><Loader2 className="animate-spin text-black/40" size={32}/></div> : (
                        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {tickets.length === 0 ? (
                                <div className="text-center py-20 text-black/40 text-sm">No tickets found.</div>
                            ) : (
                                tickets.map(t => (
                                    <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 hover:border-black/20 transition group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg group-hover:underline decoration-2 underline-offset-2">{t.subject}</h4>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${t.priority === 'high' ? 'bg-red-100 text-red-600' : t.priority === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {t.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-black/60 line-clamp-2 leading-relaxed mb-4">{t.message}</p>
                                        <div className="pt-4 border-t border-black/5 flex justify-between text-xs text-black/40 font-mono">
                                            <span className="flex items-center gap-1"><MessageSquare size={12}/> #{t.id}</span>
                                            <span className="flex items-center gap-1"><Clock size={12}/> {new Date(t.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}