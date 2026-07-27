import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from '../lib/firestore-wrapper';
import { Crown, CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
    
  useEffect(() => {
    if (!user || (user.email !== 'shivamtiwari18107@gmail.com' && user.displayName !== 'shivam 23')) {
      navigate('/');
      return;
    }

    const q = query(collection(db, 'premiumRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    
    return () => { unsubscribe(); };
  }, [user, navigate]);

  const handleApprove = async (reqId: string, userId: string) => {
    try {
      // Update user isPremium
      await updateDoc(doc(db, 'users', userId), {
        isPremium: true
      });
      // Update request status
      await updateDoc(doc(db, 'premiumRequests', reqId), {
        status: 'approved'
      });
    } catch (e) {
      console.error(e);
      alert('Failed to approve');
    }
  };

  
  
  const handleReject = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'premiumRequests', reqId), {
        status: 'rejected'
      });
    } catch (e) {
      console.error(e);
      alert('Failed to reject');
    }
  };

  return (
    <div className="pt-24 px-4 max-w-5xl mx-auto min-h-screen animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-[#D4AF37]" />
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        </div>
        
        </div>

      <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-white/5 font-bold text-white/50 grid grid-cols-4 md:grid-cols-6 gap-4">
          <div className="col-span-2">User</div>
          <div className="col-span-1">Screenshot</div>
          <div className="col-span-1">Status</div>
          <div className="hidden md:block col-span-1">Date</div>
          <div className="hidden md:block col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {requests.map(req => (
            <div key={req.id} className="p-4 grid grid-cols-4 md:grid-cols-6 gap-4 items-center">
              <div className="col-span-2">
                <p className="font-bold text-white text-sm">{req.userName}</p>
                <p className="text-xs text-white/50">{req.userEmail}</p>
              </div>
              <div className="col-span-1">
                {req.screenshot ? (
                  <a href={req.screenshot} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    <Search className="w-3 h-3" /> View Image
                  </a>
                ) : (
                  <span className="font-mono text-xs text-white/70 bg-black/50 px-2 py-1 rounded">{req.utr || 'N/A'}</span>
                )}
              </div>
              <div className="col-span-1 flex items-center">
                {req.status === 'pending' ? (
                  <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                ) : req.status === 'approved' ? (
                  <span className="text-green-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Approved
                  </span>
                ) : (
                  <span className="text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Rejected
                  </span>
                )}
              </div>
              <div className="hidden md:block col-span-1 text-xs text-white/50">
                {req.createdAt?.toDate().toLocaleDateString()}
              </div>
              <div className="hidden md:flex col-span-1 justify-end gap-2">
                {req.status === 'pending' && (
                  <>
                    <button 
                       onClick={() => handleApprove(req.id, req.userId)}
                      className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold uppercase rounded hover:bg-green-500 hover:text-black transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                       onClick={() => handleReject(req.id)}
                      className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold uppercase rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
              
              {/* Mobile Actions */}
              <div className="md:hidden col-span-4 mt-2 flex justify-end gap-2">
                 {req.status === 'pending' && (
                  <>
                    <button 
                       onClick={() => handleApprove(req.id, req.userId)}
                      className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold uppercase rounded hover:bg-green-500 hover:text-black transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                       onClick={() => handleReject(req.id)}
                      className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold uppercase rounded hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="p-8 text-center text-white/50">
              No premium requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
