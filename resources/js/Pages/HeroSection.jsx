import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldAlert, Zap, BrainCircuit, Database, Code2, Globe,
    ArrowRight, Send, Heart, Code, Briefcase, Mail, CheckCircle
} from 'lucide-react';

// Animation Helper
const FadeUp = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: delay }}
    >
        {children}
    </motion.div>
);

export default function HeroSection({ onStartScan }) {
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => {
            setContactForm({ name: '', email: '', message: '' });
            setSent(false);
        }, 3000);
    };

    return (
        <div className="font-body text-black bg-[#E8D5C6]/40 min-h-screen">
            
            {/* ---------------------------------------------------- */}
            {/* 1️⃣ HERO SECTION (Main Entrance) */}
            {/* ---------------------------------------------------- */}
            <section className="relative pt-36 pb-16 md:pt-44 md:pb-24 px-4 md:px-6 flex flex-col items-center justify-center text-center">
                
                {/* Ambient Blur */}
                <div className="absolute top-10 left-[5%] w-[300px] h-[300px] bg-white/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-10 right-[5%] w-[400px] h-[400px] bg-black/5 rounded-full blur-[120px] pointer-events-none" />

                <FadeUp>
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 border border-black/10 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 bg-white/55 backdrop-blur-md shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                        Automated AI Defense Active
                    </span>
                    
                    <h1 className="font-heading text-6xl sm:text-8xl md:text-9xl mb-6 leading-none drop-shadow-sm px-2">
                        Secured Code.<br />
                        Defended Cloud.
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl text-black/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Merlin is a next-generation security sandbox combining deep static code analysis (SAST), database schema mapping, and automated AI fix generation to immunize your codebases in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-6 max-w-md mx-auto">
                        <button
                            onClick={onStartScan}
                            className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition shadow-xl flex items-center justify-center gap-3 group"
                        >
                            Deploy Sandbox Audit
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </FadeUp>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 2️⃣ STATS BANNER */}
            {/* ---------------------------------------------------- */}
            <section className="py-10 border-y border-black/5 bg-white/45 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Security Audits Executed', value: '15,480+' },
                        { label: 'Remediation Patches Fixed', value: '3,890+' },
                        { label: 'Vulnerabilities Tracked', value: '185K+' },
                        { label: 'Standard Compliances', value: 'OWASP-10' },
                    ].map((stat, idx) => (
                        <div key={idx} className="p-2">
                            <h3 className="font-heading text-4xl md:text-5xl font-bold mb-1">{stat.value}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-black/50 font-bold">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 3️⃣ DETAILED PROCESS LAYERS */}
            {/* ---------------------------------------------------- */}
            <section className="py-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <FadeUp>
                        <div className="text-center mb-16">
                            <span className="text-[10px] font-bold tracking-widest uppercase bg-black text-white px-3 py-1 rounded-full">Core Technologies</span>
                            <h2 className="font-heading text-4xl md:text-6xl mt-4 mb-4">Under The Hood</h2>
                            <p className="text-black/60 max-w-xl mx-auto text-sm md:text-base">
                                Merlin runs fully sandboxed environments to safely deconstruct, test, and audit file repositories.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Code2,
                                title: "Static SAST Audit",
                                desc: "Decompresses ZIP files and parses every raw code file through customized AST regex engines to locate OWASP threats, SQLi inputs, and XSS leaks.",
                                badge: "Source Code"
                            },
                            {
                                icon: Globe,
                                title: "Live DAST Scanner",
                                desc: "Crawls live domains to inspect SSL status, security response headers (CSP, HSTS), and detect vulnerable server infrastructure dynamically.",
                                badge: "Endpoint Web"
                            },
                            {
                                icon: Database,
                                title: "Database Schema Analyzer",
                                desc: "Accepts raw MySQL/SQLite files to audit indexes, flag insecure default user passwords, and optimize tables mapping layout.",
                                badge: "Data Store"
                            }
                        ].map((tech, idx) => (
                            <FadeUp key={idx} delay={idx * 0.1}>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-lg flex flex-col justify-between h-full group hover:shadow-xl transition-all">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition duration-300">
                                                <tech.icon size={24} />
                                            </div>
                                            <span className="text-[9px] font-bold bg-gray-100 text-black/60 uppercase tracking-widest px-2.5 py-1 rounded-full">{tech.badge}</span>
                                        </div>
                                        <h3 className="font-heading text-2xl mb-3">{tech.title}</h3>
                                        <p className="text-black/60 text-xs leading-relaxed">{tech.desc}</p>
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-black/5 text-[10px] font-bold text-black/40 uppercase tracking-wider">Engine Automated</div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 4️⃣ CREATOR & AGENCY BIO SECTION */}
            {/* ---------------------------------------------------- */}
            <section className="py-20 px-6 bg-white/50 backdrop-blur-md border-y border-black/5">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Bio Text */}
                    <div className="lg:col-span-7 space-y-6">
                        <span className="text-[10px] font-bold tracking-widest uppercase bg-green-100 text-green-800 border border-green-200 px-3.5 py-1 rounded-full">Engineering Labs</span>
                        <h2 className="font-heading text-4xl md:text-5xl leading-tight">Crafted by Merlin Labs</h2>
                        <p className="text-black/75 text-sm leading-relaxed">
                            Merlin was conceptualized and built by a dedicated team of Cybersecurity Architects, Fullstack Engineers, and AI developers. Our goal is to democratize source code threat analysis, enabling startup development teams to patch critical vulnerabilities in real-time.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex gap-3">
                                <div className="p-2 bg-black text-white rounded-lg h-9 w-9 flex items-center justify-center shrink-0"><Code size={18}/></div>
                                <div>
                                    <h4 className="font-bold text-sm">Clean Architecture</h4>
                                    <p className="text-[11px] text-black/50">Optimized with clean Laravel routing and React hooks.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="p-2 bg-black text-white rounded-lg h-9 w-9 flex items-center justify-center shrink-0"><Briefcase size={18}/></div>
                                <div>
                                    <h4 className="font-bold text-sm">Enterprise Delivery</h4>
                                    <p className="text-[11px] text-black/50">Designed to support automated corporate pipeline setups.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team bio Card */}
                    <div className="lg:col-span-5 bg-black text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-skin/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <h3 className="font-heading text-2xl mb-6 text-skin">Developer Directory</h3>

                        <div className="space-y-4">
                            {[
                                { name: "Aarav Sharma", role: "Principal Security Architect", link: "@aaravsec" },
                                { name: "Merlin Labs", role: "AI Research & Systems Agency", link: "github.com/merlin-labs" }
                            ].map((dev, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-xs">{dev.name}</h4>
                                        <p className="text-[10px] text-white/50">{dev.role}</p>
                                    </div>
                                    <span className="text-[10px] font-mono text-skin">{dev.link}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] text-white/40 flex items-center gap-1.5"><Heart size={10} className="fill-red-500 text-red-500"/> Built with perfection</span>
                            <span className="text-xs font-bold text-skin">v2.0.0 Stable</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 5️⃣ QUICK CONTACT FORM */}
            {/* ---------------------------------------------------- */}
            <section className="py-20 px-4 md:px-6 max-w-3xl mx-auto">
                <FadeUp>
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-black/5">
                        <div className="text-center mb-8">
                            <h3 className="font-heading text-3xl mb-1">Get In Touch</h3>
                            <p className="text-black/50 text-xs">Request custom security analysis reports or agency audits</p>
                        </div>

                        {sent ? (
                            <div className="p-8 text-center bg-green-50 text-green-800 rounded-3xl border border-green-200">
                                <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
                                <h4 className="font-heading text-xl">Inquiry Sent Successfully</h4>
                                <p className="text-xs text-green-600/80 mt-1">Our cybersecurity agents will review your metadata shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        value={contactForm.name}
                                        onChange={e => setContactForm({...contactForm, name: e.target.value})}
                                        className="p-3 bg-gray-50 border border-transparent focus:border-black rounded-xl text-xs outline-none transition"
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email Address"
                                        value={contactForm.email}
                                        onChange={e => setContactForm({...contactForm, email: e.target.value})}
                                        className="p-3 bg-gray-50 border border-transparent focus:border-black rounded-xl text-xs outline-none transition"
                                    />
                                </div>
                                <textarea
                                    required
                                    placeholder="Your message regarding sandbox setups..."
                                    rows={4}
                                    value={contactForm.message}
                                    onChange={e => setContactForm({...contactForm, message: e.target.value})}
                                    className="p-3 bg-gray-50 border border-transparent focus:border-black rounded-xl text-xs outline-none transition w-full resize-none"
                                />
                                <button type="submit" className="w-full py-3.5 bg-black hover:bg-gray-900 transition text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                                    <Send size={12}/> Dispatch Secure Inquiry
                                </button>
                            </form>
                        )}
                    </div>
                </FadeUp>
            </section>

        </div>
    );
}
