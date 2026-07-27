import React, { useState, useEffect } from 'react';
import { Crown, X, CheckCircle, Smartphone, Building, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PremiumModal({ isOpen, onClose, onSuccess }: PremiumModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'info' | 'payment' | 'verifying' | 'success'>('info');
  const [showUpiId, setShowUpiId] = useState(false);
  const [screenshot, setScreenshot] = useState('');
  const [error, setError] = useState('');

  

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!screenshot) {
      setError('Please upload a screenshot of your payment');
      return;
    }
    setStep('verifying');
    try {
      if (user) {
        await addDoc(collection(db, 'premiumRequests'), {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'Unknown',
          screenshot: screenshot,
          status: 'approved',
          createdAt: serverTimestamp()
        });
        
        await updateDoc(doc(db, 'users', user.uid), {
          isPremium: true,
          updatedAt: serverTimestamp()
        });
        
        if (onSuccess) onSuccess();
        setStep('success');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FFFFFF']
        });
        setTimeout(() => {
          onClose();
          setTimeout(() => setStep('info'), 500);
        }, 4000);
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      setError('Failed to submit. Please try again.');
      setStep('payment');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#141414] border border-[#D4AF37]/30 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-[0_0_40px_rgba(212,175,55,0.15)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Crown className="w-6 h-6" />
            <h2 className="text-xl font-bold">CineCritiq PRO</h2>
          </div>
          {step !== 'verifying' && step !== 'success' && (
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar">
          {step === 'info' && (
            <div className="animate-in slide-in-from-bottom-4">
              <div className="bg-gradient-to-br from-[#D4AF37]/20 to-transparent p-6 rounded-xl border border-[#D4AF37]/20 mb-6 text-center">
                <div className="text-4xl font-black text-white mb-2">₹50</div>
                <div className="text-[#D4AF37] font-medium tracking-wide text-sm uppercase">Lifetime Membership</div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  'Unlimited Custom Watchlists',
                  'Zero Advertisements',
                  'Exclusive Golden PRO Badge',
                  'Priority Support',
                  'Early Access to Features'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setStep('payment')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
              >
                Get PRO Now <Sparkles className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="animate-in slide-in-from-right-4">
              <p className="text-white/70 text-sm mb-6 text-center">Scan the QR code to make a one-time payment of ₹50.</p>
              
              <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto mb-4 flex items-center justify-center">
                <img referrerPolicy="no-referrer" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9974894893@ybl&pn=Shivam&am=50.00&cu=INR" alt="UPI QR Code" className="w-full h-full object-contain" />
              </div>
              <p className="text-center text-lg text-gray-300 mt-2 mb-6">Amount: <span className="text-[#FFD700] font-bold text-xl">₹50</span></p>

              <div className="mb-4">
                <label className="block text-white/70 text-sm mb-2">Upload Payment Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          let width = img.width;
                          let height = img.height;
                          const max_size = 800;
                          if (width > height) {
                            if (width > max_size) {
                              height *= max_size / width;
                              width = max_size;
                            }
                          } else {
                            if (height > max_size) {
                              width *= max_size / height;
                              height = max_size;
                            }
                          }
                          canvas.width = width;
                          canvas.height = height;
                          const ctx = canvas.getContext('2d');
                          ctx?.drawImage(img, 0, 0, width, height);
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                          setScreenshot(dataUrl);
                        };
                        img.src = reader.result as string;
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700] file:text-black hover:file:bg-[#FDB931]"
                />
                {screenshot && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
                    <img src={screenshot} alt="Payment Screenshot" className="w-full max-h-48 object-cover" />
                  </div>
                )}
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              </div>
              <button 
                onClick={handleVerify}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                Submit Payment Details
              </button>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in">
              <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Verifying Payment...</h3>
              <p className="text-white/50">Please do not close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
              <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">Subscription Activated!</h3>
              <p className="text-white/70">Thank you! Your payment screenshot has been uploaded. Your PRO subscription is now active!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
