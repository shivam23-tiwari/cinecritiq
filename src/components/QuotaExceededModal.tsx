import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

export default function QuotaExceededModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleQuota = () => {
      setShow(true);
    };
    window.addEventListener('firebase-quota-exceeded', handleQuota);
    return () => window.removeEventListener('firebase-quota-exceeded', handleQuota);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-[#141414] border border-red-500/30 p-6 sm:p-8 rounded-2xl w-full max-w-md relative shadow-2xl shadow-red-500/10"
          >
            <button 
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Database Quota Exceeded
              </h2>
              
              <p className="text-white/70 mb-6 leading-relaxed">
                Your Firebase project has exceeded its daily free tier limit of 50,000 reads per day. To get 1,000,000 (10 Lakh) or more reads per day, you must upgrade your Firebase project billing plan from "Spark" (Free) to "Blaze" (Pay-as-you-go) in the Firebase Console. This is a Google Cloud limitation and cannot be bypassed via code.
              </p>
              
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 w-full text-left mb-6">
                <p className="text-red-400 text-sm font-medium mb-1">How to fix this:</p>
                <ol className="list-decimal pl-5 text-white/60 text-sm space-y-1">
                  <li>Wait for the daily quota to reset (usually midnight Pacific Time).</li>
                  <li>Or upgrade your Firebase project to the "Blaze" pay-as-you-go plan to remove these limits.</li>
                </ol>
              </div>
              
              <button 
                onClick={() => setShow(false)}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
