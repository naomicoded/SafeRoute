/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Phone, User, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmergencyContact } from '../types';

interface ContactsViewProps {
  contacts: EmergencyContact[];
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onUpdateContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  simulateCall: (name: string, phone: string) => void;
}

export function ContactsView({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  simulateCall,
}: ContactsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Freundin');
  const [isTrusted, setIsTrusted] = useState(true);

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelation('Freundin');
    setIsTrusted(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onAddContact({
      name: name.trim(),
      phone: phone.trim(),
      relation,
      isTrusted,
    });
    setIsAdding(false);
    resetForm();
  };

  const startEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelation(contact.relation);
    setIsTrusted(contact.isTrusted);
  };

  const handleUpdateSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onUpdateContact({
      id,
      name: name.trim(),
      phone: phone.trim(),
      relation,
      isTrusted,
    });
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-4 px-0.5 text-left bg-white scrollbar-none" id="contacts-view-wrapper">
      
      {/* 5. Notfallkontakte - Header */}
      <div className="flex justify-between items-center mb-4 pt-1" id="contacts-heading-section">
        <div>
          <span className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest font-mono">Vertrauenskreis</span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">Notfallkontakte</h2>
        </div>
        {!isAdding && editingId === null && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            id="btn-add-contact-trigger"
            className="p-2 bg-gradient-to-r from-teal-500 to-sky-500 text-white rounded-full font-bold transition-transform active:scale-95 flex items-center justify-center cursor-pointer shadow-md shadow-sky-100/50"
            title="Kontakt hinzufügen"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="space-y-3.5 flex-1">
        
        {/* ADD CONTACT FORM */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-slate-50 border border-teal-100 rounded-2xl p-3.5 shadow-sm"
              id="add-contact-form-wrapper"
            >
              <form onSubmit={handleAddSubmit} className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <h3 className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-teal-500 fill-teal-100" /> Kontakt hinzufügen
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      resetForm();
                    }}
                    className="p-0.5 rounded-full text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Vollständiger Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="z.B. Svenja Müller"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 rounded-xl py-1.5 pl-8.5 pr-3 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Telefonnummer</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="z.B. +41 79 987 65 43"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 rounded-xl py-1.5 pl-8.5 pr-3 text-xs outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider pl-1">Beziehung</label>
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-1.5 px-2 text-xs outline-none focus:border-teal-400"
                    >
                      <option value="Mutter">Mutter</option>
                      <option value="Vater">Vater</option>
                      <option value="Partnerin">Partnerin</option>
                      <option value="Partner">Partner</option>
                      <option value="Freundin">Freundin</option>
                      <option value="Schwester">Schwester</option>
                      <option value="Sohn/Tochter">Sohn/Tochter</option>
                      <option value="Andere">Andere</option>
                    </select>
                  </div>

                  <div className="flex items-center pl-1 pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isTrusted}
                        onChange={(e) => setIsTrusted(e.target.checked)}
                        className="rounded border-slate-300 text-teal-500 w-3.5 h-3.5 accent-teal-600"
                      />
                      <span className="text-[11px] font-medium text-slate-600">Ort live teilen</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 mt-2 bg-gradient-to-r from-teal-500 to-sky-500 text-white font-extrabold rounded-xl shadow-xs text-xs flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Kontakt speichern</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTACTS LIST */}
        <div className="space-y-2.5" id="contacts-list-container">
          {contacts.map((contact) => (
            <div key={contact.id} className="relative" id={`contact-item-${contact.id}`}>
              {editingId === contact.id ? (
                /* EDITING FORM SHEET */
                <form
                  onSubmit={(e) => handleUpdateSubmit(e, contact.id)}
                  className="bg-yellow-50/50 p-3.5 rounded-2xl border border-yellow-200 space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-yellow-150 pb-1.5">
                    <span className="text-[9px] font-extrabold text-yellow-700 font-mono tracking-widest uppercase">Kontakt bearbeiten</span>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-0.5 rounded-full text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 focus:border-yellow-400 rounded-xl py-1.5 px-3 text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <input
                      type="tel"
                      placeholder="Telefon"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 focus:border-yellow-400 rounded-xl py-1.5 px-3 text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={relation}
                      onChange={(e) => setRelation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-1 px-2 text-xs focus:outline-none"
                    >
                      <option value="Mutter">Mutter</option>
                      <option value="Vater">Vater</option>
                      <option value="Partnerin">Partnerin</option>
                      <option value="Partner">Partner</option>
                      <option value="Freundin">Freundin</option>
                      <option value="Schwester">Schwester</option>
                      <option value="Andere">Andere</option>
                    </select>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none pl-1">
                      <input
                        type="checkbox"
                        checked={isTrusted}
                        onChange={(e) => setIsTrusted(e.target.checked)}
                        className="rounded border-slate-300 text-yellow-500 w-3.5 h-3.5 accent-yellow-600"
                      />
                      <span className="text-[11px] text-slate-600">Ort live teilen</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 rounded-xl bg-yellow-500 text-slate-900 font-extrabold text-xs cursor-pointer hover:bg-yellow-600"
                    >
                      Änderung speichern
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteContact(contact.id);
                        setEditingId(null);
                      }}
                      className="px-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center cursor-pointer"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                /* REGULAR CARD */
                <div className="bg-slate-50/70 border border-slate-100 hover:border-slate-200/80 rounded-2xl p-3 flex items-center justify-between transition-all group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center uppercase font-mono font-black text-xs text-sky-600">
                        {contact.photoUrl ? (
                          <img
                            src={contact.photoUrl}
                            alt={contact.name}
                            className="w-full h-full rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      {contact.isTrusted && (
                        <span 
                          className="absolute -bottom-0.5 -right-0.5 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-teal-500 flex items-center justify-center text-[7px] font-black text-white" 
                          title="Standort-Freigabe aktiv"
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-800 truncate block">{contact.name}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.2 select-none shrink-0 bg-sky-100 text-sky-700 rounded-full font-mono">
                          {contact.relation}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        📞 {contact.phone}
                      </div>
                      {contact.isTrusted && (
                        <div className="text-[9px] text-teal-600 flex items-center gap-0.5 mt-0.5 font-bold font-mono">
                          <Share2 className="w-2.5 h-2.5 shrink-0" /> Live-Tracker aktiv
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => simulateCall(contact.name, contact.phone)}
                      className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-600 border border-teal-100/30 cursor-pointer"
                      title="Anrufen simulieren"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEdit(contact)}
                      className="p-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 text-slate-500 cursor-pointer"
                      title="Bearbeiten"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
              Möchtest du einen Schutzbegleiter hinzufügen? Füge oben deinen ersten Kontakt hinzu!
            </div>
          )}
        </div>
      </div>

      {/* Security note */}
      <div className="mt-4 p-2.5 rounded-xl bg-sky-50/50 border border-sky-100/60 text-[10px] text-slate-500 leading-relaxed">
        <strong>Sicherheits-Information:</strong> Deine Kontakte werden nur alarmiert, wenn du den Heimweg-Timer startest und dieser abläuft, oder wenn du aktiv den SOS-Knopf drückst.
      </div>
    </div>
  );
}
