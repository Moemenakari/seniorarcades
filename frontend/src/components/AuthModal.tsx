/**
 * ============================================================
 * AUTH MODAL COMPONENT
 * ============================================================
 * Purpose: Unified authentication modal with Login (phone + 
 * password), Register (phone + password + name), and Forgot 
 * Password flows.
 * ============================================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { persistSession } from '../utils/authSession';
import { API_BASE_URL } from '../config';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<'phone' | 'reset'>('phone');
  const [forgotUserName, setForgotUserName] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName(''); setPhone(''); setPassword(''); setNewPassword('');
    setError(''); setSuccess('');
    setForgotStep('phone'); setForgotUserName('');
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        // Forgot Password Flow
        if (forgotStep === 'phone') {
          const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          });
          const data = await res.json();
          if (res.ok) {
            setForgotUserName(data.user_name || '');
            setForgotStep('reset');
            setSuccess(`Account found for ${data.user_name}. Please enter your new password.`);
          } else {
            setError(data.error || 'Phone number not found.');
          }
        } else {
          // Reset step
          const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, new_password: newPassword }),
          });
          const data = await res.json();
          if (res.ok) {
            setSuccess('Password reset successfully! You can now login.');
            setTimeout(() => switchMode('login'), 2000);
          } else {
            setError(data.error || 'Failed to reset password.');
          }
        }
      } else {
        // Login or Register
        const endpoint = mode === 'signup' ? 'register' : 'login';
        const payload = mode === 'signup' 
          ? { name, phone, password } 
          : { phone, password };
        
        const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (res.ok) {
          persistSession(data.token, data.user);
          onSuccess();
        } else {
          setError(data.error || 'Authentication failed. Please check your details and try again.');
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-800 hover:bg-gray-200 transition-colors text-lg font-bold">
          ✕
        </button>
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {mode === 'signup' ? 'Create Account' : mode === 'login' ? 'Welcome Back' : 'Reset Password'}
          </h2>
          <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            {mode === 'signup' 
              ? 'Sign up with your phone number to continue.' 
              : mode === 'login' 
              ? 'Login with your phone number and password.'
              : 'Enter your phone number to reset your password.'}
          </p>

          {/* Mode Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button type="button" onClick={() => switchMode('signup')} className={`py-2 rounded-lg text-sm font-bold border transition-all ${mode === 'signup' ? 'bg-[#1a2332] text-white border-[#1a2332]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              Sign Up
            </button>
            <button type="button" onClick={() => switchMode('login')} className={`py-2 rounded-lg text-sm font-bold border transition-all ${mode === 'login' ? 'bg-[#1a2332] text-white border-[#1a2332]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              Login
            </button>
            <button type="button" onClick={() => switchMode('forgot')} className={`py-2 rounded-lg text-sm font-bold border transition-all ${mode === 'forgot' ? 'bg-[#1a2332] text-white border-[#1a2332]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              Forgot?
            </button>
          </div>

          {/* Messages */}
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Register: Name field */}
            {mode === 'signup' && (
              <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E53935] focus:outline-none transition-colors" />
            )}

            {/* Phone (all modes) */}
            {(mode !== 'forgot' || forgotStep === 'phone') && (
              <input type="tel" placeholder="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E53935] focus:outline-none transition-colors" />
            )}

            {/* Password (login + register) */}
            {(mode === 'login' || mode === 'signup') && (
              <input type="password" placeholder="Password (min 4 characters)" required minLength={4} value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E53935] focus:outline-none transition-colors" />
            )}

            {/* Forgot: Reset step */}
            {mode === 'forgot' && forgotStep === 'reset' && (
              <>
                {forgotUserName && (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                    Account: <strong>{forgotUserName}</strong> ({phone})
                  </div>
                )}
                <input type="password" placeholder="New Password (min 4 characters)" required minLength={4} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#E53935] focus:outline-none transition-colors" />
              </>
            )}
            
            <button type="submit" disabled={loading} 
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-white transition-all hover:shadow-lg disabled:opacity-70"
              style={{ backgroundColor: '#E53935', fontFamily: 'Montserrat, sans-serif' }}>
              {loading ? 'Processing...' : (
                mode === 'signup' ? 'Create Account' : 
                mode === 'login' ? 'Login' : 
                forgotStep === 'phone' ? 'Find Account' : 'Reset Password'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
