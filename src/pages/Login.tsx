import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import './Login.css';

export default function Login() {
  const [isOn, setIsOn] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, loginWithEmail, registerWithEmail, signInWithGoogle, notifyOwner } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const toggleLamp = () => {
    setIsOn(!isOn);
    setIsPulling(true);
    setTimeout(() => setIsPulling(false), 900);
  };

  const showMsg = (text: string, error: boolean = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      showMsg('Please enter your email address to reset your password.', true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showMsg('Password reset link sent to your email.', false);
    } catch (error: any) {
      console.error(error);
      showMsg(error.message || 'Failed to send reset link.', true);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'signup' && !name) {
      showMsg('Please fill in your name.', true);
      return;
    }
    if (!email || !password) {
      showMsg('Please fill in all fields.', true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMsg('Please enter a valid email address.', true);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      showMsg('Passwords do not match.', true);
      return;
    }

    setIsSubmitting(true);
    showMsg('');

    try {
      if (mode === 'signup') {
        await registerWithEmail(email, password, name);
        showMsg('Account created successfully!', false);
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        await loginWithEmail(email, password);
        showMsg('Login successful!', false);
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (err: any) {
      let errorMsg = err.message || 'An error occurred. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'The email address is badly formatted.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMsg = 'Invalid email or password. If you don\'t have an account, please click "Sign Up" below.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please try again later.';
      }
      showMsg(errorMsg, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      showMsg('Google sign in successful!', false);
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err: any) {
      let errorMsg = err.message || 'Google sign in failed.';
      if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please try again later.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign in was cancelled.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Google Sign-In is not enabled. Please enable it in Firebase Console.';
      }
      showMsg(errorMsg, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Inject Poppins font for the lamp design
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="lamp-login-body">
      <div className="lamp-hint">Click on that string</div>
      <div className="lamp-stage">
        
        <div className={`lamp-wrap ${isOn ? 'on' : ''}`} id="lampWrap">
          <div className="lamp-cone"></div>
          <div className="lamp-shade">
            <div className="lamp-bulb-glow"></div>
          </div>
          <div className={`lamp-pull ${isPulling ? 'swing' : ''}`} id="pull" onClick={toggleLamp}>
            <div className="lamp-pull-grip"></div>
          </div>
          <div className="lamp-pole"></div>
          <div className="lamp-base"></div>
        </div>

        <div className={`lamp-card ${isOn ? 'visible' : ''}`} id="card">
          <h2 id="cardTitle">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          
          <div className="flex bg-black/40 rounded-lg p-1 mb-6 border border-white/10">
            <button 
              onClick={() => { setMode('login'); showMsg(''); }} 
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'login' ? 'bg-[#38bdf8] text-black' : 'text-white/60 hover:text-white'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => { setMode('signup'); showMsg(''); }} 
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'signup' ? 'bg-[#38bdf8] text-black' : 'text-white/60 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'signup' && (
            <div className="lamp-field">
              <input 
                type="text" 
                placeholder="Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="lamp-field">
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="lamp-field">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="lamp-eye" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'hide' : 'show'}
            </span>
          </div>

          {mode === 'signup' && (
            <div className="lamp-field">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="lamp-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? 'hide' : 'show'}
              </span>
            </div>
          )}

          {mode === 'login' && (
            <div className="lamp-forgot">
              <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
            </div>
          )}

          <button 
            className="lamp-btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? 'Sign In' : 'Sign Up')
            }
          </button>

          <div className="lamp-divider">or</div>

          <button className="lamp-btn-google" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.32 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.74H24v9.02h12.7c-.55 2.95-2.2 5.45-4.68 7.13l7.28 5.66C43.65 37.42 46.5 31.5 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.6.28-3.15.78-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.32 0 11.62-2.09 15.49-5.68l-7.28-5.66c-2.03 1.36-4.63 2.16-8.21 2.16-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className={`lamp-message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
