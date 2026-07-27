import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle2, Instagram } from 'lucide-react';

export default function Footer() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("/api/contact", { credentials: "include",
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      
      if (response.ok) {
        setFormStatus('success');
        form.reset();
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setFormStatus('idle');
      }
    } catch (err) {
      setFormStatus('idle');
    }
  };

  return (
    <footer className="mt-16 border-t border-white/10 bg-black pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
          
          {/* Left Side - Brand & Links */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-[#38bdf8] mb-2 uppercase">
                cine<span className="text-white">critiq</span>
              </h2>
              <p className="text-white/50 max-w-sm">
                A premium cinematic movie discovery platform featuring recommendations, watchlists, and reviews.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 text-white/70">
              <Link to="/privacy" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors w-fit">Privacy Policy</Link>
              <Link to="/terms" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors w-fit">Terms of Use</Link>
              <Link to="/help" onClick={() => window.scrollTo(0, 0)} className="hover:text-white transition-colors w-fit font-bold">Help Center</Link>
              <a href="https://www.instagram.com/cinecritiq/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit flex items-center gap-1.5 mt-2 text-[#E1306C] font-medium">
                <Instagram className="w-4 h-4" /> Follow us on Instagram
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/40 mt-auto uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              Server Status: Optimal &nbsp;|&nbsp; &copy; {new Date().getFullYear()} CINEVERSE STUDIOS
            </div>
          </div>

          {/* Right Side - Contact Us / Report a Problem */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-[#38bdf8]" />
              <h3 className="text-lg font-semibold text-white">Contact Us / Report a Problem</h3>
            </div>
            
            <p className="text-white/50 mb-6 text-xs">
              Having issues, or want to share feedback? Let us know below and we'll get back to you.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div>
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="Your Email Address" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                />
              </div>

              <div>
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="Your Password" 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all"
                />
              </div>
              
              <div>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  placeholder="Describe your problem or reason for contacting us..." 
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full bg-[#38bdf8] hover:bg-[#0284c7] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formStatus === 'submitting' ? (
                  <span className="flex items-center gap-2">Sending...</span>
                ) : formStatus === 'success' ? (
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Message Sent</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Report</span>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </footer>
  );
}
