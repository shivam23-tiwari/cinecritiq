import React, { useState, useEffect } from 'react';
import { Gamepad2, Timer, Award, CheckCircle2, XCircle, ArrowRight, Star, Lock, Crown } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { doc, setDoc, serverTimestamp, getDoc } from '../lib/firestore-wrapper';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import PremiumModal from '../components/PremiumModal';
import EscapeRoom from '../components/EscapeRoom';

type GameScreen = 'menu' | 'mode_select' | 'quiz' | 'result' | 'escape_room';
type QuizMode = 10 | 50;

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  options: string[];
}

const decodeHtml = (html: string) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

export default function Games() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [mode, setMode] = useState<QuizMode>(10);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const BACKGROUNDS = [
    'https://image.tmdb.org/t/p/original/yir5430WblZSZuIMd9C6pIZerfA.jpg', // Baby Driver
    'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg', // The Dark Knight
    'https://image.tmdb.org/t/p/original/9n2tJBplPbgR2ca05hS5CKXwP2c.jpg', // The Super Mario Bros. Movie
    'https://image.tmdb.org/t/p/original/2ssWTSVklAEc98frZUQhgtGHx7s.jpg', // Interstellar
    'https://image.tmdb.org/t/p/original/AeDzjt00Hfh9CuW7TIUdYBJmWYM.jpg', // How to Train Your Dragon
    'https://image.tmdb.org/t/p/original/rlay2M5QYvi6igbGcFjq8jxeusY.jpg', // Joker
    'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg', // Inception
    'https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg', // Dune: Part Two
    'https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg', // Dune: Part One
    'https://image.tmdb.org/t/p/original/pGFQCp12a8andfPlpnmXz44IIvY.jpg', // Avengers
    'https://image.tmdb.org/t/p/original/eTlcNXGv32zkVI7ZDHhfeaKHXKQ.jpg', // The Maze Runner
    'https://image.tmdb.org/t/p/original/9xfDWXAUbFXQK585JvByT5pEAhe.jpg', // Spider-Man: Across the Spider-Verse
    'https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg', // Game of Thrones
    'https://image.tmdb.org/t/p/original/qD211Hb5XwFxrszzBBe5EUYJerh.jpg', // One Piece
  ];

  useEffect(() => {
    // Preload images to prevent black screen
    BACKGROUNDS.forEach(bg => {
      const img = new Image();
      img.src = bg;
    });

    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % BACKGROUNDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  // Quiz Timer
  useEffect(() => {
    let timer: any;
    if (screen === 'quiz' && !isGameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, isGameOver, timeLeft, score]);

  const startQuiz = async (selectedMode: QuizMode) => {
    setMode(selectedMode);
    setScreen('quiz');
    setLoading(true);
    setError('');
    setIsGameOver(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setTimeLeft(selectedMode === 10 ? 180 : 600); // 3 mins or 10 mins

    try {
      const response = await fetch(`https://opentdb.com/api.php?amount=${selectedMode}&category=11&type=multiple`);
      const data = await response.json();
      
      if (data.response_code !== 0) {
        throw new Error('Failed to fetch questions. Please try again later.');
      }
      
      const formattedQuestions = data.results.map((q: any) => {
        const options = [...q.incorrect_answers, q.correct_answer];
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        return {
          question: decodeHtml(q.question),
          correct_answer: decodeHtml(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map(decodeHtml),
          options: options.map(decodeHtml)
        };
      });
      
      setQuestions(formattedQuestions);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setScreen('mode_select');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (isGameOver) return;
    
    const isCorrect = answer === questions[currentQuestionIndex].correct_answer;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleGameOver(newScore);
    }
  };

  const handleGameOver = async (finalScore: number) => {
    setIsGameOver(true);
    setScreen('result');
    
    const isWinner = mode === 10 ? finalScore >= 9 : finalScore >= 45;

    if (isWinner && user) {
      try {
        const duration = mode === 10 ? 10 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000; // 10 days or 1 month
        const validUntil = new Date(Date.now() + duration);
        
        await setDoc(doc(db, 'users', user.uid), {
          mcqWinnerStarUntil: validUntil
        }, { merge: true });
        
      } catch (err) {
        console.error('Failed to award star:', err);
      }
    }
  };

  const handleEscapeRoomClick = async () => {
    if (!user) {
      alert("Please log in first!");
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    try {
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && (userSnap.data() as any).isPremium) {
        setScreen('escape_room');
      } else {
        navigate('/premium');
      }
    } catch (err) {
      console.error(err);
      navigate('/premium');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-32 pb-12 text-center">
        <Gamepad2 className="w-12 h-12 md:w-16 md:h-16 text-[#38bdf8] mx-auto mb-2 md:mb-4" />
        <h1 className="text-3xl font-black text-white mb-4">Games</h1>
        <p className="text-gray-400 mb-8">Please login to play games and earn rewards.</p>
        <button onClick={() => navigate('/login')} className="bg-[#38bdf8] text-white px-6 py-2.5 text-sm rounded-lg font-bold">
          Login to Play
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-20 md:pt-32 pb-12 overflow-hidden">
      {/* Background Images */}
      {BACKGROUNDS.map((bg, idx) => (
        <div
          key={bg}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            bgIndex === idx ? 'opacity-100 brightness-110' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${bg})` }}
        />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10">
        
      {screen === 'menu' && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-6 md:mb-12">
            <Gamepad2 className="w-16 h-16 text-[#38bdf8] mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 md:mb-4">CineVerse Games</h1>
            <p className="text-xs md:text-base text-gray-400">Play games, test your movie knowledge, and earn profile badges.</p>
          </div>
          
                    <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            <div 
              onClick={() => setScreen('mode_select')}
              className="bg-black/20 backdrop-blur-lg border border-white/10 hover:border-[#38bdf8] p-5 md:p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#38bdf8]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Gamepad2 className="w-12 h-12 text-[#38bdf8] mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Movie MCQs</h2>
                <p className="text-gray-400 text-sm">Movie trivia. Pass the challenge to win an exclusive profile badge.</p>
              </div>
              <div className="mt-6 flex justify-end">
                <span className="text-xs bg-white/10 px-2 py-1 rounded text-white font-medium uppercase tracking-wider">Free</span>
              </div>
            </div>

            <div 
              className="bg-black/20 backdrop-blur-lg border border-[#D4AF37]/30 hover:border-[#D4AF37] p-5 md:p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 group relative overflow-hidden flex flex-col justify-between"
              onClick={handleEscapeRoomClick}
            >
              <div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Lock className="w-12 h-12 text-[#D4AF37] mb-4" />
                <h2 className="text-2xl font-bold text-[#D4AF37] mb-2 flex items-center gap-2">Escape Room</h2>
                <p className="text-gray-400 text-sm">Trapped in a movie scene. Solve puzzles, decode clues to escape.</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                 <span className="text-[10px] bg-gradient-to-r from-[#D4AF37] to-[#B59410] text-black px-2 py-1 rounded font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.4)] flex items-center gap-1">
                   <Crown className="w-3 h-3" /> Premium
                 </span>
                 <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold">Play</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 'mode_select' && (
        <div className="animate-in fade-in slide-in-from-right-8">
          <button onClick={() => setScreen('menu')} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2">
            &larr; Back to Games
          </button>
          
          <h1 className="text-3xl font-black text-white mb-2">Movie MCQs</h1>
          <p className="text-gray-400 mb-8">Select your difficulty. One wrong answer and it's game over!</p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl mb-8">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            <div 
              onClick={() => startQuiz(10)}
              className="bg-black/20 backdrop-blur-lg border border-white/10 hover:border-yellow-500/50 p-5 md:p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/10 p-3 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Timer className="w-4 h-4" /> 3 mins
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">10 Questions</h2>
              <p className="text-gray-400 text-sm mb-6">A quick challenge to test your movie knowledge.</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-center gap-2 text-sm text-yellow-500 font-medium">
                <Award className="w-4 h-4" /> Reward: Movie Goat for 10 Days
              </div>
            </div>
            
            <div 
              onClick={() => startQuiz(50)}
              className="bg-black/20 backdrop-blur-lg border border-white/10 hover:border-yellow-500 p-8 rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(234,179,8,0.25)] group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/10 p-3 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Timer className="w-4 h-4" /> 10 mins
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">50 Questions</h2>
              <p className="text-gray-400 text-sm mb-6">The ultimate movie buff marathon.</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-center gap-2 text-sm text-yellow-500 font-medium">
                <Award className="w-4 h-4" /> Reward: 1 Month MCQ Star
              </div>
            </div>
          </div>
        </div>
      )}

      {screen === 'quiz' && (
        <div className="animate-in fade-in max-w-2xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-[#38bdf8]/30 border-t-[#38bdf8] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 font-medium tracking-widest uppercase">Loading Quiz...</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8 bg-black/20 backdrop-blur-lg p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#38bdf8] px-3 py-1 rounded font-bold text-white">
                    Q: {currentQuestionIndex + 1}/{mode}
                  </div>
                  <div className="text-gray-400 font-medium">
                    Score: <span className="text-white">{score}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  <Timer className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              {questions.length > 0 && currentQuestionIndex < questions.length && (
                <div className="bg-black/20 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
                    {questions[currentQuestionIndex].question}
                  </h2>
                  
                  <div className="grid gap-3">
                    {questions[currentQuestionIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className="w-full text-left bg-black/20 hover:bg-white/10 border border-white/10 hover:border-white/30 p-3 md:p-4 rounded-xl text-sm md:text-base text-white font-medium transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {screen === 'escape_room' && (
        <EscapeRoom onBack={() => setScreen('menu')} />
      )}
      
      {screen === 'result' && (
        <div className="animate-in zoom-in-95 max-w-md mx-auto text-center py-10 bg-black/20 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
          {(mode === 10 ? score >= 9 : score >= 45) ? (
            <>
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
                <Award className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">You are the MCQ Winner!</h2>
              <p className="text-gray-400 mb-8">
                Incredible! You passed the challenge with a score of {score}/{mode}. 
                Your {mode === 10 ? '10-day' : '1-month'} reward has been applied to your profile.
              </p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Game Over!</h2>
              <p className="text-gray-400 mb-8">
                {timeLeft === 0 ? "Time's up!" : ""} You scored {score} out of {mode}. You needed at least {mode === 10 ? 9 : 45} to win the badge.
              </p>
            </>
          )}
          
          <div className="flex gap-4">
            <button 
              onClick={() => setScreen('mode_select')}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Try Again
            </button>
            {(mode === 10 ? score >= 9 : score >= 45) && (
              <button 
                onClick={() => navigate('/profile')}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-105 transition-all"
              >
                View Profile
              </button>
            )}
          </div>
        </div>
      )}
      
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => setScreen('escape_room')}
      />
      
      </div>
    </div>
  );
}
