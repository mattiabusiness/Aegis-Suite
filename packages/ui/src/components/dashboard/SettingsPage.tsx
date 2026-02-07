// ============================================================================
// AEGIS SUITE - SETTINGS PAGE COMPONENT
// File: packages/ui/src/components/dashboard/SettingsPage.tsx
// Reusable settings page for all verticals
// ============================================================================

'use client';

import * as React from 'react';
import {
  Store,
  Clock,
  CalendarCheck,
  UserCog,
  Save,
  Upload,
  X,
  Copy,
  Check,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Link2,
  Image,
  RefreshCw,
  Users,
  Layers,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/button';

// ============================================================================
// TYPES
// ============================================================================

export interface SettingsTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface BusinessGeneralData {
  name: string;
  slug: string;
  email: string;
  phone: string;
  website: string;
  addressStreet: string;
  addressCity: string;
  addressProvince: string;
  addressPostalCode: string;
  description: string;
  logoUrl: string;
  workstations: number;
}

export interface BusinessHoursRow {
  dayOfWeek: string;
  dayLabel: string;
  isOpen: boolean;
  openTime1: string;
  closeTime1: string;
  openTime2: string;
  closeTime2: string;
}

export interface ClosureItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isRecurringYearly: boolean;
}

export interface BookingSettings {
  bookingAdvanceMin: number;
  bookingAdvanceMax: number;
  cancellationPolicyHours: number;
  bufferMinutes: number;
  allowNoStaffPreference: boolean;
  allowMultipleServices: boolean;
}

export interface AccountData {
  fullName: string;
  email: string;
  phone: string;
}

export interface SettingsPageProps {
  generalData: BusinessGeneralData;
  businessHours: BusinessHoursRow[];
  closures: ClosureItem[];
  bookingSettings: BookingSettings;
  accountData: AccountData;
  publicUrlBase: string;
  businessType?: string;
  onSaveGeneral: (data: BusinessGeneralData) => Promise<void>;
  onUploadLogo: (file: File) => Promise<string>;
  onRemoveLogo: () => Promise<void>;
  onSaveHours: (hours: BusinessHoursRow[]) => Promise<void>;
  onSaveWorkstations: (count: number) => Promise<void>;
  onAddClosure: (closure: Omit<ClosureItem, 'id'>) => Promise<void>;
  onDeleteClosure: (id: string) => Promise<void>;
  onSaveBookings: (settings: BookingSettings) => Promise<void>;
  onSaveAccount: (data: { fullName: string; phone: string }) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getBusinessLabel(businessType?: string): string {
  switch (businessType) {
    case 'hair_salon': return 'salone';
    case 'beauty_center': return 'centro estetico';
    default: return 'salone';
  }
}

function getWorkstationLabel(businessType?: string): string {
  switch (businessType) {
    case 'hair_salon': return 'poltrone';
    case 'beauty_center': return 'cabine';
    default: return 'postazioni';
  }
}

// ============================================================================
// SMALL COMPONENTS
// ============================================================================

const DEFAULT_TABS: SettingsTab[] = [
  { id: 'general', label: 'Generale', icon: Store },
  { id: 'hours', label: 'Orari', icon: Clock },
  { id: 'bookings', label: 'Prenotazioni', icon: CalendarCheck },
  { id: 'account', label: 'Account', icon: UserCog },
];

function SaveButton({ saving, saved, onClick, disabled }: {
  saving: boolean; saved: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <Button onClick={onClick} loading={saving} disabled={disabled || saving} className="flex items-center gap-2">
      {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {saved ? 'Salvato!' : 'Salva modifiche'}
    </Button>
  );
}

function Section({ title, description, children }: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

/** Small hint text with info icon */
function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
      <Info className="w-3 h-3 flex-shrink-0" />
      {children}
    </p>
  );
}

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  }
}

// ============================================================================
// TAB: GENERAL
// ============================================================================

