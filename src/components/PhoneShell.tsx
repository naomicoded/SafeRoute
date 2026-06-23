/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Bell, MessageSquare, PhoneCall, RefreshCw, Volume2, VolumeX, Shield, ShieldAlert, Wifi, Battery, Clock, Activity, User, Info, ArrowRight, Heart } from 'lucide-react';

interface LogEntry {
  id: string;
  time: string;
  type: 'sms' | 'call' | 'sensor' | 'system';
  message: string;
}

interface PhoneShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logs: LogEntry[];
  onTriggerFall: () => void;
  onClearLogs: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  activeNotification: string | null;
  onCloseNotification: () => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
}

export function PhoneShell({
  children,
  activeTab,
  setActiveTab,
  logs,
  onTriggerFall,
  onClearLogs,
  isMuted,
  setIsMuted,
  activeNotification,
  onCloseNotification,
  isAuthenticated,
  onLogout,
}: PhoneShellProps) {
  const [deviceTime, setDeviceTime] = useState('22:15');
  const [batteryLevel, setBatteryLevel] = useState(94);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setDeviceTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-sky-50 to-slate-100 text-slate-800 flex flex-col lg:flex-row items-center justify-center p-3 md:p-8 font-sans selection:bg-teal-200 selection:text-teal-900 transition-colors duration-300" id="main-layout-root">
      
      {/* Friendly organic colored glow spots */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-112 h-112 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />

      {/* Main Grid Wrapper */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 z-10" id="grid-container">

        {/* COMPANION INTERACTIVE SIMULATOR CARD */}
        <div className="flex-1 max-w-sm bg-white/90 border border-slate-200/80 rounded-3xl p-5 flex flex-col justify-between shadow-lg backdrop-blur-md" id="simulation-sidebar">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-teal-400 flex items-center justify-center shadow-md shadow-sky-100">
                <Shield className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-black text-slate-800 uppercase tracking-wider">SafeRoute Panel</span>
                <span className="block text-[10px] text-teal-600 font-mono font-bold tracking-wide leading-none">Prototyp-Simulator</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4 text-left">
              Dieses Kontrollpanel simuliert Ereignisse der Smartphone-Sensoren und Mobilfunkverbindungen für den Prototyp.
            </p>

            {/* Quick Actions */}
            <div className="space-y-2.5 mb-5" id="simulation-controls">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold text-left block">Sensoren & Optionen</span>
              
              {/* Fall simulation triggers */}
              <button
                onClick={onTriggerFall}
                id="btn-sim-fall"
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 text-left transition-colors rounded-xl text-xs font-bold font-sans text-rose-700 flex items-center justify-between cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Sturz simulieren (Harte Erschütterung)</span>
                </div>
                <span className="text-[9px] font-mono bg-rose-200/50 px-1.5 py-0.5 rounded text-rose-700 font-bold">FALL</span>
              </button>

              {/* Toggle Warning siren mode */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                id="btn-toggle-sound"
                className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100/80 border border-sky-200/60 text-left transition-colors rounded-xl text-xs font-bold text-sky-700 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isMuted ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
                  <span>Notrufsirene Lautstärke</span>
                </div>
                <span className="text-[10px] font-mono text-sky-850 font-bold">
                  {isMuted ? 'Lautlos' : 'Lauter Alarm'}
                </span>
              </button>

              {isAuthenticated && onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-left text-xs text-slate-600 rounded-xl flex items-center gap-2 transition-colors border border-slate-200/30"
                >
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  <span>Simulator: Prototyp Abmelden (Logout)</span>
                </button>
              )}
            </div>
          </div>

          {/* SIMULATED SYSTEM CONSOLE (Outgoing logs, calls & SMS) */}
          <div className="flex-1 flex flex-col min-h-[190px] border-t border-slate-100 pt-4" id="console-logs-section">
            <div className="flex justify-between items-center mb-2.5">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-teal-500" />
                Übertragungs-Protokoll (SMS/Notrufe)
              </h4>
              {logs.length > 0 && (
                <button 
                  onClick={onClearLogs}
                  className="text-[9px] font-mono text-teal-600 hover:text-teal-700 underline font-bold"
                >
                  Leeren
                </button>
              )}
            </div>

            <div className="bg-slate-50/90 rounded-2xl p-3 flex-1 overflow-y-auto max-h-[180px] border border-slate-100 font-mono text-[10px] space-y-2 text-left text-slate-600 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[9px] text-slate-400 text-center gap-1">
                  <Info className="w-4 h-4 text-slate-350" />
                  <span>Bereit. SMS-Nachrichten und Notrufnummern werden hier protokolliert.</span>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border-b border-slate-200/50 pb-1.5 last:border-0">
                    <div className="flex justify-between text-slate-400 text-[9px] mb-0.5">
                      <span>{log.time}</span>
                      <span className={`uppercase font-extrabold text-[8px] px-1 py-0.2 rounded ${
                        log.type === 'sms' 
                          ? 'bg-sky-100 text-sky-700' 
                          : log.type === 'call' 
                            ? 'bg-teal-100 text-teal-700' 
                            : log.type === 'sensor' 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-slate-200 text-slate-700'
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-slate-700 font-sans leading-relaxed text-xs">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* IPHONE mockup wrapper (Clean, safe, bright and elegant design style) */}
        <div className="relative mx-auto w-full max-w-[360px] h-[720px] rounded-[48px] border-10 border-slate-800 bg-white shadow-2xl overflow-hidden flex flex-col justify-between" id="iphone-handset-frame">
          
          {/* Inner glass ring highlight */}
          <div className="absolute inset-0 rounded-[38px] border border-slate-100 pointer-events-none z-50" />

          {/* DYNAMIC ISLAND NOTCH */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-7.5 bg-slate-900 rounded-full z-50 flex items-center justify-center shadow-sm pointer-events-none" id="dynamic-island">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center absolute left-5">
              <div className="w-1 h-1 rounded-full bg-indigo-900/60" />
            </div>
            {logs.some(l => l.type === 'sms' || l.type === 'sensor') && (
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping absolute right-6" />
            )}
          </div>

          {/* IOS STATUS BAR (Slate dark text, white base) */}
          <div className="h-10 px-6.5 pt-4.5 flex justify-between items-center text-xs font-semibold text-slate-700 font-mono z-40 relative select-none" id="ios-status-bar">
            <span>{deviceTime}</span>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] tracking-tighter font-bold shrink-0">{batteryLevel}%</span>
                <Battery className="w-4 h-4 fill-slate-700 text-slate-700" />
              </div>
            </div>
          </div>

          {/* MAIN SURFACE CANVAS */}
          <div className="flex-1 w-full px-5 py-2 overflow-hidden flex flex-col relative bg-white" id="iphone-screen-surface">
            
            {/* INCOMING SMS PUSH SIMULATION BANNER */}
            <AnimatePresence>
              {activeNotification && (
                <motion.div
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  onClick={onCloseNotification}
                  className="absolute top-2 left-3 right-3 z-50 bg-white/95 border border-sky-100 rounded-2xl p-3 shadow-lg flex items-start gap-2.5 cursor-pointer backdrop-blur-md"
                  id="ios-notification-banner"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-teal-400 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[9px] font-extrabold text-teal-600 uppercase tracking-widest font-mono">Nachricht gesendet</span>
                      <span className="text-[8px] text-slate-400 font-mono">Jetzt</span>
                    </div>
                    <p className="text-xs text-slate-750 truncate w-full leading-normal font-medium">
                      {activeNotification}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Direct Screen Child render */}
            {children}
          </div>

          {/* SYSTEM BOTTOM NAV BAR & SWEET SWIPE BAR */}
          <div className="z-40" id="iphone-system-bar">
            {isAuthenticated ? (
              /* Bottom tabs for App view transitions */
              <div className="bg-white border-t border-slate-100 px-2 py-1.5 flex justify-between items-center select-none shadow-md" id="mobile-tabbar">
                {[
                  { id: 'home', label: 'Home', icon: Shield },
                  { id: 'map', label: 'Karte', icon: RefreshCw },
                  { id: 'contacts', label: 'Kontakte', icon: Heart },
                  { id: 'sos', label: 'SOS', icon: ShieldAlert, isCritical: true },
                  { id: 'profile', label: 'Profil', icon: User },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isSos = tab.id === 'sos';
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      id={`tab-btn-${tab.id}`}
                      className={`flex flex-col items-center justify-center py-1 px-1 bg-transparent border-0 outline-none cursor-pointer transition-all flex-1 ${
                        isSos 
                          ? 'text-rose-600 font-black hover:scale-105 active:scale-95' 
                          : isActive 
                            ? 'text-teal-600 font-extrabold scale-102' 
                            : 'text-slate-400 hover:text-slate-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-0.5 ${
                        isSos 
                          ? 'stroke-[2.5] text-red-550 text-rose-600 animate-pulse' 
                          : isActive 
                            ? 'stroke-[2.5] text-teal-600' 
                            : 'stroke-[2]'
                      }`} />
                      <span className={`text-[8px] uppercase tracking-wider font-extrabold font-mono ${isSos ? 'text-rose-600' : ''}`}>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Physical silver swipe bar */}
            <div className="h-5 pb-1.5 flex items-center justify-center bg-white" id="home-indicator-section">
              <div className="w-32 h-1 bg-slate-200 rounded-full" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
