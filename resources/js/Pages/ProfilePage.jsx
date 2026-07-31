import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Camera, Save, MapPin, Phone, Calendar, Crown, Mail, Loader2, CheckCircle, ArrowLeft, Pencil } from 'lucide-react';

// ==========================================
// 🧩 COMPONENT DEFINED OUTSIDE (Fixes Typing Bug)
// ==========================================

const ProfileInput = ({ label, value, onChange, type = "text", placeholder, disabled, max }) => (
    <div className="group relative w-full">
        <label className="text-[10px] md:text-xs font-bold text-black/40 uppercase tracking-widest mb-1 block">
            {label}
        </label>
        <input 
            type={type} 
            value={value || ''} // Handle null values
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            max={max} // For Date validation
            className={`w-full bg-transparent border-b py-2 text-base md:text-lg text-black font-medium focus:outline-none transition-colors placeholder-black/20
                ${disabled ? 'border-transparent cursor-default text-black/70' : 'border-black/20 focus:border-black'}
            `}
            // Date Picker specific styles
            style={type === 'date' ? { colorScheme: 'light', minHeight: '40px' } : {}}
            // Open calendar on click if enabled
            onClick={(e) => { if(type === 'date' && !disabled && e.target.showPicker) e.target.showPicker(); }}
        />
    </div>
);

// ==========================================
// 🚀 MAIN PROFILE PAGE COMPONENT
// ==========================================

