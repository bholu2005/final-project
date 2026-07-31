import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, BrainCircuit, Database, Code2, Globe, ArrowRight } from 'lucide-react';

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
    return (
        <div className="font-body text-black">
            
            {/* ---------------------------------------------------- */}
            {/* 1️⃣ HERO SECTION (Main Entrance) */}
            {/* ---------------------------------------------------- */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-32 px-4 md:px-6 min-h-[85vh] flex flex-col items-center justify-center text-center">
                
                {/* Background Blobs */}
                <div className="hidden md:block absolute top-0 left-[-10%] w-[500px] h-[500px] bg-white/30 rounded-full blur-[100px] pointer-events-none" />
                <div className="hidden md:block absolute bottom-0 right-[-10%] w-[500px] h-[500px] bg-black/5 rounded-full blur-[100px] pointer-events-none" />

                <FadeUp>
                    <span className="inline-flex items-center gap-2 py-1 px-4 border border-black/10 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6 bg-white/40 backdrop-blur-md shadow-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Version 2.0 Live
                    </span>
                    
                    <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-6 leading-[1.1] drop-shadow-sm px-2">
                        System Secure
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-2xl text-black/70 mb-8 md:mb-12 max-w-xs sm:max-w-2xl mx-auto leading-relaxed">
                        The Ultimate <span className="font-bold text-black bg-white/50 px-1 rounded">AI-Powered</span> Testing Ecosystem.<br className="hidden md:block"/>
                        We analyze Source Code, Databases, and Live URLs to detect vulnerabilities before hackers do.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-6">
                        <button onClick={onStartScan} className="w-full sm:w-auto bg-black text-white px-8 md:px-10 py-4 rounded-full font-bold text-base md:text-lg hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3 group">
                            Start New Scan 
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto bg-white text-black px-8 md:px-10 py-4 rounded-full font-bold text-base md:text-lg border border-black/10 hover:bg-gray-50 transition-colors shadow-lg">
                            Upload ZIP
                        </button>
                    </div>
                </FadeUp>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 2️⃣ STATS BAR */}
            {/* ---------------------------------------------------- */}
            <section className="py-8 md:py-12 border-y border-black/5 bg-white/40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
                    {[
                        { label: 'Scans Performed', value: '10k+' },
                        { label: 'Vulnerabilities Fixed', value: '850+' },
                        { label: 'Lines of Code', value: '5M+' },
                        { label: 'Security Rating', value: 'A+' },
                    ].map((stat, index) => (
                        <div key={index} className="p-2">
                            <h3 className="font-heading text-3xl md:text-5xl font-bold mb-1 md:mb-2">{stat.value}</h3>
                            <p className="text-[10px] md:text-xs uppercase tracking-widest text-black/50 font-bold">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 3️⃣ FEATURES GRID */}
            {/* ---------------------------------------------------- */}
            <section className="py-16 md:py-24 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <FadeUp>
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="font-heading text-4xl md:text-6xl mb-4">Powerful Engines</h2>
                            <p className="text-black/60 max-w-xl mx-auto text-base md:text-lg px-4">
                                Our system runs multiple specialized engines simultaneously to ensure 100% coverage.
                            </p>
                        </div>
                    </FadeUp>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[
                            { icon: ShieldAlert, title: "Security Core", desc: "Detects SQL Injection, XSS, CSRF, and OWASP Top 10 vulnerabilities automatically." },
                            { icon: Zap, title: "Performance", desc: "Analyzes server load, animation lag, and asset optimization for maximum speed." },
                            { icon: BrainCircuit, title: "AI Analysis", desc: "Uses Artificial Intelligence to suggest code fixes and generate severity scores." },
                            { icon: Database, title: "Database Scan", desc: "Checks MySQL/MongoDB schemas for weak passwords and structural leaks." },
                            { icon: Code2, title: "Deep Source", desc: "Scans raw source code (ZIP) line-by-line to find hidden logic errors." },
                            { icon: Globe, title: "Live Crawler", desc: "Simulates a real user on your live website to find broken links and forms." },
                        ].map((feature, i) => (
                            <FadeUp key={i} delay={i * 0.1}>
                                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-white/40 hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col items-start">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-2xl flex items-center justify-center mb-5 md:mb-6 text-white rotate-3">
                                        <feature.icon size={24} />
                                    </div>
                                    <h3 className="font-heading text-xl md:text-2xl mb-2 md:mb-3">{feature.title}</h3>
                                    <p className="text-black/60 leading-relaxed text-sm md:text-base">
                                        {feature.desc}
                                    </p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* 4️⃣ HOW IT WORKS */}
            {/* ---------------------------------------------------- */}
            <section className="py-16 md:py-24 px-6 bg-black text-white rounded-t-[2.5rem] md:rounded-t-[5rem] -mb-1">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="font-heading text-3xl md:text-5xl mb-12 md:mb-16 text-skin">How It Works</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Only visible on Desktop) */}
                        <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 bg-white/20 -z-10" />

                        {[
                            { step: "01", title: "Upload / Input", desc: "Upload your Project ZIP or paste your Live Website URL." },
                            { step: "02", title: "Auto Scan", desc: "Our Engines & AI Sandbox analyze code in an isolated environment." },
                            { step: "03", title: "Get Report", desc: "Download a detailed PDF with Fix Suggestions & Safety Score." },
                        ].map((item, i) => (
                            <FadeUp key={i} delay={i * 0.2}>
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-skin text-black rounded-full flex items-center justify-center font-heading text-2xl md:text-3xl border-4 border-black mb-6 shadow-[0_0_30px_rgba(232,213,198,0.3)] relative z-10">
                                        {item.step}
                                    </div>
                                    <h3 className="font-heading text-xl md:text-2xl mb-3 text-skin">{item.title}</h3>
                                    <p className="text-white/60 text-sm md:text-base max-w-[250px]">{item.desc}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}