/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clock, Navigation, CheckCircle, ShieldAlert, Play, PlusCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyContact, UserProfile } from '../types';

interface WayHomeViewProps {
  contacts: EmergencyContact[];
  profile: UserProfile;
  activeTimer: { isActive: boolean; timeLeft: number; totalTime: number; destination: string };
  onStartTimer: (minutes: number, destination: string) => void;
  onStopTimer: (arrivedSafely: boolean) => void;
  onExtendTimer: (minutes: number) => void;
  triggerSos: (silent: boolean) => void;
}

export function WayHomeView({
  contacts,
  profile,
  activeTimer,
  onStartTimer,
  onStopTimer,
  onExtendTimer,
  triggerSos,
}: WayHomeViewProps) {
  const [customDestination, setCustomDestination] = useState('');
  const [selectedPresetDest, setSelectedPresetDest] = useState('🏠 Nach Hause');
  const [selectedDuration, setSelectedDuration] = useState(15); 

  const presetDestinations = [
    '🏠 Nach Hause',
    '🚉 Bahnhof',
    '🏢 Universität',
    '👜 Parkplatz',
    '❤️ Svenjas Wohnung',
  ];

  const presetsDurations = [
    { label: '0.1 Min (Sofort-Test)', value: 0.1 }, 
    { label: '5 Min', value: 5 },
    { label: '15 Min', value: 15 },
    { label: '30 Min', value: 30 },
    { label: '45 Min', value: 45 },
  ];

  const getEffectiveDestination = () => {
    return customDestination.trim() || selectedPresetDest;
  };

  const handleStart = () => {
    onStartTimer(selectedDuration, getEffectiveDestination());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 65);
    const displaySecs = secs >= 60 ? secs - 60 : secs; 
    return `${mins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;
  };

  const activeTrustedContacts = contacts.filter(c => c.isTrusted);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-4 px-0.5 text-left bg-white scrollbar-none" id="wayhome-view-wrapper">
      
      {/* 7. Heimweg-Modus - Header */}
      <div className="mb-4 pt-1" id="wayhome-header">
        <span className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest font-mono">Präventiv-Schutz</span>
        <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">Heimweg-Modus</h2>
      </div>

      <AnimatePresence mode="wait">
        {!activeTimer.isActive ? (
          /* TIMER CONF SETUP SCREEN */
          <motion.div
            key="setup-screen"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Step 1: Ziel eingeben */}
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Navigation className="w-4.5 h-4.5 text-teal-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight font-mono">1. Heimweg-Ziel wählen</h3>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-1.5" id="dest-presets-grid">
                {presetDestinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => {
                      setSelectedPresetDest(dest);
                      setCustomDestination('');
                    }}
                    className={`p-2 rounded-xl text-xs text-left transition-all cursor-pointer border ${
                      selectedPresetDest === dest && !customDestination
                        ? 'bg-teal-500 border-teal-500 text-white font-bold shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>

              {/* Custom address field */}
              <div className="space-y-1 pt-0.5">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Eigene Adresse eintippen</label>
                <input
                  type="text"
                  placeholder="Straße, Hausnummer..."
                  value={customDestination}
                  onChange={(e) => {
                    setCustomDestination(e.target.value);
                    setSelectedPresetDest('');
                  }}
                  className="w-full bg-white border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none rounded-xl py-1.5 px-3 text-xs"
                />
              </div>
            </div>

            {/* Step 2: Sicherheits-Timer starten */}
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-sky-605 text-sky-600" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight font-mono">2. Schutz-Timer konfigurieren</h3>
              </div>

              {/* Presets durations in pills */}
              <div className="flex flex-wrap gap-1" id="dur-presets-container">
                {presetsDurations.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setSelectedDuration(p.value)}
                    className={`px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-tight transition-all cursor-pointer ${
                      selectedDuration === p.value
                        ? 'bg-sky-500 border-sky-400 text-white font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Precision slider */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-650">
                  <span>Dauer des Heimwegs:</span>
                  <span className="text-teal-600 font-extrabold font-mono">{selectedDuration} Min.</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}
                  className="w-full accent-teal-500 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Trust disclaimer alert on timer failure */}
            <div className="p-3 bg-teal-50/70 border border-teal-150 rounded-xl">
              <p className="text-[10px] text-teal-900 leading-relaxed font-semibold">
                ℹ️ <strong>Heimweg-Schutz:</strong> Falls du nicht rechtzeitig ankommst und den Timer stoppst, benachrichtigt SafeRoute deine {activeTrustedContacts.length} aktiven Notfallkontakte automatisch via SMS mit deinem exakten Live-Standort.
              </p>
            </div>

            {/* Start Timer Button */}
            <button
              onClick={handleStart}
              id="btn-start-wayhome"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-100 cursor-pointer hover:shadow-lg transition-transform active:scale-98"
            >
              <Play className="w-4 h-4 text-white fill-white" />
              <span>Sicherheits-Timer starten</span>
            </button>
          </motion.div>
        ) : (
          /* ACTIVE TIMER COUNTDOWN SCREEN */
          <motion.div
            key="active-timer-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Round visual countdown timer display */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xs">
              
              <span className="text-[9px] uppercase tracking-widest font-mono text-slate-400 font-extrabold mb-1">Verbleibende Uhrzeit</span>
              
              <div className="text-4xl font-mono font-black tracking-widest text-teal-600 animate-pulse">
                {formatTime(activeTimer.timeLeft)}
              </div>
              
              <div className="text-[10px] text-slate-600 font-medium mt-2.5 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-slate-100 shadow-3xs">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-ping" />
                <span>Ziel: <strong className="text-slate-800">{activeTimer.destination}</strong></span>
              </div>

              {/* Progress Bar indicator */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-sky-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (activeTimer.timeLeft / activeTimer.totalTime) * 100)}%` }}
                />
              </div>
            </div>

            {/* In-Mode quick extensions and actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onExtendTimer(5)}
                id="btn-extend-timer"
                className="py-2.5 px-3 rounded-xl font-bold font-mono text-xs bg-white border border-slate-200 text-teal-600 flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50"
              >
                <PlusCircle className="w-3.5 h-3.5" /> +5 Min.
              </button>

              <button
                onClick={() => triggerSos(false)}
                id="btn-timer-sos-override"
                className="py-2.5 px-3 rounded-xl font-bold font-sans text-xs bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100/70 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Urgentes SOS</span>
              </button>
            </div>

            {/* Safely stopping the Heimweg mode countdown */}
            <button
              onClick={() => onStopTimer(true)}
              id="btn-arrived-safely"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-50 active:scale-98"
            >
              <CheckCircle className="w-4.5 h-4.5 text-slate-900" />
              <span>Ich bin sicher angekommen!</span>
            </button>

            {/* Helpful PIN reference log */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center space-y-0.5">
              <div className="text-[10px] text-slate-500 font-mono">STEALTH-QUIT_PIN: <strong className="text-slate-800">{profile.stealthPin}</strong></div>
              <p className="text-[9.5px] text-slate-400 leading-tight">Ggf. zur stillen Warnmeldung an Kontakte verwenden.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-4" id="wayhome-tip-box">
        <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5 font-mono">Sicherheitsverschluss</h4>
        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3 text-[11px] text-slate-650 flex items-start gap-2">
          <span className="text-base text-teal-600 leading-none">💡</span>
          <div className="leading-relaxed">
            <strong>Intelligentes Check-In:</strong> SafeRoute erinnert dich 1 Minute vor Ablauf mit einem sanften Signalton daran, dich als &quot;sicher angekommen&quot; auszuweisen, um Fehlalarme zu vermeiden.
          </div>
        </div>
      </div>

    </div>
  );
}