export default function ProfilePage({ onBack }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Toggle State: Default false (Locked)
    const [isEditing, setIsEditing] = useState(false);

    const fileRef = useRef(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '', phone: '', dob: '', gender: '',
        address: '', city: '', state: '', pincode: '',
        email: '', 
        profile_photo: null, photo_preview: null
    });

    const today = new Date().toISOString().split("T")[0];

    // 1. Fetch User Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = sessionStorage.getItem('auth_token');
                const res = await axios.get('http://127.0.0.1:8000/api/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const u = res.data.user;
                if (u) {
                    setFormData({
                        name: u.name || '',
                        email: u.email || '',
                        phone: u.phone || '',
                        dob: u.dob || '',
                        gender: u.gender || '',
                        address: u.address || '',
                        city: u.city || '',
                        state: u.state || '',
                        pincode: u.pincode || '',
                        photo_preview: u.profile_photo ? `/storage/${u.profile_photo}` : null
                    });
                }
            } catch (err) {
                console.error("Profile Fetch Error:", err);
                setError("Could not load profile data.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 2. Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                profile_photo: file,
                photo_preview: URL.createObjectURL(file)
            });
        }
    };

    // 3. Handle Edit / Save Logic
    const handleAction = async (e) => {
        e.preventDefault();

        // If not editing, enable edit mode
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        // If editing, save data
        setSaving(true);
        setMessage('');
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'photo_preview' || key === 'email') return;
            if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            const token = sessionStorage.getItem('auth_token');
            const res = await axios.post('http://127.0.0.1:8000/api/profile/update', data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setMessage('Profile Saved Successfully!');
            if(res.data.user.name) sessionStorage.setItem('user_name', res.data.user.name);
            
            setIsEditing(false); // Lock Form
            setTimeout(() => setMessage(''), 3000);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save data.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#E8D5C6]"><Loader2 size={40} className="animate-spin text-black"/></div>;

    return (
        <div className="min-h-screen bg-[#E8D5C6] font-body text-black p-4 md:p-8 flex flex-col">
            
            {/* BACK BUTTON */}
            <div className="max-w-7xl mx-auto w-full mb-4 md:mb-6">
                <button onClick={onBack} className="flex items-center gap-2 bg-white/50 hover:bg-white text-black px-4 py-2 rounded-full font-bold transition-all shadow-sm text-sm md:text-base">
                    <ArrowLeft size={18} /> Back Home
                </button>
            </div>

            {/* MAIN CARD */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#FDFBF7] w-full max-w-7xl mx-auto rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col lg:flex-row min-h-[auto] lg:min-h-[700px]"
            >
                
                {/* LEFT SIDE */}
                <div className="w-full lg:w-5/12 bg-[#DFA895]/20 relative p-8 md:p-12 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/50">
                    <div className="hidden lg:block absolute top-[-20%] left-[-20%] w-[500px] h-[500px] border border-black/5 rounded-full pointer-events-none"></div>
                    
                    <div className="relative z-10 text-center">
                        <div className="relative w-40 h-40 md:w-56 md:h-56 mx-auto mb-6 group">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-200 relative">
                                {formData.photo_preview ? (
                                    <img src={formData.photo_preview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-black/20"><User size={60} /></div>
                                )}
                            </div>
                            
                            {/* Camera Icon - Only visible in Edit Mode */}
                            {isEditing && (
                                <>
                                    <button onClick={() => fileRef.current.click()} className="absolute bottom-2 right-2 bg-black text-white p-2 md:p-3 rounded-full hover:scale-110 transition shadow-lg z-20">
                                        <Camera size={18} />
                                    </button>
                                    <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </>
                            )}
                        </div>

                        <h2 className="font-heading text-3xl md:text-4xl mb-2 text-black break-words max-w-xs mx-auto">{formData.name || 'User'}</h2>
                        
                        <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-md">
                            <Crown size={12} className="text-yellow-400 fill-current" /> Premium Member
                        </div>

                        <div className="mt-6 md:mt-8 space-y-2 text-black/60 text-sm font-medium">
                            <p className="flex items-center justify-center gap-2 break-all"><Mail size={14} className="shrink-0"/> {formData.email}</p>
                            <p className="flex items-center justify-center gap-2"><MapPin size={14} className="shrink-0"/> {formData.city ? `${formData.city}, ${formData.state}` : 'Location not set'}</p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE (Form) */}
                <div className="w-full lg:w-7/12 p-6 md:p-12 lg:p-16 relative bg-white">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
                        <h3 className="font-heading text-2xl md:text-3xl">My Profile</h3>
                        <div>
                            {message && <span className="text-green-600 text-xs md:text-sm font-bold flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full"><CheckCircle size={14}/> {message}</span>}
                            {error && <span className="text-red-600 text-xs md:text-sm font-bold flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full"><Loader2 size={14}/> {error}</span>}
                        </div>
                    </div>

                    <form onSubmit={handleAction} className="space-y-8 md:space-y-10 pb-24 lg:pb-0">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                            <ProfileInput label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter Name" disabled={!isEditing} />
                            <ProfileInput label="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" disabled={!isEditing} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                            <ProfileInput 
                                label="Date of Birth" 
                                type="date" 
                                value={formData.dob} 
                                onChange={e => setFormData({...formData, dob: e.target.value})} 
                                disabled={!isEditing}
                                max={today}
                            />
                            
                            <div className="group relative w-full">
                                <label className="text-[10px] md:text-xs font-bold text-black/40 uppercase tracking-widest mb-1 block">Gender</label>
                                <select 
                                    value={formData.gender} 
                                    onChange={e => setFormData({...formData, gender: e.target.value})}
                                    disabled={!isEditing}
                                    className={`w-full bg-transparent border-b py-2 text-base md:text-lg text-black font-medium focus:outline-none transition-colors appearance-none
                                        ${!isEditing ? 'border-transparent cursor-default opacity-80' : 'border-black/20 focus:border-black cursor-pointer'}
                                    `}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <ProfileInput label="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="House No, Street Area" disabled={!isEditing} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <ProfileInput label="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="City" disabled={!isEditing} />
                            <ProfileInput label="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="State" disabled={!isEditing} />
                            <ProfileInput label="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} placeholder="123456" disabled={!isEditing} />
                        </div>

                        <div className="fixed bottom-0 right-0 lg:absolute lg:bottom-0 lg:right-0 z-20">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className={`
                                    text-white text-xl font-bold py-6 px-12 lg:py-8 lg:px-16 
                                    rounded-tl-[3rem] shadow-[-5px_-5px_20px_rgba(0,0,0,0.1)] 
                                    flex items-center gap-3 disabled:opacity-70 transition-all duration-300
                                    ${isEditing 
                                        ? 'bg-black hover:bg-gray-900' 
                                        : 'bg-[#DFA895] hover:bg-[#c68e7d]'
                                    }
                                `}
                                style={{ width: window.innerWidth < 1024 ? '100vw' : 'auto', borderRadius: window.innerWidth < 1024 ? '0' : '3rem 0 2rem 0' }}
                            >
                                {saving ? <Loader2 className="animate-spin"/> : (
                                    isEditing ? <> <Save size={24}/> Save Changes </> : <> <Pencil size={24}/> Edit Profile </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

            </motion.div>
        </div>
    );
}