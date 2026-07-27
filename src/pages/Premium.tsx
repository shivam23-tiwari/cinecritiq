import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from '../lib/firestore-wrapper';
import { Crown, CheckCircle, Smartphone, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'canvas-confetti';

export default function Premium() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [screenshot, setScreenshot] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (userData?.isPremium) {
      navigate('/profile');
    }
  }, [user, userData, navigate]);

  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!user) return;
      const q = query(collection(db, 'premiumRequests'), where('userId', '==', user.uid), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setStatus('pending');
      }
    };
    checkExistingRequest();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      setErrorMessage('Please upload a screenshot of your payment');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Save request for admin reference
      await addDoc(collection(db, 'premiumRequests'), {
        userId: user!.uid,
        userEmail: user!.email || '',
        userName: user!.displayName || 'Unknown',
        screenshot,
        status: 'approved', // Auto-approved as requested
        createdAt: serverTimestamp()
      });
      
      // Auto-upgrade user to premium immediately
      await updateDoc(doc(db, 'users', user!.uid), {
        isPremium: true,
        updatedAt: serverTimestamp()
      });
      
      setStatus('pending'); // Show success visually
      Confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FFFFFF']
      });
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Golden PRO badge on your profile and comments",
    "Unlimited Custom Posters",
    "Ad-free experience",
    "Priority support",
    "Early access to new features"
  ];

  return (
    <div className="min-h-screen bg-black pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Benefits Section */}
        <div className="bg-[#141414] border border-[#FFD700]/20 rounded-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 blur-3xl rounded-full"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-[#FFD700]" />
            <h1 className="text-3xl font-bold text-white">Go Premium</h1>
          </div>
          
          <p className="text-gray-400 mb-8">
            Upgrade to CineCritiq Premium for ₹50 to unlock exclusive features and show your support.
          </p>

          <ul className="space-y-4 mb-8">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
                <span className="text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Section */}
        <div className="bg-[#141414] border border-white/10 rounded-xl p-8">
          {status === 'pending' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Subscription Activated!</h2>
              <p className="text-gray-400">
                Thank you! Your payment screenshot has been uploaded. Your PRO subscription is now active!
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-6">Complete Payment</h2>
              
              <div className="bg-black/50 border border-white/5 rounded-lg p-6 mb-6 text-center">
                <p className="text-sm text-gray-400 mb-2">Scan QR Code to Pay</p>
                <div className="w-48 h-48 bg-white mx-auto mb-4 rounded-lg flex items-center justify-center p-2">
                  <img referrerPolicy="no-referrer" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9974894893@ybl&pn=Shivam&am=50.00&cu=INR" alt="UPI QR Code" className="w-full h-full object-contain" />
                </div>
                <p className="text-lg text-gray-300 mt-2">Amount: <span className="text-[#FFD700] font-bold text-xl">₹50</span></p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Upload Payment Screenshot
                  </label>
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
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700] file:text-black hover:file:bg-[#FDB931]"
                    required
                  />
                  {screenshot && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-white/10">
                      <img src={screenshot} alt="Payment Screenshot" className="w-full max-h-48 object-cover" />
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !screenshot}
                  className="w-full bg-[#FFD700] hover:bg-[#FDB931] text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Submit Verification'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
