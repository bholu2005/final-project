import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Loader2, RefreshCw, AlertCircle, CheckCircle, Eye, EyeOff, Upload, Calendar, ArrowRight, ChevronDown } from 'lucide-react';

// ==========================================
// 🎨 UI COMPONENTS
// ==========================================

// 1. Pill Input (Login - White Background Pill to stand out on Beige)
const PillInput = ({ type, placeholder, value, onChange, icon: Icon, required = true, isPass = false, togglePass, showPass }) => (
    <div className="relative w-full">
        <input 
            type={isPass && !showPass ? 'password' : type} 
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-white border border-transparent focus:border-black text-gray-800 text-base rounded-full focus:ring-0 block py-4 px-6 shadow-sm transition-all placeholder-gray-400 outline-none"
        />
        {Icon && <Icon className="absolute right-6 top-4 text-gray-400 pointer-events-none" size={20} />}
        {isPass && (
            <button type="button" onClick={togglePass} className="absolute right-6 top-4 text-gray-400 hover:text-black transition">
                {showPass ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>
        )}
    </div>
);

// 2. Line Input (Signup - Stronger Border for visibility without container)
const LineInput = ({ type, placeholder, value, onChange, required = true, isPass = false }) => (
    <div className="relative w-full group mt-4">
        <input 
            type={isPass ? 'password' : type} 
            value={value}
            onChange={onChange}
            required={required}
            className="w-full border-b-2 border-black/20 py-3 text-lg bg-transparent text-black focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
            placeholder={placeholder}
        />
        <label className={`absolute left-0 top-3 text-black/50 text-sm transition-all duration-300 pointer-events-none 
            peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-focus:font-bold
            ${value ? '-top-4 text-xs text-black font-bold' : ''}
        `}>
            {placeholder}
        </label>
    </div>
);

// 3. Dropdown
const LineSelect = ({ label, value, onChange, options }) => (
    <div className="relative w-full group mt-4">
        <select 
            value={value} 
            onChange={onChange}
            className="w-full border-b-2 border-black/20 py-3 text-lg bg-transparent text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
        >
            {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
        <label className="absolute left-0 -top-4 text-xs text-black font-bold uppercase tracking-widest pointer-events-none">
            {label}
        </label>
        <ChevronDown className="absolute right-0 top-3 text-black/40 pointer-events-none" size={20} />
    </div>
);

// 4. Label Helper
const Label = ({ text }) => <label className="block mb-1 text-xs font-bold text-black/40 uppercase tracking-wider">{text}</label>;

// ==========================================
// 🚀 MAIN COMPONENT
// ==========================================

export default function AuthPage({ onLoginSuccess }) {
    const [view, setView] = useState('login'); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPass, setShowPass] = useState(false);

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', dob: '', 
        gender: 'Male', address: '', city: '', state: '', pincode: '',
        secQuestion: 'What is your born place?', secAnswer: '',
        password: '', profile_photo: null
    });

    const questions = [
        "What is your born place?",
        "What is your first pet's name?",
        "What is your mother's maiden name?",
        "What is your favorite teacher's name?"
    ];

    const [captcha, setCaptcha] = useState({ img: '', key: '' });
    const [captchaInput, setCaptchaInput] = useState('');
    const fileRef = useRef(null);

    // Refresh Captcha
    const refreshCaptcha = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/captcha');
            setCaptcha({ img: res.data.image, key: res.data.key });
            setCaptchaInput('');
        } catch (e) { 
            console.error("Captcha Error:", e);
            // Error handling agar GD library off ho
            setError("Server Error: Captcha failed. Enable GD Library in PHP.");
        }
    };

    useEffect(() => { refreshCaptcha(); }, []);

    // --- ACTIONS ---

    const handleLogin = async (e) => {
        e.preventDefault();
        if(!captchaInput) { setError('Enter captcha code.'); return; }
        setIsLoading(true); setError('');
        
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/login', loginData);
            sessionStorage.setItem('auth_token', res.data.token);
            sessionStorage.setItem('user_name', res.data.user.name);
            onLoginSuccess(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Credentials');
            refreshCaptcha();
        } finally { setIsLoading(false); }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true); setError(''); setSuccessMsg('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if(key === 'secQuestion') data.append('security_question', formData[key]);
            else if(key === 'secAnswer') data.append('security_answer', formData[key]);
            else if(key !== 'profile_photo') data.append(key, formData[key]);
        });
        if (formData.profile_photo) data.append('profile_photo', formData.profile_photo);

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccessMsg('Account Created! Redirecting...');
            sessionStorage.setItem('auth_token', res.data.token);
            sessionStorage.setItem('user_name', res.data.user.name);
            setTimeout(() => { onLoginSuccess(res.data.user); }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration Failed.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#E8D5C6] flex flex-col items-center justify-start pt-16 px-4 font-body">
            
            {/* LOGO & BRANDING (Top Center) */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-12"
            >
                <Hexagon size={60} className="text-black fill-black/10 mb-3 rotate-12" />
                <h1 className="font-heading text-5xl text-black tracking-wide">Merlin</h1>
                <p className="text-black/50 text-xs font-bold tracking-widest uppercase mt-2">Universal Security Platform</p>
            </motion.div>

            {/* ERROR / SUCCESS MESSAGES (Top) */}
            <div className="w-full max-w-md">
                {error && <div className="mb-6 p-4 bg-red-100/90 text-red-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm border border-red-200"><AlertCircle size={18}/> {error}</div>}
                {successMsg && <div className="mb-6 p-4 bg-green-100/90 text-green-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm border border-green-200"><CheckCircle size={18}/> {successMsg}</div>}
            </div>

            <AnimatePresence mode="wait">
                
                {/* ================= LOGIN FORM (NO CONTAINER) ================= */}
                {view === 'login' && (
                    <motion.div 
                        key="login"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-[400px] text-center"
                    >
                        <h2 className="font-heading text-4xl text-black mb-1">Sign In</h2>
                        <p className="text-black/50 text-sm mb-8">Enter your credentials to continue</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            
                            <PillInput type="email" placeholder="Email Address" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
                            <PillInput type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} isPass={true} showPass={showPass} togglePass={() => setShowPass(!showPass)} />

                            {/* Captcha */}
                            <div className="flex items-center gap-3 pt-2">
                                <input 
                                    type="text" 
                                    placeholder="CODE" 
                                    value={captchaInput}
                                    onChange={e => setCaptchaInput(e.target.value)}
                                    className="w-1/2 bg-white border-2 border-transparent focus:border-black text-black text-sm rounded-full py-4 px-6 text-center uppercase tracking-widest font-bold shadow-sm outline-none"
                                />
                                <div className="flex-1 h-[54px] bg-black/5 rounded-full border border-black/5 flex items-center justify-center overflow-hidden cursor-pointer" onClick={refreshCaptcha}>
                                    {captcha.img ? <img src={captcha.img} className="h-full object-cover opacity-60" alt="captcha"/> : <Loader2 className="animate-spin text-black/30"/>}
                                </div>
                                <button type="button" onClick={refreshCaptcha} className="p-3 text-black/40 hover:text-black bg-white rounded-full shadow-sm hover:shadow-md transition"><RefreshCw size={20}/></button>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-5 rounded-full text-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 mt-4">
                                {isLoading ? <Loader2 className="animate-spin"/> : <>Access Dashboard <ArrowRight size={20}/></>}
                            </button>
                        </form>

                        <p className="text-center text-black/50 mt-10">
                            New User? <button onClick={() => setView('signup')} className="text-black font-bold hover:underline ml-1">Create Account</button>
                        </p>
                    </motion.div>
                )}

                {/* ================= SIGNUP FORM (NO CONTAINER - Wider Layout) ================= */}
                {view === 'signup' && (
                    <motion.div 
                        key="signup"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-4xl"
                    >
                        <div className="mb-10 text-center">
                            <h2 className="font-heading text-4xl text-black mb-2">Create Account</h2>
                            <p className="text-black/50">Fill in the details below.</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-8">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <LineInput type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                <LineInput type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <LineInput type="tel" placeholder="Phone (10 Digits)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <div className="pt-4">
                                    <Label text="Date of Birth" />
                                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full border-b-2 border-black/20 py-2 bg-transparent outline-none focus:border-black transition-colors" />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Label text="GENDER" />
                                <div className="flex gap-4 mt-2">
                                    {['Male', 'Female', 'Other'].map(g => (
                                        <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})} className={`px-8 py-2 rounded-full border text-sm transition-all ${formData.gender === g ? 'bg-black text-white border-black' : 'bg-transparent text-black/50 border-black/20 hover:border-black'}`}>{g}</button>
                                    ))}
                                </div>
                            </div>

                            <LineInput type="text" placeholder="Residential Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <LineInput type="text" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                <LineInput type="text" placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                                <LineInput type="text" placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                                <LineSelect label="Security Question" value={formData.secQuestion} onChange={e => setFormData({...formData, secQuestion: e.target.value})} options={questions} />
                                <LineInput type="text" placeholder="Answer" value={formData.secAnswer} onChange={e => setFormData({...formData, secAnswer: e.target.value})} />
                            </div>

                            <div className="border-2 border-dashed border-black/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 transition mt-4" onClick={() => fileRef.current.click()}>
                                <Upload size={28} className="text-black/40 mb-2" />
                                <p className="text-sm font-bold text-black/50">{formData.profile_photo ? formData.profile_photo.name : "Upload Profile Photo (Optional)"}</p>
                                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => setFormData({...formData, profile_photo: e.target.files[0]})} />
                            </div>

                            <div>
                                <LineInput type="password" placeholder="Create Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} isPass={true} />
                                <p className="text-xs text-black/40 mt-2">Min 8 chars, 1 letter, 1 number, 1 symbol</p>
                            </div>

                            <div className="flex justify-center mt-10">
                                <button type="submit" disabled={isLoading} className="w-full md:w-1/2 bg-black text-white font-bold py-4 rounded-full text-lg shadow-xl transition-transform hover:scale-[1.01]">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'Create Account'}
                                </button>
                            </div>

                            <p className="text-center text-sm text-black/50 pb-10">
                                Already have an account? <button type="button" onClick={() => setView('login')} className="text-black font-bold hover:underline ml-1">Login here</button>
                            </p>
                        </form>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}