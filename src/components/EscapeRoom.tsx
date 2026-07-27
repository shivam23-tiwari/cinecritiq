import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, CheckCircle2, XCircle, Unlock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { doc, setDoc } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface Puzzle {
  id: string;
  description: string;
  hint: string;
  answer: string;
}

interface Room {
  id: string;
  title: string;
  movie: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number; // in seconds
  intro: string;
  puzzles: Puzzle[];
}

const ESCAPE_ROOMS: Room[] = [
  {
    id: 'matrix',
    title: 'The Construct',
    movie: 'The Matrix (1999)',
    difficulty: 'Medium',
    timeLimit: 300,
    intro: "You're trapped in a simulated loading program. Agents are tracking your signal. You must find the correct exit node password before they disconnect you forever.",
    puzzles: [
      {
        id: 'p1',
        description: "A ringing phone lies on a leather chair. The caller ID flashes a sequence: 0, 1, 1, 2, 3, 5, 8... What is the next number?",
        hint: "It's the Fibonacci sequence.",
        answer: "13"
      },
      {
        id: 'p2',
        description: "You find two pills on a table. One is blue, one is red. A note reads: 'To wake up, take the pill of truth, whose color has 3 letters.' What color?",
        hint: "Which pill did Neo take?",
        answer: "red"
      },
      {
        id: 'p3',
        description: "The exit door requires a 4-letter code. A mirror shows the reflection of the word 'NOON'. What is the code?",
        hint: "Reflect it back.",
        answer: "noon"
      }
    ]
  },
  {
    id: 'saw',
    title: 'The Bathroom',
    movie: 'Saw (2004)',
    difficulty: 'Hard',
    timeLimit: 420,
    intro: "You wake up chained to a pipe in a dilapidated bathroom. A cassette tape tells you to find the key. The clock is ticking. I want to play a game.",
    puzzles: [
      {
        id: 'p1',
        description: "There is a hacksaw next to you. It's not for the chain. What is it for?",
        hint: "Think about what is attached to the chain.",
        answer: "foot"
      },
      {
        id: 'p2',
        description: "On the wall, painted in blood: 'X marks the spot, but only when the lights go out'. You find a UV flashlight. It reveals a shape: a 3D circle. What is this shape called?",
        hint: "A 3D circle.",
        answer: "sphere"
      },
      {
        id: 'p3',
        description: "The final lock requires a 3-digit combination. The tape said: 'Your life is worth half of the devil's number.'",
        hint: "Devil's number is 666.",
        answer: "333"
      }
    ]
  }
];

