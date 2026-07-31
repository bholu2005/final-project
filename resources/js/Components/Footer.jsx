import React from 'react';
import { Hexagon, Twitter, Github, Linkedin, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black text-white border-t border-white/10 font-body relative overflow-hidden">
            
            {/* Background Texture (Subtle) */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                
                {/* TOP SECTION: 4 COLUMNS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    
                    {/* Column 1: Brand & Newsletter (Takes 4 spans) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-skin rounded-lg flex items-center justify-center rotate-3">
                                <Hexagon size={20} className="text-black fill-black/20" />
                            </div>
                            <span className="font-heading text-2xl text-skin font-bold">Merlin Security</span>
                        </div>
                        <p className="text-white/60 text-sm leading-relaxed">
                            The future-ready testing platform. We secure your code, databases, and live applications using advanced AI analysis.
                        </p>
                        
                        {/* Newsletter Input */}
                        <div className="relative mt-4">
                            <input 
                                type="email" 
                                placeholder="Enter your email for updates" 
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white focus:outline-none focus:border-skin transition-colors"
                            />
                            <button className="absolute right-1 top-1 bg-skin text-black p-2 rounded-full hover:scale-105 transition">
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Column 2: Platform Links (Takes 2 spans) */}
                    <div className="lg:col-span-2 lg:col-start-6 space-y-4">
                        <h4 className="font-heading text-lg text-skin mb-2">Platform</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition">Source Scan</a></li>
                            <li><a href="#" className="hover:text-white transition">Live Crawler</a></li>
                            <li><a href="#" className="hover:text-white transition">Database Check</a></li>
                            <li><a href="#" className="hover:text-white transition">AI Reports</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Company (Takes 2 spans) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="font-heading text-lg text-skin mb-2">Company</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition">Security Blog</a></li>
                            <li><a href="#" className="hover:text-white transition">Contact</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Legal (Takes 2 spans) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="font-heading text-lg text-skin mb-2">Legal</h4>
                        <ul className="space-y-2 text-sm text-white/60">
                            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                        </ul>
                    </div>

                </div>

                {/* BOTTOM SECTION: COPYRIGHT & SOCIALS */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-white/40 text-sm text-center md:text-left">
                        © 2025 Merlin Universal Testing. Built for Developers.
                    </p>

                    <div className="flex gap-4">
                        {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-skin hover:text-black transition-all duration-300">
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}