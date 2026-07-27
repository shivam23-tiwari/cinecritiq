import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, limit } from '../lib/firestore-wrapper';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  read?: boolean;
  type?: string;
  message?: string;
  fromUserPhoto?: string;
  fromUserName?: string;
  fromUserId?: string;
  targetUserId?: string;
  targetUserName?: string;
  createdAt?: any;
}

export default function NotificationsPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const snap = await getDocs(q);
        const notifs: any[] = [];
        let unread = 0;
        
        snap.forEach(d => {
          const data = { id: d.id, ...(d.data() as any) } as Notification;
          notifs.push(data);
          if (!data.read) unread++;
        });
        
        setNotifications(notifs);
        setUnreadCount(unread);
      } catch (error) {
        const msg = String(error);
        if (!msg.includes('Quota limit exceeded') && !(error?.message || "").includes('Quota limit exceeded')) {
          console.error("Error fetching notifications:", error);
        } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
      }
    };

    fetchNotifications();
    // In a real app we'd use onSnapshot for realtime, but doing simple fetch for now
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifs.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 hover:border-white/20 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#38bdf8] text-white text-[10px] font-bold rounded-full flex items-center justify-center translate-x-1/4 -translate-y-1/4">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-[#141414] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-[#38bdf8] hover:text-white transition-colors">
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto hide-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex gap-3 ${!notif.read ? 'bg-[#38bdf8]/5' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                        {notif.type === 'follow' ? (
                          notif.fromUserPhoto ? (
                            <img referrerPolicy="no-referrer" src={notif.fromUserPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50 font-bold bg-[#2a2a2a]">
                              {notif.fromUserName?.[0]?.toUpperCase() || '?'}
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 bg-[#2a2a2a]">
                            <Bell className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          {notif.type === 'follow' ? (
                            <span><Link to={`/user/${notif.fromUserId}`} className="font-bold text-white hover:text-[#38bdf8]">{notif.fromUserName}</Link> started following you.</span>
                          ) : notif.type === 'followed_user' ? (
                            <span>You started following <Link to={`/user/${notif.targetUserId}`} className="font-bold text-white hover:text-[#38bdf8]">{notif.targetUserName}</Link>.</span>
                          ) : notif.type === 'system' ? (
                            <span>{notif.message}</span>
                          ) : (
                            <span>New notification</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.createdAt?.toDate ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-[#38bdf8] rounded-full mt-1 flex-shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
