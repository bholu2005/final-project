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
            type={isPass ? (showPass ? 'text' : 'password') : type}
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
        <div className="min-h-screen w-full bg-[#E8D5C6] relative flex flex-col items-center justify-start pt-12 pb-16 px-4 font-body overflow-y-auto">
            
            {/* Decorative Ambient Background Glows */}
            <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] bg-white/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-black/5 rounded-full blur-[150px] pointer-events-none" />

            {/* LOGO & BRANDING (Top Center) */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-8 relative z-10"
            >
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/10 rotate-3 hover:rotate-0 transition-transform duration-300 mb-3 cursor-pointer">
                    <Hexagon size={32} className="text-white fill-white/20" />
                </div>
                <h1 className="font-heading text-4xl text-black tracking-wide">Merlin Security</h1>
                <p className="text-black/50 text-[10px] font-bold tracking-widest uppercase mt-1">Universal Threat Detection Engine</p>
            </motion.div>

            {/* ERROR / SUCCESS MESSAGES (Top) */}
            <div className="w-full max-w-md relative z-10">
                {error && <div className="mb-4 p-4 bg-red-100/90 text-red-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm border border-red-200"><AlertCircle size={16}/> {error}</div>}
                {successMsg && <div className="mb-4 p-4 bg-green-100/90 text-green-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm border border-green-200"><CheckCircle size={16}/> {successMsg}</div>}
            </div>

            <AnimatePresence mode="wait">
                
                {/* ================= LOGIN FORM (ELEGANT CONTAINER) ================= */}
                {view === 'login' && (
                    <motion.div 
                        key="login"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-[440px] bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-2xl relative z-10"
                    >
                        <div className="text-center mb-6">
                            <h2 className="font-heading text-3xl text-black mb-1">Access Terminal</h2>
                            <p className="text-black/50 text-xs font-bold uppercase tracking-wider">Authorize scanning parameters</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            
                            <PillInput type="email" placeholder="Email Address" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} />
                            <PillInput type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} isPass={true} showPass={showPass} togglePass={() => setShowPass(!showPass)} />

                            {/* Beautiful Responsive Captcha Container */}
                            <div className="bg-white/50 p-3.5 rounded-3xl border border-black/5 space-y-3">
                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest block text-center">Identity Verification</span>
                                <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                                    <input
                                        type="text"
                                        placeholder="CODE"
                                        value={captchaInput}
                                        onChange={e => setCaptchaInput(e.target.value)}
                                        className="w-full sm:w-1/3 bg-white border border-transparent focus:border-black text-black text-sm rounded-2xl py-3 px-4 text-center uppercase tracking-widest font-bold shadow-sm outline-none transition"
                                    />
                                    <div className="flex-1 h-[46px] bg-black/5 rounded-2xl border border-black/5 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner" onClick={refreshCaptcha}>
                                        {captcha.img ? <img src={captcha.img} className="h-full w-full object-contain opacity-70 hover:opacity-100 transition duration-300" alt="captcha"/> : <Loader2 className="animate-spin text-black/30" size={16}/>}
                                    </div>
                                    <button type="button" onClick={refreshCaptcha} className="p-3 text-black/40 hover:text-black hover:bg-white rounded-2xl shadow-sm transition flex items-center justify-center"><RefreshCw size={16}/></button>
                                </div>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-black text-white font-bold py-3.5 rounded-full text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                                {isLoading ? <Loader2 className="animate-spin"/> : <>Access Dashboard <ArrowRight size={16}/></>}
                            </button>
                        </form>

                        {/* Divider Line */}
                        <div className="my-5 flex items-center justify-center gap-3">
                            <span className="h-px bg-black/10 flex-grow"></span>
                            <span className="text-[9px] font-bold text-black/40 uppercase tracking-widest">Or continue with</span>
                            <span className="h-px bg-black/10 flex-grow"></span>
                        </div>

                        {/* Continue with Google & GitHub (With beautiful brand SVGs) */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    alert("Google authentication simulation successfully launched.");
                                    setLoginData({ email: "admin@merlin.com", password: "password" });
                                    setCaptchaInput("MOCK");
                                    setCaptcha({ img: "mock", key: "mock" });
                                }}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-gray-50 border border-black/5 rounded-2xl font-bold text-xs transition duration-300 shadow-sm hover:scale-[1.02]"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.1 9 5 12 5z"/>
                                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/>
                                    <path fill="#FBBC05" d="M5.6 10.3c-.2-.7-.3-1.5-.3-2.3s.1-1.6.3-2.3L1.9 2.8C.7 5 0 7.4 0 10s.7 5 1.9 7.2l3.7-2.9z"/>
                                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"/>
                                </svg>
                                Google
                            </button>
                            <button
                                onClick={() => {
                                    alert("GitHub authentication simulation successfully launched.");
                                    setLoginData({ email: "admin@merlin.com", password: "password" });
                                    setCaptchaInput("MOCK");
                                    setCaptcha({ img: "mock", key: "mock" });
                                }}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-[#24292e] text-white hover:bg-black rounded-2xl font-bold text-xs transition duration-300 shadow-sm hover:scale-[1.02]"
                            >
                                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                                </svg>
                                GitHub
                            </button>
                        </div>

                        <p className="text-center text-xs text-black/50 mt-6">
                            New operator? <button onClick={() => setView('signup')} className="text-black font-bold hover:underline ml-1">Create Account</button>
                        </p>
                    </motion.div>
                )}

                {/* ================= SIGNUP FORM (ELEGANT WIDE CONTAINER) ================= */}
                {view === 'signup' && (
                    <motion.div 
                        key="signup"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-4xl bg-white/70 backdrop-blur-xl p-10 md:p-12 rounded-[3rem] border border-white/60 shadow-2xl relative z-10"
                    >
                        <div className="mb-8 text-center">
                            <h2 className="font-heading text-3xl text-black mb-1">Create Account</h2>
                            <p className="text-black/50 text-xs">Register your organization credentials</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-6">
                            
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

                            <div className="flex justify-center mt-8">
                                <button type="submit" disabled={isLoading} className="w-full md:w-1/2 bg-black text-white font-bold py-4 rounded-full text-base shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]">
                                    {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'Deploy Account'}
                                </button>
                            </div>

                            <p className="text-center text-xs text-black/50">
                                Already registered? <button type="button" onClick={() => setView('login')} className="text-black font-bold hover:underline ml-1">Login here</button>
                            </p>
                        </form>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}