function GeneralTab({
  form, setForm, baseData, publicUrlBase, businessType,
  onSave, onUploadLogo, onRemoveLogo,
}: {
  form: BusinessGeneralData;
  setForm: React.Dispatch<React.SetStateAction<BusinessGeneralData>>;
  baseData: BusinessGeneralData;
  publicUrlBase: string;
  businessType?: string;
  onSave: (data: BusinessGeneralData) => Promise<void>;
  onUploadLogo: (file: File) => Promise<string>;
  onRemoveLogo: () => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const label = getBusinessLabel(businessType);
  const hasChanges = JSON.stringify(form) !== JSON.stringify(baseData);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { alert('Il file deve essere massimo 2MB'); return; }
    setUploading(true);
    try {
      const url = await onUploadLogo(file);
      setForm(prev => ({ ...prev, logoUrl: url }));
    } catch (err) {
      console.error('Error uploading logo:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleRemoveLogo = async () => {
    try { await onRemoveLogo(); setForm(prev => ({ ...prev, logoUrl: '' })); }
    catch (err) { console.error('Error removing logo:', err); }
  };

  const publicUrl = `${publicUrlBase}/${form.slug}`;
  const copyLink = () => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-6">
      <Section title="Link pubblico" description={`Il link del tuo ${label} per i clienti`}>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <Link2 className="w-4 h-4 text-accent-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate flex-1 font-mono">{publicUrl}</span>
          <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-600 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors flex-shrink-0">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiato!' : 'Copia'}
          </button>
        </div>
        <Hint>Lo slug &quot;{form.slug}&quot; non può essere modificato</Hint>
      </Section>

      <Section title="Logo" description={`Il logo del tuo ${label}`}>
        <div className="flex items-start gap-4">
          {form.logoUrl && (
            <div className="relative">
              <img src={form.logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
              <button onClick={handleRemoveLogo} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              dragOver ? 'border-accent-400 bg-accent-50' : 'border-gray-300 hover:border-purple-300 hover:bg-accent-50/30'
            }`}
          >
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
            {uploading ? <RefreshCw className="w-8 h-8 animate-spin text-accent-500 mb-2" /> : <Upload className="w-8 h-8 text-gray-400 mb-2" />}
            <p className="text-sm font-medium text-gray-700">{form.logoUrl ? 'Trascina per cambiare' : 'Trascina o clicca per caricare'}</p>
            <Hint>PNG, JPG o WebP. Max 2MB.</Hint>
          </div>
        </div>
      </Section>

      <Section title="Informazioni" description={`I dati principali del tuo ${label}`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sito web</label>
              <input type="url" value={form.website} onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))} placeholder="https://" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
            <input type="text" value={form.addressStreet} onChange={(e) => setForm(prev => ({ ...prev, addressStreet: e.target.value }))} placeholder="Via/Piazza" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
              <input type="text" value={form.addressCity} onChange={(e) => setForm(prev => ({ ...prev, addressCity: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input type="text" value={form.addressProvince} onChange={(e) => setForm(prev => ({ ...prev, addressProvince: e.target.value }))} maxLength={2} placeholder="TO" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
              <input type="text" value={form.addressPostalCode} onChange={(e) => setForm(prev => ({ ...prev, addressPostalCode: e.target.value }))} maxLength={5} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder={`Descrivi brevemente il tuo ${label}...`} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
            <Hint>Questa descrizione sarà visibile ai tuoi clienti</Hint>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <SaveButton saving={saving} saved={saved} onClick={handleSave} disabled={!hasChanges} />
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// TAB: HOURS
// ============================================================================

function HoursTab({
  hours, setHours, baseHours,
  closures, workstations, setWorkstations, baseWorkstations,
  businessType, onSaveHours, onSaveWorkstations, onAddClosure, onDeleteClosure,
}: {
  hours: BusinessHoursRow[];
  setHours: React.Dispatch<React.SetStateAction<BusinessHoursRow[]>>;
  baseHours: BusinessHoursRow[];
  closures: ClosureItem[];
  workstations: number;
  setWorkstations: React.Dispatch<React.SetStateAction<number>>;
  baseWorkstations: number;
  businessType?: string;
  onSaveHours: (hours: BusinessHoursRow[]) => Promise<void>;
  onSaveWorkstations: (count: number) => Promise<void>;
  onAddClosure: (closure: Omit<ClosureItem, 'id'>) => Promise<void>;
  onDeleteClosure: (id: string) => Promise<void>;
}) {
  const [savingHours, setSavingHours] = React.useState(false);
  const [savedHours, setSavedHours] = React.useState(false);
  const [savingStations, setSavingStations] = React.useState(false);
  const [savedStations, setSavedStations] = React.useState(false);
  const [newClosure, setNewClosure] = React.useState({ title: '', startDate: '', endDate: '', isRecurringYearly: false });
  const [addingClosure, setAddingClosure] = React.useState(false);
  const [showClosureForm, setShowClosureForm] = React.useState(false);

  const label = getBusinessLabel(businessType);
  const stationsLabel = getWorkstationLabel(businessType);
  const hoursChanged = JSON.stringify(hours) !== JSON.stringify(baseHours);
  const stationsChanged = workstations !== baseWorkstations;

  const updateHour = (idx: number, field: keyof BusinessHoursRow, value: string | boolean) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try { await onSaveHours(hours); setSavedHours(true); setTimeout(() => setSavedHours(false), 2000); }
    finally { setSavingHours(false); }
  };

  const handleSaveStations = async () => {
    setSavingStations(true);
    try {
      await onSaveWorkstations(workstations);
      setSavedStations(true);
      setTimeout(() => setSavedStations(false), 2000);
    } finally {
      setSavingStations(false);
    }
  };

  const handleAddClosure = async () => {
    if (!newClosure.title || !newClosure.startDate) return;
    setAddingClosure(true);
    try {
      await onAddClosure({ title: newClosure.title, startDate: newClosure.startDate, endDate: newClosure.endDate || newClosure.startDate, isRecurringYearly: newClosure.isRecurringYearly });
      setNewClosure({ title: '', startDate: '', endDate: '', isRecurringYearly: false });
      setShowClosureForm(false);
    } finally { setAddingClosure(false); }
  };

  return (
    <div className="space-y-6">
      <Section title="Orari di apertura" description={`Gli orari settimanali del tuo ${label}`}>
        <div className="space-y-2">
          {hours.map((h, idx) => (
            <div key={h.dayOfWeek} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${h.isOpen ? 'bg-white border border-gray-200' : 'bg-gray-50 border border-gray-100'}`}>
              <button onClick={() => updateHour(idx, 'isOpen', !h.isOpen)} className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${h.isOpen ? 'bg-accent-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${h.isOpen ? 'translate-x-5' : ''}`} />
              </button>
              <span className={`text-sm font-medium w-24 ${h.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>{h.dayLabel}</span>
              {h.isOpen ? (
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  <select value={h.openTime1} onChange={(e) => updateHour(idx, 'openTime1', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-gray-400 text-sm">–</span>
                  <select value={h.closeTime1} onChange={(e) => updateHour(idx, 'closeTime1', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {h.openTime2 || h.closeTime2 ? (
                    <>
                      <span className="text-gray-300 text-sm mx-1">|</span>
                      <select value={h.openTime2} onChange={(e) => updateHour(idx, 'openTime2', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                        <option value="">—</option>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-gray-400 text-sm">–</span>
                      <select value={h.closeTime2} onChange={(e) => updateHour(idx, 'closeTime2', e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white">
                        <option value="">—</option>
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button onClick={() => { updateHour(idx, 'openTime2', ''); updateHour(idx, 'closeTime2', ''); }} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <button onClick={() => { updateHour(idx, 'openTime2', '14:00'); updateHour(idx, 'closeTime2', '15:00'); }} className="text-xs text-accent-600 hover:underline ml-1">+ Pausa pranzo</button>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-400 italic">Chiuso</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <SaveButton saving={savingHours} saved={savedHours} onClick={handleSaveHours} disabled={!hoursChanged} />
        </div>
      </Section>

      <Section title={stationsLabel.charAt(0).toUpperCase() + stationsLabel.slice(1)} description={`Numero di ${stationsLabel} disponibili nel tuo ${label}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setWorkstations(prev => Math.max(1, prev - 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors">−</button>
            <span className="w-12 text-center text-sm font-semibold text-gray-900">{workstations}</span>
            <button onClick={() => setWorkstations(prev => prev + 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors">+</button>
          </div>
          {stationsChanged && !savedStations && (
            <SaveButton saving={savingStations} saved={savedStations} onClick={handleSaveStations} />
          )}
        </div>
      </Section>

      <Section title="Chiusure straordinarie" description="Giorni di chiusura extra (ferie, festività)">
        {closures.length > 0 && (
          <div className="space-y-2 mb-4">
            {closures.map(closure => (
              <div key={closure.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{closure.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500">
                      {new Date(closure.startDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {closure.endDate !== closure.startDate && (<> → {new Date(closure.endDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</>)}
                    </p>
                    {closure.isRecurringYearly && (
                      <span className="inline-flex items-center gap-1 text-xs text-accent-600"><RefreshCw className="w-3 h-3" />Ogni anno</span>
                    )}
                  </div>
                </div>
                <button onClick={() => onDeleteClosure(closure.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
        {showClosureForm ? (
          <div className="p-4 border border-accent-200 bg-accent-50/30 rounded-xl space-y-3">
            <input type="text" value={newClosure.title} onChange={(e) => setNewClosure(prev => ({ ...prev, title: e.target.value }))} placeholder="Nome chiusura (es. Natale, Ferie estive...)" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data inizio</label>
                <input type="date" value={newClosure.startDate} onChange={(e) => setNewClosure(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Data fine</label>
                <input type="date" value={newClosure.endDate} onChange={(e) => setNewClosure(prev => ({ ...prev, endDate: e.target.value }))} min={newClosure.startDate} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-white" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newClosure.isRecurringYearly} onChange={(e) => setNewClosure(prev => ({ ...prev, isRecurringYearly: e.target.checked }))} className="rounded border-gray-300 text-accent-600 focus:ring-accent-500" />
              <span className="text-sm text-gray-700">Ricorrente ogni anno</span>
            </label>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddClosure} loading={addingClosure} disabled={!newClosure.title || !newClosure.startDate} className="flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Aggiungi</Button>
              <Button variant="outline" onClick={() => setShowClosureForm(false)} className="text-sm">Annulla</Button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowClosureForm(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-accent-600 border border-dashed border-purple-300 rounded-xl hover:bg-accent-50 transition-colors w-full justify-center">
            <Plus className="w-4 h-4" />Aggiungi chiusura
          </button>
        )}
      </Section>
    </div>
  );
}

// ============================================================================
// TAB: BOOKINGS
// ============================================================================

function BookingsTab({
  form, setForm, baseSettings, onSave,
}: {
  form: BookingSettings;
  setForm: React.Dispatch<React.SetStateAction<BookingSettings>>;
  baseSettings: BookingSettings;
  onSave: (settings: BookingSettings) => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [savingToggle, setSavingToggle] = React.useState<string | null>(null);

  const rulesChanged =
    form.bookingAdvanceMin !== baseSettings.bookingAdvanceMin ||
    form.bookingAdvanceMax !== baseSettings.bookingAdvanceMax ||
    form.cancellationPolicyHours !== baseSettings.cancellationPolicyHours ||
    form.bufferMinutes !== baseSettings.bufferMinutes;

  const handleSaveRules = async () => {
    setSaving(true);
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };

  const handleToggle = async (key: 'allowNoStaffPreference' | 'allowMultipleServices') => {
    const newValue = !form[key];
    const newForm = { ...form, [key]: newValue };
    setForm(newForm);
    setSavingToggle(key);
    try { await onSave(newForm); }
    catch (err) { setForm(prev => ({ ...prev, [key]: !newValue })); console.error('Error saving toggle:', err); }
    finally { setSavingToggle(null); }
  };

  const toggleOptions = [
    { key: 'allowNoStaffPreference' as const, icon: Users, label: 'Consenti prenotazioni senza preferenza staff', desc: 'I clienti possono prenotare senza scegliere un operatore specifico' },
    { key: 'allowMultipleServices' as const, icon: Layers, label: 'Consenti prenotazione di più servizi insieme', desc: 'I clienti possono combinare più servizi in un\'unica prenotazione (es. taglio + colore)' },
  ];

  return (
    <div className="space-y-6">
      <Section title="Regole prenotazione" description="Configura limiti e tempi per le prenotazioni">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo minimo (min)</label>
              <input type="number" min={0} value={form.bookingAdvanceMin} onChange={(e) => setForm(prev => ({ ...prev, bookingAdvanceMin: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
              <Hint>Quanti minuti prima si può prenotare al minimo</Hint>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anticipo massimo (giorni)</label>
              <input type="number" min={1} value={form.bookingAdvanceMax} onChange={(e) => setForm(prev => ({ ...prev, bookingAdvanceMax: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
              <Hint>Con quanti giorni di anticipo massimo</Hint>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellazione minima (ore)</label>
              <input type="number" min={0} value={form.cancellationPolicyHours} onChange={(e) => setForm(prev => ({ ...prev, cancellationPolicyHours: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
              <Hint>Ore minime prima per cancellare</Hint>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buffer tra appuntamenti (min)</label>
              <input type="number" min={0} step={5} value={form.bufferMinutes} onChange={(e) => setForm(prev => ({ ...prev, bufferMinutes: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
              <Hint>Tempo di pausa tra un appuntamento e l&apos;altro</Hint>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <SaveButton saving={saving} saved={saved} onClick={handleSaveRules} disabled={!rulesChanged} />
        </div>
      </Section>

      <Section title="Opzioni" description="Personalizza il comportamento delle prenotazioni">
        <div className="space-y-1">
          {toggleOptions.map(option => {
            const Icon = option.icon;
            const isToggling = savingToggle === option.key;
            return (
              <div key={option.key} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <button onClick={() => handleToggle(option.key)} disabled={isToggling} className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${form[option.key] ? 'bg-accent-600' : 'bg-gray-300'} ${isToggling ? 'opacity-50' : ''}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${form[option.key] ? 'translate-x-5' : ''}`} />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-gray-500" /><p className="text-sm font-medium text-gray-900">{option.label}</p></div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-6">{option.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// TAB: ACCOUNT
// ============================================================================

function AccountTab({
  form, setForm, baseData, onSave, onChangePassword,
}: {
  form: { fullName: string; phone: string };
  setForm: React.Dispatch<React.SetStateAction<{ fullName: string; phone: string }>>;
  baseData: AccountData;
  onSave: (data: { fullName: string; phone: string }) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [currentPw, setCurrentPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [showCurrentPw, setShowCurrentPw] = React.useState(false);
  const [showNewPw, setShowNewPw] = React.useState(false);
  const [changingPw, setChangingPw] = React.useState(false);
  const [pwSuccess, setPwSuccess] = React.useState(false);
  const [pwError, setPwError] = React.useState('');

  const hasChanges = form.fullName !== baseData.fullName || form.phone !== (baseData.phone || '');

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (newPw.length < 6) { setPwError('La password deve essere di almeno 6 caratteri'); return; }
    if (newPw !== confirmPw) { setPwError('Le password non corrispondono'); return; }
    setChangingPw(true);
    try { await onChangePassword(currentPw, newPw); setPwSuccess(true); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setTimeout(() => setPwSuccess(false), 3000); }
    catch (err) { setPwError(err instanceof Error ? err.message : 'Errore nel cambio password'); }
    finally { setChangingPw(false); }
  };

  return (
    <div className="space-y-6">
      <Section title="Dati personali" description="Le tue informazioni di account">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={baseData.email} disabled className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            <Hint>L&apos;email non può essere modificata</Hint>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <SaveButton saving={saving} saved={saved} onClick={handleSave} disabled={!hasChanges} />
        </div>
      </Section>

      <Section title="Cambia password">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password attuale</label>
            <div className="relative">
              <input type={showCurrentPw ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
            <div className="relative">
              <input type={showNewPw ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conferma nuova password</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent" />
          </div>
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          {pwSuccess && <p className="text-sm text-green-600">Password modificata con successo!</p>}
          <Button onClick={handleChangePassword} loading={changingPw} disabled={!currentPw || !newPw || !confirmPw} variant="outline" className="flex items-center gap-2">Cambia password</Button>
        </div>
      </Section>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT — STATE LIVES HERE
// ============================================================================

export function SettingsPage({
  generalData,
  businessHours,
  closures,
  bookingSettings,
  accountData,
  publicUrlBase,
  businessType,
  onSaveGeneral,
  onUploadLogo,
  onRemoveLogo,
  onSaveHours,
  onSaveWorkstations,
  onAddClosure,
  onDeleteClosure,
  onSaveBookings,
  onSaveAccount,
  onChangePassword,
  className = '',
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = React.useState('general');

  // ========== CENTRALIZED STATE ==========
  // All form state lives here so it persists across tab switches

  const [generalForm, setGeneralForm] = React.useState(generalData);
  const [generalBase, setGeneralBase] = React.useState(generalData);

  const [hoursForm, setHoursForm] = React.useState(businessHours);
  const [hoursBase, setHoursBase] = React.useState(businessHours);

  const [workstationsForm, setWorkstationsForm] = React.useState(generalData.workstations);
  const [workstationsBase, setWorkstationsBase] = React.useState(generalData.workstations);

  const [bookingsForm, setBookingsForm] = React.useState(bookingSettings);
  const [bookingsBase, setBookingsBase] = React.useState(bookingSettings);

  const [accountForm, setAccountForm] = React.useState({ fullName: accountData.fullName, phone: accountData.phone });

  // ========== WRAPPED HANDLERS that update base after save ==========

  const handleSaveGeneral = async (data: BusinessGeneralData) => {
    await onSaveGeneral(data);
    setGeneralBase(data);
  };

  const handleSaveHours = async (hours: BusinessHoursRow[]) => {
    await onSaveHours(hours);
    setHoursBase(hours);
  };

  const handleSaveWorkstations = async (count: number) => {
    await onSaveWorkstations(count);
    setWorkstationsBase(count);
  };

  const handleSaveBookings = async (settings: BookingSettings) => {
    await onSaveBookings(settings);
    setBookingsBase(settings);
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {DEFAULT_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <GeneralTab form={generalForm} setForm={setGeneralForm} baseData={generalBase} publicUrlBase={publicUrlBase} businessType={businessType} onSave={handleSaveGeneral} onUploadLogo={onUploadLogo} onRemoveLogo={onRemoveLogo} />
      )}
      {activeTab === 'hours' && (
        <HoursTab hours={hoursForm} setHours={setHoursForm} baseHours={hoursBase} closures={closures} workstations={workstationsForm} setWorkstations={setWorkstationsForm} baseWorkstations={workstationsBase} businessType={businessType} onSaveHours={handleSaveHours} onSaveWorkstations={handleSaveWorkstations} onAddClosure={onAddClosure} onDeleteClosure={onDeleteClosure} />
      )}
      {activeTab === 'bookings' && (
        <BookingsTab form={bookingsForm} setForm={setBookingsForm} baseSettings={bookingsBase} onSave={handleSaveBookings} />
      )}
      {activeTab === 'account' && (
        <AccountTab form={accountForm} setForm={setAccountForm} baseData={accountData} onSave={onSaveAccount} onChangePassword={onChangePassword} />
      )}
    </div>
  );
}