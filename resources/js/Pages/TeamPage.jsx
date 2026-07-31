import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, UserPlus, Trash2, ArrowLeft, Loader2, Shield, Code, CheckCircle, Mail } from 'lucide-react';

export default function TeamPage({ onBack }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    
    const [form, setForm] = useState({ name: '', email: '', role: 'viewer' });
    const [msg, setMsg] = useState('');

    const token = sessionStorage.getItem('auth_token');

    // 1. Fetch Team
    const fetchTeam = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/team', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setMembers(res.data.data);
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { fetchTeam(); }, []);

    // 2. Add Member
    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);
        setMsg('');

        try {
            await axios.post('http://127.0.0.1:8000/api/team/add', form, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setMsg('Member Added Successfully!');
            setForm({ name: '', email: '', role: 'viewer' });
            fetchTeam();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) { 
            setMsg('Failed to add member.'); 
        } finally { 
            setAdding(false); 
        }
    };

    // 3. Remove Member
    const handleRemove = async (id) => {
        if(!confirm("Are you sure you want to remove this member?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/api/team/${id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchTeam();
        } catch (err) { alert("Failed to remove member"); }
    };

    return (
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto min-h-screen font-body text-black">
            
            <div className="mb-8">
                 <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-black/50 hover:text-black transition">
                    <ArrowLeft size={16} /> Back to Settings
                </button>
            </div>

            <div className="grid md:grid-cols-12 gap-10 items-start">
                
                {/* LEFT: Add Form */}
                <div className="md:col-span-5 bg-white p-8 rounded-[2rem] shadow-xl border border-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><UserPlus size={100} /></div>

                    <h3 className="font-heading text-3xl mb-6">Invite Member</h3>
                    
                    {msg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle size={16}/> {msg}</div>}

                    <form onSubmit={handleAdd} className="space-y-6 relative z-10">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1 block">Full Name</label>
                            <input type="text" className="w-full border-b-2 border-black/10 py-2 bg-transparent outline-none focus:border-black transition font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1 block">Email Address</label>
                            <input type="email" className="w-full border-b-2 border-black/10 py-2 bg-transparent outline-none focus:border-black transition font-medium" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="john@company.com" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-black/40 mb-1 block">Access Role</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setForm({...form, role: 'viewer'})} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition ${form.role === 'viewer' ? 'border-black bg-black text-white' : 'border-transparent bg-gray-100 hover:bg-gray-200'}`}>Viewer</button>
                                <button type="button" onClick={() => setForm({...form, role: 'developer'})} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition ${form.role === 'developer' ? 'border-black bg-black text-white' : 'border-transparent bg-gray-100 hover:bg-gray-200'}`}>Developer</button>
                                <button type="button" onClick={() => setForm({...form, role: 'admin'})} className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition ${form.role === 'admin' ? 'border-black bg-black text-white' : 'border-transparent bg-gray-100 hover:bg-gray-200'}`}>Admin</button>
                            </div>
                        </div>
                        <button disabled={adding} className="w-full bg-black text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:scale-[1.02] transition shadow-lg mt-2">
                            {adding ? <Loader2 className="animate-spin"/> : <><Mail size={18}/> Send Invite</>}
                        </button>
                    </form>
                </div>

                {/* RIGHT: Team List */}
                <div className="md:col-span-7">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-heading text-4xl">Team Members</h2>
                        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">{members.length} Active</span>
                    </div>

                    {loading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-black/30"/></div> : (
                        <div className="space-y-4">
                            {members.length === 0 ? <div className="text-center py-20 bg-white/50 rounded-2xl border border-black/5"><Users size={32} className="mx-auto text-black/20 mb-2"/><p className="text-black/40">No team members added yet.</p></div> : members.map((m) => (
                                <div key={m.id} className="bg-white p-5 rounded-2xl shadow-sm border border-black/5 flex items-center justify-between group hover:border-black/20 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-skin/20 rounded-full flex items-center justify-center text-black font-bold text-lg border-2 border-white shadow-sm uppercase">
                                            {m.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{m.name}</h4>
                                            <p className="text-sm text-black/50">{m.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${m.role === 'developer' ? 'bg-blue-100 text-blue-700' : m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {m.role === 'developer' ? <Code size={12}/> : m.role === 'admin' ? <Shield size={12}/> : <Users size={12}/>} {m.role}
                                        </span>
                                        <button onClick={() => handleRemove(m.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}