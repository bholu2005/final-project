import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Loader2, CheckCircle, MessageSquare, Clock, User, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Tickets
    const fetchTickets = async () => {
        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.get('http://127.0.0.1:8000/api/admin/tickets', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setTickets(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    // Handle Close Ticket
    const handleClose = async (id) => {
        if(!confirm("Mark this ticket as resolved?")) return;

        try {
            const token = sessionStorage.getItem('auth_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/tickets/${id}/close`, {}, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Optimistic Update
            setTickets(tickets.map(t => t.id === id ? { ...t, status: 'closed' } : t));
        } catch (error) {
            alert("Failed to close ticket.");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black/50" size={40}/></div>;

    return (
        <div className="bg-[#FDFBF7] p-8 rounded-[2rem] shadow-xl border border-white/50 min-h-[80vh]">
            
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-black text-white rounded-2xl"><Ticket size={24}/></div>
                <div>
                    <h2 className="text-3xl font-heading">Support Desk</h2>
                    <p className="text-black/50 text-sm">Manage user inquiries and issues.</p>
                </div>
            </div>

            <div className="space-y-4">
                {tickets.length === 0 ? (
                    <div className="text-center py-20 text-black/40 bg-white rounded-2xl border border-black/5">No tickets found.</div>
                ) : (
                    tickets.map((t) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={t.id} 
                            className={`p-6 rounded-2xl border transition-all ${
                                t.status === 'open' 
                                ? 'bg-white border-black/5 hover:border-black/20 hover:shadow-md' 
                                : 'bg-gray-50 border-transparent opacity-70'
                            }`}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 p-2 rounded-lg ${t.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {t.priority === 'high' ? <AlertCircle size={16}/> : <MessageSquare size={16}/>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-black">{t.subject}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-black/50">
                                            <span className="flex items-center gap-1"><User size={12}/> {t.user?.name || 'Unknown'}</span>
                                            <span className="flex items-center gap-1"><Clock size={12}/> {new Date(t.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        t.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl text-sm text-black/70 leading-relaxed border border-black/5 mb-4">
                                {t.message}
                            </div>

                            {/* Action Area */}
                            {t.status === 'open' && (
                                <div className="flex justify-end pt-2 border-t border-black/5">
                                    <button 
                                        onClick={() => handleClose(t.id)} 
                                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-xs font-bold shadow-md hover:scale-105 active:scale-95"
                                    >
                                        <CheckCircle size={14} /> Mark as Resolved
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}