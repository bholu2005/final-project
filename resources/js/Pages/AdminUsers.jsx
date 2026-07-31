import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Loader2, CheckCircle, Trash2, Shield, Mail, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Fetch Users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.get('http://127.0.0.1:8000/api/admin/users', { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete / Ban
    const handleDelete = async (id) => {
        if(!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            const token = sessionStorage.getItem('auth_token');
            await axios.post(`http://127.0.0.1:8000/api/admin/users/${id}/delete`, {}, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            // Remove from local list to avoid reload
            setUsers(users.filter(u => u.id !== id));
            alert("User deleted successfully.");
        } catch (error) {
            alert("Failed to delete user.");
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black/50" size={40}/></div>;

    return (
        <div className="bg-[#FDFBF7] p-8 rounded-[2rem] shadow-xl border border-white/50 min-h-[80vh]">
            
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-heading mb-1">User Management</h2>
                    <p className="text-black/50 text-sm">Total Users: <strong>{users.length}</strong></p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-3.5 text-black/30" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-xl focus:outline-none focus:border-black/20 transition shadow-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/5 text-[10px] uppercase text-black/50 font-bold tracking-widest">
                            <tr>
                                <th className="p-5">User Profile</th>
                                <th className="p-5">Plan</th>
                                <th className="p-5">Joined</th>
                                <th className="p-5">Role</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-sm">
                            <AnimatePresence>
                                {filteredUsers.map((u) => (
                                    <motion.tr 
                                        key={u.id} 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-gray-50 transition group"
                                    >
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg uppercase">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-black group-hover:text-blue-600 transition">{u.name}</p>
                                                    <p className="text-xs text-black/40 flex items-center gap-1"><Mail size={10}/> {u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                                u.plan_type === 'diamond' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                u.plan_type === 'free' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {u.plan_type}
                                            </span>
                                        </td>
                                        
                                        <td className="p-5 text-black/50 text-xs font-mono">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12}/> {new Date(u.created_at).toLocaleDateString()}
                                            </div>
                                        </td>

                                        <td className="p-5">
                                            {u.role === 'admin' ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 w-fit">
                                                    <Shield size={12} fill="currentColor"/> Admin
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 w-fit">
                                                    <CheckCircle size={12}/> User
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-5 text-right">
                                            {u.role !== 'admin' && (
                                                <button 
                                                    onClick={() => handleDelete(u.id)}
                                                    className="group flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-all duration-300 font-bold text-xs ml-auto border border-red-100 hover:border-red-600 shadow-sm"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} /> <span>Ban User</span>
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-black/40">No users found.</div>
                )}
            </div>
        </div>
    );
}