/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Shield, Lock, Trash2, Eye, EyeOff, Check, Settings, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onPurgeAllData: () => void;
  addToast: (message: string) => void;
  onNavigateToTab: (tabId: string) => void;
}

export function ProfileView({
  profile,
  onUpdateProfile,
  onPurgeAllData,
  addToast,
  onNavigateToTab,
}: ProfileViewProps) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [bloodType, setBloodType] = useState(profile.bloodType);
  const [medicalNotes, setMedicalNotes] = useState(profile.medicalNotes);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [stealthPin, setStealthPin] = useState(profile.stealthPin);
  const [fallDetection, setFallDetection] = useState(profile.fallDetection);
  const [alertOnTimerExpiry, setAlertOnTimerExpiry] = useState(profile.alertOnTimerExpiry);

  const [showPin, setShowPin] = useState(false);
  const [showPurgePrompt, setShowPurgePrompt] = useState(false);

  // Friendly avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bloodType,
      medicalNotes: medicalNotes.trim(),
      avatarUrl,
      stealthPin,
      fallDetection,
      alertOnTimerExpiry,
    });
    addToast('Sicherheits-Profil erfolgreich gespeichert!');
  };

  const confirmPurge = () => {
    onPurgeAllData();
    setShowPurgePrompt(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-4 px-0.5 text-left bg-white scrollbar-none" id="profile-view-wrapper">
      
      {/* 9. Profil und Einstellungen - Header */}
      <div className="mb-4 pt-1 flex justify-between items-center" id="profile-header">
        <div>
          <span className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest font-mono">Einstellungen</span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5 font-sans">Mein Profil</h2>
        </div>
        <Settings className="w-5 h-5 text-slate-400" />
      </div>

      <form onSubmit={handleSave} className="space-y-4" id="profile-form">
        
        {/* Profilbild auswechseln */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center gap-2.5" id="profile-avatar-card">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-teal-500 shadow-xs relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Benutzerportrait"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-slate-300 flex items-center justify-center font-bold text-slate-700">
                  {firstName.slice(0, 1).toUpperCase()}{lastName.slice(0,1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="space-y-1 w-full text-center">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Profilbild anpassen</span>
            <div className="flex justify-center gap-1.5" id="avatar-presets">
              {avatarPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-8 h-8 rounded-full overflow-hidden border transition-all cursor-pointer ${
                    avatarUrl === preset ? 'border-teal-500 ring-2 ring-teal-100 scale-102' : 'border-slate-200'
                  }`}
                >
                  <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Persönliche Daten */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-3.5" id="personal-data-box">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
            <User className="w-4 h-4 text-teal-650 text-teal-600" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 font-mono">Persönliche Daten</h3>
          </div>

          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Vorname</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 font-mono">Nachname</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">E-Mail Adresse</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl py-1.5 px-3 text-xs outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-1 font-mono">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Mobilnummer (Notfallkontakte)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Blutgruppe</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1 px-1.5 text-xs outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1 text-[9px]">Eigene Notfall-Hinweise</label>
                <input
                  type="text"
                  value={medicalNotes}
                  placeholder="Allergien, Asthma..."
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Deaktivierungs-PIN & Sicherheit */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-3" id="security-data-box">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
            <Lock className="w-4 h-4 text-teal-605 text-teal-600" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 font-mono">Anti-Angreifer Deaktivierungs-PIN</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[10px] text-slate-500 font-bold font-mono">Stealth-Alarm PIN</span>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10.5px] text-teal-600 hover:text-teal-700 font-bold underline cursor-pointer"
              >
                {showPin ? 'Verbergen' : 'Anzeigen'}
              </button>
            </div>
            
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                pattern="[0-9]*"
                value={stealthPin}
                onChange={(e) => setStealthPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-3 text-xs outline-none font-mono tracking-widest font-black"
                placeholder="Exakt 4 Ziffern"
                required
              />
            </div>
            <p className="text-[9.5px] text-slate-400 pl-0.5 leading-normal">
              Eingabe dieser Ziffern beendet den Alarm geräuschlos. Jede andere Ziffernfolge simuliert eine Abschaltung, alarmiert jedoch verdeckt die Polizei und Kontakte!
            </p>
          </div>
        </div>

        {/* Notfallkontakte verwalten - QUICK LINK CARD */}
        <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer" onClick={() => onNavigateToTab('contacts')}>
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-800">Notfallkontakte verwalten</h4>
            <span className="text-[9.5px] text-slate-500">Vertrauenskreis bearbeiten, hinzufügen oder löschen</span>
          </div>
          <span className="text-xs font-extrabold bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-mono">→</span>
        </div>

        {/* Datenschutz-Einstellungen */}
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-3.5 text-left" id="privacy-data-box">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5">
            <Shield className="w-4 h-4 text-teal-600" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-705 text-slate-700 font-mono">Sensoren &amp; Datenschutz</h3>
          </div>

          <div className="space-y-3">
            {/* Sturzerkennung Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Sturzerkennung (G-Sensoren)</label>
                <span className="text-[9px] text-slate-405 text-slate-400 block leading-tight">Sofort-SOS bei erfassten Stürzen/Erschütterung</span>
              </div>
              <button
                type="button"
                onClick={() => setFallDetection(!fallDetection)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  fallDetection ? 'bg-teal-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                    fallDetection ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Alarm on expiration toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800">Automatischer Ablauf-Alarm</label>
                <span className="text-[9px] text-slate-400 block leading-tight">Kontakte sofort alarmieren nach Ablauf des Timers</span>
              </div>
              <button
                type="button"
                onClick={() => setAlertOnTimerExpiry(!alertOnTimerExpiry)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  alertOnTimerExpiry ? 'bg-teal-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                    alertOnTimerExpiry ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-extrabold rounded-xl text-xs transition-transform active:scale-98 shadow-md shadow-sky-50"
        >
          Sicherheits-Profil speichern
        </button>

        {/* Purge user records prompt */}
        <div className="pt-2">
          {!showPurgePrompt ? (
            <button
              type="button"
              onClick={() => setShowPurgePrompt(true)}
              className="w-full py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-[10px] font-bold"
            >
              Simulierte App-Daten zurücksetzen
            </button>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
              <span className="text-[11px] font-extrabold text-rose-800 block">Wirklich alle lokalen Daten zurücksetzen? Wann?</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={confirmPurge}
                  className="flex-1 py-1 px-2.5 bg-rose-600 text-white rounded-lg text-[10px] font-extrabold cursor-pointer"
                >
                  Daten löschen
                </button>
                <button
                  type="button"
                  onClick={() => setShowPurgePrompt(false)}
                  className="flex-1 py-1 px-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>

      </form>

    </div>
  );
}
