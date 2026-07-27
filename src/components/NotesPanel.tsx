import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotebookPen, X, Save, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from '../lib/firestore-wrapper';

interface Note {
  id: string;
  text: string;
  createdAt: any;
}

export default function NotesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user, signInWithGoogle } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    const currentUserId = user ? user.uid : null;
    if (prevUserIdRef.current !== currentUserId) {
      setNewNote('');
      setIsOpen(false);
      setNotes([]);
      prevUserIdRef.current = currentUserId;
    }
  }, [user]);

  useEffect(() => {
    if (!user || !isOpen) return;
    
    const notesRef = collection(db, `users/${user.uid}/notes`);
    const q = query(notesRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      setNotes(fetchedNotes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/notes`);
    });
    
    return () => unsubscribe();
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!newNote.trim() || !user) return;
    setIsSaving(true);
    
    try {
      const newDocRef = doc(collection(db, `users/${user.uid}/notes`));
      await setDoc(newDocRef, {
        text: newNote.trim(),
        createdAt: serverTimestamp(),
      });
      setNewNote('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/notes`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/notes`, noteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 hover:border-white/20"
        title="My Notes"
      >
        <NotebookPen className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#141414] border-l border-white/10 shadow-2xl z-[101] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <NotebookPen className="w-5 h-5 text-[#38bdf8]" />
                    My Notes
                  </h2>
                  <p className="text-sm text-white/50 mt-1">Write about your favorite movies or thoughts</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {!user ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white/5 rounded-xl border border-white/10">
                    <NotebookPen className="w-12 h-12 text-white/20 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Sign in to use Notes</h3>
                    <p className="text-sm text-white/50 mb-6">Keep track of what you want to watch or your thoughts on movies.</p>
                    <button 
                      onClick={() => signInWithGoogle()}
                      className="bg-white text-black px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors w-full"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Sign In with Google
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Write something..."
                        className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] resize-none transition-all"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleSave}
                          disabled={!newNote.trim() || isSaving}
                          className="flex items-center gap-2 bg-[#38bdf8] hover:bg-[#0284c7] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Note
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <h3 className="text-sm font-medium text-white/70 mb-4">Saved Notes</h3>
                      <div className="flex flex-col gap-3">
                        {notes.length === 0 ? (
                          <div className="text-center p-8 bg-black/30 rounded-xl border border-white/5 border-dashed">
                            <p className="text-white/40 text-sm">No notes yet. Add one above!</p>
                          </div>
                        ) : (
                          notes.map(note => (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group relative bg-[#222] border border-white/5 rounded-xl p-4 pr-12 hover:border-white/10 transition-colors"
                            >
                              <p className="text-white/90 text-sm whitespace-pre-wrap">{note.text}</p>
                              {note.createdAt && (
                                <p className="text-xs text-white/40 mt-3">
                                  {note.createdAt.toDate().toLocaleDateString(undefined, { 
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              )}
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="absolute top-4 right-4 text-white/20 hover:text-[#38bdf8] opacity-0 group-hover:opacity-100 transition-all"
                                aria-label="Delete note"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
