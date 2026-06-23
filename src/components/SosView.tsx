/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  MapPin, 
  Check, 
  Volume2, 
  VolumeX, 
  X,
  Compass,
  Send,
  Lock
} from 'lucide-react';
import { EmergencyContact, UserProfile } from '../types';

interface SosViewProps {
  contacts: EmergencyContact[];
  profile: UserProfile;
  sosActive: boolean;
  onActivateSos: (silent: boolean) => void;
  onDeactivateSos: () => void;
  onAddLog: (type: 'sms' | 'call' | 'sensor' | 'system', message: string) => void;
  onShowNotification: (message: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onClose: () => void;
}

export function SosView({
  contacts,
  profile,
  sosActive,
  onActivateSos,
  onDeactivateSos,
  onAddLog,
  onShowNotification,
  isMuted,
  setIsMuted,
  onClose,
}: SosViewProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasTriggeredSms, setHasTriggeredSms] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);

  // Auto handle countdown
  useEffect(() => {
    if (!sosActive && countdown === null) {
      // Start confirmation countdown of 10 seconds as requested
      setCountdown(10);
    }
  }, [sosActive]);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && !sosActive) {
      handleTriggerAlarm();
    }
    return () => clearTimeout(timer);
  }, [countdown, sosActive]);

  // Handle long press representation
  useEffect(() => {
    let timer: any;
    if (isPressing && sosActive) {
      timer = setInterval(() => {
        setLongPressProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsPressing(false);
            handleDeactivateAlarm();
            return 0;
          }
          return prev + 10;
        });
      }, 100);
    } else {
      setLongPressProgress(0);
    }
    return () => clearInterval(timer);
  }, [isPressing, sosActive]);

  const handleTriggerAlarm = () => {
    setCountdown(null);
    onActivateSos(isMuted);
    
    // Auto transmit location coordinates and send alarm SMS
    if (!hasTriggeredSms) {
      onAddLog('system', `Standortdaten automatisch übermittelt: 47.3769° N, 8.5417° O (Zürich Hauptbahnhof, Genauigkeit: 4m)`);
      
      if (contacts.length > 0) {
        contacts.forEach(contact => {
          const smsText = `SOS SafeRoute Notruf von ${profile.firstName}! Mein Live-Standort: https://safeme.route/live-tracker?u=${profile.firstName.toLowerCase()}`;
          onAddLog('sms', `Notruf-SMS gesendet an ${contact.name} (${contact.phone}): "${smsText}"`);
        });
        onShowNotification(`Notfall-Alarm an ${contacts.length} Kontakte gesendet!`);
      } else {
        onAddLog('system', `Achtung: Keine vordefinierten Notfallkontakte gefunden, um SMS zu senden.`);
      }
      setHasTriggeredSms(true);
    }
  };

  // Perform a full deactivation with confirmation SMS sent to contacts ("Meldung, dass die Situation wieder sicher ist")
  const handleDeactivateAlarm = () => {
    onDeactivateSos();
    setCountdown(null);
    setHasTriggeredSms(false);
    
    // Log deactivation system status
    onAddLog('system', `Sicherheitsalarm beendet von ${profile.firstName || 'Benutzer'}.`);

    // Sends confirmation SMS to all emergency contacts letting them know the situation is safe again
    if (contacts.length > 0) {
      contacts.forEach(contact => {
        const safeSmsText = `Entwarnung von ${profile.firstName}! Die Situation ist wieder sicher. Es besteht keine Gefahr mehr.`;
        onAddLog('sms', `Entwarnung-SMS gesendet an ${contact.name} (${contact.phone}): "${safeSmsText}"`);
      });
      onShowNotification(`Entwarnung-Nachrichten an deine ${contacts.length} Kontakte gesendet!`);
    } else {
      onAddLog('system', `Info: Keine Notfallkontakte vorhanden für Entwarnungsmeldung.`);
    }

    onClose();
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
    onAddLog('system', `SOS Countdown rechtzeitig abgebrochen.`);
    onClose();
  };

  const handleImmediateTrigger = () => {
    handleTriggerAlarm();
  };

  const handleCallPolice = () => {
    onAddLog('call', `Polizei (Notruf 117) angerufen.`);
    onShowNotification(`Notruf 117 wird angerufen...`);
  };

  return (
    <div className="absolute inset-x-0 top-10 bottom-0 bg-white z-50 flex flex-col justify-between py-5 px-6 text-slate-800 text-left font-sans select-none" id="sos-page-overlay">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center pb-2 border-b border-rose-100">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
          <span className="text-[10px] uppercase font-black tracking-widest font-mono text-rose-600">Notfall-Zentrale</span>
        </div>
        
        {/* Close Button only if we are in countdown state */}
        {!sosActive && (
          <button 
            onClick={handleCancelCountdown}
            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* BODY CONTENT - Split on Countdown vs Active Alarm */}
      <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
        
        <AnimatePresence mode="wait">
          
          {/* A. COUNTDOWN TIMER / BESTÄTIGUNG vor dem Auslösen */}
          {!sosActive && countdown !== null && (
            <motion.div
              key="countdown-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-350 flex items-center justify-center mb-3">
                <AlertTriangle className="w-8 h-8 text-rose-500 animate-bounce" />
              </div>

              <h2 className="text-xl font-black text-rose-950">Notrufsituation prüfen...</h2>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[270px] leading-relaxed">
                Falls du nicht reagierst, wird in wenigen Sekunden ein lauter Alarm ausgelöst und dein Live-Standort an deine Notfallkontakte übertragen.
              </p>

              {/* Huge circular countdown timer (10 Seconds) */}
              <div className="relative w-36 h-36 flex items-center justify-center my-5">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className="stroke-slate-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    className="stroke-rose-500 transition-all duration-1000"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="402"
                    strokeDashoffset={(402 * (10 - countdown)) / 10}
                  />
                </svg>
                <span className="text-6xl font-black font-mono text-slate-900">{countdown}</span>
              </div>

              {/* Auto transmits message detail tracker */}
              <div className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 mb-5 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-mono uppercase font-black">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Automatisches GPS-Protokoll</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Deine exakten GPS-Koordinaten werden automatisch gesichert und für deine Notfallkontakte zur Nachverfolgung freigegeben.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={handleCancelCountdown}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleImmediateTrigger}
                  className="py-3 px-4 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-650 hover:to-red-655 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Sofort Senden
                </button>
              </div>
            </motion.div>
          )}

          {/* B. SOS ALARM AKTIV (Sent notifications, loud alarms flashing red/blue) */}
          {sosActive && (
            <motion.div
              key="active-alarm-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center animate-ping absolute opacity-20 pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center border-4 border-white mb-3 shadow-lg z-10 relative">
                <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
              </div>

              <h2 className="text-2xl font-black text-rose-605 uppercase tracking-wide animate-pulse">NOTRUF AKTIVIERT</h2>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] leading-relaxed">
                Der Prototyp-Sirenenalarm ertönt jetzt. Deine Vertrauenspersonen haben eine Notfall-SMS erhalten.
              </p>

              {/* Siren mute Check box */}
              <div className="flex items-center gap-3 my-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isMuted ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50'
                  }`}
                  title={isMuted ? 'Lauter Ton an' : 'Sirenenalarm stummschalten'}
                >
                  {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                </button>
                <div className="px-3 py-1 bg-teal-50 rounded-full border border-teal-150 text-[9px] font-mono text-teal-700 font-extrabold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                  <span>STANDORT SENDET LIVE</span>
                </div>
              </div>

              {/* Live coordinates log display */}
              <div className="w-full bg-slate-50 border border-slate-200/60 p-3 rounded-2xl mb-5 text-left space-y-1 font-mono text-[9px] text-slate-500 leading-normal">
                <div className="flex justify-between text-teal-600 font-black uppercase">
                  <span>GPS Satelliten Tracker</span>
                  <span>AKTIV (LIVE)</span>
                </div>
                <div>Koordinaten: 47.3769 N • 8.5417 O</div>
                <div>Genauigkeit: ±3 Meter • Zürich See</div>
                <div className="text-slate-400 italic">SMS-Berichte werden fortlaufend übertragen...</div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                {/* 112 Direct simulation */}
                <button
                  onClick={handleCallPolice}
                  className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-605 hover:to-sky-605 font-extrabold text-white rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-colors text-xs"
                >
                  <PhoneCall className="w-4 h-4 text-white" />
                  <span>Polizei rufen (Notruf 117)</span>
                </button>

                {/* SECURE VISIBLE DEACTIVATE BUTTON (Requested: Nach dem Auslösen gibt es einen gut sichtbaren Button "Alarm deaktivieren") */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleDeactivateAlarm}
                    id="btn-deactivate-alarm-visible"
                    className="w-full py-3 px-4 bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-black rounded-xl text-xs active:scale-98 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                    <span>Alarm deaktivieren</span>
                  </button>
                  <span className="text-[9.5px] text-slate-400 block mt-1 leading-none">Verschickt automatisch Entwarnungs-SMS an alle Notfallkontakte</span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* FOOTER BADGE */}
      <div className="text-center text-[9px] text-slate-450 font-mono flex items-center justify-center gap-1.5 mt-2 border-t border-slate-100 pt-2.5">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
        <span>Integrierter Diebstahl- & Deaktivierungsschutz</span>
      </div>

    </div>
  );
}
