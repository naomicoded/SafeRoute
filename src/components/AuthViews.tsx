/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, User, Lock, Mail, ChevronLeft, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthViewsProps {
  onLoginSuccess: (user: UserProfile) => void;
  initialUsers: UserProfile[];
  onAddUser: (user: UserProfile) => void;
  onAddLog: (type: 'sms' | 'call' | 'sensor' | 'system', message: string) => void;
}

export function AuthViews({ onLoginSuccess, initialUsers, onAddUser, onAddLog }: AuthViewsProps) {
  const [authScreen, setAuthScreen] = useState<'welcome' | 'register' | 'login' | 'forgot'>('welcome');
  
  // Registration state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot Password simulated state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Bitte fülle alle Felder aus.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('Die Passwörter stimmen nicht überein.');
      return;
    }

    // Verify if already exists in simulation
    const exists = initialUsers.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    if (exists) {
      setRegError('Diese E-Mail-Adresse ist bereits registriert.');
      return;
    }

    // Create user profile
    const newUser: UserProfile = {
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: '+41 79 123 45 67',
      bloodType: 'A+',
      medicalNotes: 'Keine bekannten Allergien',
      avatarUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80`, // Friendly default female portrait
      fallDetection: true,
      stealthPin: '1991',
      alertOnTimerExpiry: true,
    };

    onAddUser(newUser);
    onAddLog('system', `Benutzerkonto für ${newUser.firstName} ${newUser.lastName} erfolgreich erstellt.`);
    
    // Auto-login after registration
    onLoginSuccess(newUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    // Try finding in initialUsers
    const user = initialUsers.find(
      u => u.email.toLowerCase() === loginEmail.toLowerCase()
    );

    // For prototyping convenience, if user created in registration OR match default simulation user
    if (user && loginPassword === 'safepass123') {
      onLoginSuccess(user);
      onAddLog('system', `Benutzer ${user.firstName} erfolgreich angemeldet.`);
      return;
    } else if (user && loginPassword.length >= 6) {
      // Allow any 6+ char password for newly registered simulated users
      onLoginSuccess(user);
      onAddLog('system', `Benutzer ${user.firstName} erfolgreich angemeldet.`);
      return;
    } else {
      setLoginError('Ungültige E-Mail-Adresse oder falsches Passwort. (Tipp: Kennwort: safepass123)');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    onAddLog('system', `Passwort-Wiederherstellung an ${forgotEmail} gesendet.`);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-4 text-slate-800 bg-white select-none">
      
      {/* HEADER NAVIGATION / BACK BUTTON */}
      <div className="h-10 flex items-center">
        {authScreen !== 'welcome' && (
          <button
            onClick={() => {
              setAuthScreen('welcome');
              setRegError('');
              setLoginError('');
              setForgotSuccess(false);
            }}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold cursor-pointer py-1"
          >
            <ChevronLeft className="w-4 h-4 shrink-0 text-teal-600 stroke-[2.5]" />
            <span>Zurück</span>
          </button>
        )}
      </div>

      {/* RENDER ACTIVE SCREEN */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto max-h-[560px] scrollbar-none px-1">
        
        <AnimatePresence mode="wait">
          
          {/* 1. WILLKOMMENSSEITE (Welcome) */}
          {authScreen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center text-center py-2"
            >
              {/* Logo of SafeRoute */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-sky-400 via-sky-300 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-100 relative z-10">
                  <Shield className="w-10 h-10 text-white fill-white/10 stroke-[2]" />
                </div>
                {/* Visual pulse halo */}
                <div className="absolute inset-0 w-20 h-20 rounded-[24px] bg-teal-400/20 blur-lg animate-pulse" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center animate-bounce shadow">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Title & Slogan */}
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                Safe<span className="text-teal-600">Route</span>
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-teal-600 mb-4">Gemeinsam Sicher Nach Hause</p>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed max-w-[2700px] mb-8 font-medium">
                Sicher, vertrauensvoll und intuitiv. SafeRoute begleitet Frauen auf ihrem Heimweg. Mit schnellem Live-Standort, virtuellem Heimweg-Timer und sofortigem SOS-Alarm.
              </p>

              {/* Action Buttons */}
              <div className="w-full space-y-3 px-2">
                <button
                  onClick={() => setAuthScreen('register')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 text-white font-extrabold rounded-2xl shadow-md shadow-sky-100 hover:shadow-lg transition-all text-xs cursor-pointer active:scale-98"
                >
                  Registrieren
                </button>
                <div className="flex items-center justify-center gap-2 py-1">
                  <span className="h-px w-8 bg-slate-200" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Oder</span>
                  <span className="h-px w-8 bg-slate-200" />
                </div>
                <button
                  onClick={() => setAuthScreen('login')}
                  className="w-full py-3 px-4 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 text-sky-700 font-extrabold rounded-2xl transition-colors text-xs cursor-pointer active:scale-98"
                >
                  Anmelden
                </button>
              </div>

              {/* Security Trust badge */}
              <div className="mt-8 flex items-center gap-1.5 justify-center py-1 px-3 bg-teal-50/50 rounded-full border border-teal-100/40">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] text-teal-800 font-medium font-mono leading-none">Ende-zu-Ende verschlüsselte Ortung</span>
              </div>
            </motion.div>
          )}

          {/* 2. REGISTRIERUNGSEITE (Register) */}
          {authScreen === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="py-1"
            >
              <div className="text-left mb-5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Konto erstellen</h2>
                <p className="text-xs text-slate-500">Tritt der SafeRoute Community bei & fühle dich sicher.</p>
              </div>

              {regError && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2 text-[11px] text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Vorname & Nachname */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">Vorname</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Anna"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">Nachname</label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Muster"
                      className="w-full px-3 py-2 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* E-Mail */}
                <div className="text-left space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1 font-mono">E-Mail Adresse</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="deine.mail@beispiel.ch"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="text-left space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1 font-mono">Passwort</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Password Confirm */}
                <div className="text-left space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Passwort bestätigen</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-350" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Create Account Click Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-extrabold rounded-xl shadow-md shadow-sky-100 hover:shadow-lg transition-all text-xs cursor-pointer active:scale-98"
                >
                  Konto erstellen
                </button>
              </form>

              <div className="text-center mt-5">
                <p className="text-[11px] text-slate-500">
                  Bereits ein Konto?{' '}
                  <button
                    onClick={() => {
                      setAuthScreen('login');
                      setRegError('');
                    }}
                    className="text-teal-600 hover:text-teal-700 font-extrabold underline bg-transparent border-none cursor-pointer"
                  >
                    Hier anmelden
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* 3. LOGIN-SEITE (Login) */}
          {authScreen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="py-1"
            >
              <div className="text-left mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Willkommen zurück</h2>
                <p className="text-xs text-slate-500">Melde dich an, um deinen Account zu laden.</p>
              </div>

              {loginError && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2 text-[11px] text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* E-Mail */}
                <div className="text-left space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1 font-mono">E-Mail Adresse</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="beispiel@saferoute.ch"
                      className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl"
                      required
                    />
                  </div>
                  {/* Demo Account Indicator */}
                  <span className="text-[9px] text-slate-400 italic block pl-1">
                    Demo-Tipp: aminah@saferoute.ch / safepass123
                  </span>
                </div>

                {/* Passwort */}
                <div className="text-left space-y-1">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Passwort</label>
                    <button
                      type="button"
                      onClick={() => setAuthScreen('forgot')}
                      className="text-[10px] text-teal-600 hover:text-teal-700 font-bold underline bg-transparent border-none cursor-pointer"
                    >
                      Passwort vergessen?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-extrabold rounded-xl shadow-md shadow-sky-100 hover:shadow-lg transition-all text-xs cursor-pointer active:scale-98"
                >
                  Anmelden
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-[11px] text-slate-500">
                  Noch kein SafeRoute Konto?{' '}
                  <button
                    onClick={() => {
                      setAuthScreen('register');
                      setLoginError('');
                    }}
                    className="text-teal-600 hover:text-teal-700 font-extrabold underline bg-transparent border-none cursor-pointer"
                  >
                    Registrieren
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* 3B. PASSWORT VERGESSEN (Forgot Password) */}
          {authScreen === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="py-1"
            >
              <div className="text-left mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Passwort zurücksetzen</h2>
                <p className="text-xs text-slate-500">Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.</p>
              </div>

              {forgotSuccess ? (
                <div className="p-4 bg-teal-50 border border-teal-150 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-teal-900">Überprüfe deinen Posteingang</h4>
                    <p className="text-[11px] text-slate-600 leading-normal mt-1">Wir haben einen Wiederherstellungslink zur simulierten Adresse gesendet.</p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthScreen('login');
                      setForgotSuccess(false);
                      setForgotEmail('');
                    }}
                    className="px-4 py-1.5 bg-white border border-teal-200 text-teal-700 text-[11px] font-bold rounded-xl shadow-xs"
                  >
                    Zurück zum Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-left space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">E-Mail Adresse</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="deine.mail@adresse.ch"
                        className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400  outline-none rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-extrabold rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-98"
                  >
                    Link senden
                  </button>
                </form>
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* FOOTER LOGO */}
      <div className="pt-2 text-center text-slate-400 text-[9px] font-mono flex items-center justify-center gap-1">
        <Shield className="w-3 h-3 text-teal-500" />
        <span>SafeRoute Version 2.2 • Light Edition</span>
      </div>

    </div>
  );
}