export default function EscapeRoom({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [screen, setScreen] = useState<'select' | 'intro' | 'playing' | 'result'>('select');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (screen === 'playing' && timeLeft > 0 && !isGameOver) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && screen === 'playing' && !isGameOver) {
      handleGameOver(false);
    }
    return () => clearInterval(timer);
  }, [timeLeft, screen, isGameOver]);

  const handleStartRoom = (room: Room) => {
    setSelectedRoom(room);
    setScreen('intro');
  };

  const beginEscape = () => {
    if (!selectedRoom) return;
    setCurrentPuzzleIndex(0);
    setTimeLeft(selectedRoom.timeLimit);
    setIsGameOver(false);
    setIsWinner(false);
    setUserAnswer('');
    setError('');
    setShowHint(false);
    setScreen('playing');
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || isGameOver) return;

    const puzzle = selectedRoom.puzzles[currentPuzzleIndex];
    if (userAnswer.trim().toLowerCase() === puzzle.answer.toLowerCase()) {
      // Correct
      setUserAnswer('');
      setError('');
      setShowHint(false);
      if (currentPuzzleIndex + 1 < selectedRoom.puzzles.length) {
        setCurrentPuzzleIndex(prev => prev + 1);
      } else {
        handleGameOver(true);
      }
    } else {
      setError('Incorrect. Try again!');
      setTimeLeft(prev => Math.max(0, prev - 10)); // Penalty for wrong answer
    }
  };

  const handleGameOver = (won: boolean) => {
    setIsGameOver(true);
    setIsWinner(won);
    setScreen('result');

    if (won && user) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFDF00', '#ffffff']
      });
      // Optionally save to leaderboard/DB here
      try {
        const timeSpent = selectedRoom!.timeLimit - timeLeft;
        setDoc(doc(db, 'escape_leaderboard', `${user.uid}_${selectedRoom!.id}`), {
          uid: user.uid,
          roomId: selectedRoom!.id,
          timeSpent,
          completedAt: new Date()
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (screen === 'select') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
            &larr; Back to Games
          </button>
          <h2 className="text-3xl font-black text-[#D4AF37]">Premium Escape Rooms</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {ESCAPE_ROOMS.map(room => (
            <div key={room.id} className="bg-black/40 border border-[#D4AF37]/30 p-6 rounded-2xl hover:border-[#D4AF37] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{room.title}</h3>
                  <p className="text-[#D4AF37] text-sm">{room.movie}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded ${room.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : room.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {room.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
                <div className="flex items-center gap-1"><Timer className="w-4 h-4" /> {room.timeLimit / 60} mins</div>
                <div className="flex items-center gap-1"><Unlock className="w-4 h-4" /> {room.puzzles.length} Puzzles</div>
              </div>
              <button onClick={() => handleStartRoom(room)} className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B59410] text-black font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                Enter Room <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'intro' && selectedRoom) {
    return (
      <div className="animate-in zoom-in-95 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-black text-white mb-4">{selectedRoom.title}</h2>
        <div className="bg-black/50 border border-white/10 p-8 rounded-2xl mb-8">
          <p className="text-lg text-gray-300 leading-relaxed italic">"{selectedRoom.intro}"</p>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={() => setScreen('select')} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
            Cancel
          </button>
          <button onClick={beginEscape} className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#FFDF00] transition-all">
            Start Escape
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'playing' && selectedRoom) {
    const puzzle = selectedRoom.puzzles[currentPuzzleIndex];
    return (
      <div className="animate-in fade-in max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-black/40 p-4 rounded-2xl border border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">{selectedRoom.title}</h3>
            <p className="text-sm text-gray-400">Puzzle {currentPuzzleIndex + 1} of {selectedRoom.puzzles.length}</p>
          </div>
          <div className={`text-3xl font-black font-mono ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[#D4AF37]'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-[#141414] border border-white/10 p-8 rounded-2xl mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
          <p className="text-xl text-white leading-relaxed mb-8">{puzzle.description}</p>
          
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <div>
              <input 
                type="text" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-[#D4AF37] transition-colors text-center"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full py-4 bg-[#D4AF37] text-black font-bold text-lg rounded-xl hover:bg-[#FFDF00] transition-colors">
              Submit Answer
            </button>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Stuck?</p>
          {showHint ? (
            <p className="text-[#D4AF37] text-sm italic">Hint: {puzzle.hint}</p>
          ) : (
            <button 
              className="text-[#D4AF37] hover:underline text-sm font-medium" 
              onClick={() => { setTimeLeft(prev => Math.max(0, prev - 30)); setShowHint(true); }}
            >
              View Hint (Costs 30s)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'result' && selectedRoom) {
    return (
      <div className="animate-in zoom-in text-center max-w-lg mx-auto">
        <div className="mb-8">
          {isWinner ? (
            <div className="w-24 h-24 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-[#D4AF37]" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          )}
          <h2 className={`text-4xl font-black mb-2 ${isWinner ? 'text-[#D4AF37]' : 'text-red-500'}`}>
            {isWinner ? 'ESCAPED!' : 'TIME\'S UP'}
          </h2>
          <p className="text-gray-400">
            {isWinner ? `You escaped ${selectedRoom.title} with ${formatTime(timeLeft)} remaining!` : 'You failed to escape in time. The room has claimed another victim.'}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={() => setScreen('select')} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all">
            Play Another Room
          </button>
          <button onClick={onBack} className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#FFDF00] transition-all">
            Exit Games
          </button>
        </div>
      </div>
    );
  }

  return null;
}
