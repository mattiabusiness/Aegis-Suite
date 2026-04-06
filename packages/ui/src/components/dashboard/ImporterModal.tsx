// ============================================================================
// AEGIS SUITE - IMPORTER MODAL
// File: packages/ui/src/components/dashboard/ImporterModal.tsx
//
// Wizard 3-step per importazione universale clienti da file Excel/CSV.
// Stile identico ad AppointmentModal e QRCodeModal:
//   background bianco traslucido, bordo viola, shadow purple, testo dark.
// Step 1: Upload file (drag & drop)
// Step 2: Riepilogo (validi, warning, duplicati) + opzione duplicati
// Step 3: Progress import + stato successo + card inviti
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  ArrowLeft,
  FileText,
  Check,
  Layers,
  SkipForward,
  PencilLine,
} from 'lucide-react';

// ============================================================================
// LOCAL TYPES
// ============================================================================

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

interface ColumnMapping {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  preferences: string | null;
  total_appointments: string | null;
  total_spent: string | null;
  last_visit_at: string | null;
  birth_date: string | null;
  gender: string | null;
}

export interface ImporterParsedRow {
  full_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  preferences?: string;
  total_appointments?: number;
  total_spent?: number;
  last_visit_at?: string;
  birth_date?: string;
  gender?: string;
}

interface ValidationCounts {
  valid: ImporterParsedRow[];
  warnings: ImporterParsedRow[];
  duplicates: ImporterParsedRow[];
  errors: ImporterParsedRow[];
}

export interface ImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  onCheckDuplicates?: (
    emails: string[],
    phones: string[],
  ) => Promise<{ duplicateEmails: Set<string>; duplicatePhones: Set<string> }>;
}

// ============================================================================
// COLUMN ALIASES
// ============================================================================

// Pass 1: exact match (after trim + collapse whitespace + lowercase)
const ALIASES: Record<keyof ColumnMapping, string[]> = {
  full_name: [
    'full_name',
    'nome completo', 'nome cognome', 'cognome nome', 'cognome e nome',
    'nome e cognome', 'nominativo', 'intestatario', 'nome', 'cliente',
    'ragione sociale', 'denominazione', 'anagrafica', 'titolare', 'paziente',
    'full name', 'name', 'customer', 'customer name', 'contact',
    'contact name', 'client', 'client name',
  ],
  email: [
    'email', 'e-mail', 'e mail', 'mail', 'posta elettronica',
    'indirizzo email', 'indirizzo e-mail', 'indirizzo mail',
    'email cliente', 'email address', 'email/pec',
  ],
  phone: [
    'telefono', 'tel', 'tel.', 'phone', 'cellulare', 'mobile', 'cell',
    'cell.', 'numero', 'numero di telefono', 'numero cellulare',
    'numero tel', 'n. tel', 'n. cellulare', 'n.tel', 'n.cellulare',
    'recapito', 'recapito telefonico', 'whatsapp', 'telefono cellulare',
    'phone number', 'contatto telefonico', 'telefono/cellulare',
    'cel', 'cel.', 'contatto', 'contatto tel', 'contatto telefonico',
  ],
  notes: [
    'note', 'notes', 'appunti', 'commenti', 'commento', 'memo',
    'osservazioni', 'osservazione', 'annotazioni', 'avvertenze',
    'info', 'informazioni', 'info cliente', 'descrizione', 'descrizione cliente',
  ],
  preferences: [
    'preferenze', 'preferences', 'preferenza', 'note preferenze',
    'trattamenti preferiti', 'richieste', 'servizi preferiti', 'servizi richiesti',
    'pref', 'pref.', 'pref cliente', 'preferenze cliente',
  ],
  total_appointments: [
    // Italian
    'appuntamenti', 'n. appuntamenti', 'n appuntamenti', 'num appuntamenti',
    'numero appuntamenti', 'visite', 'totale visite', 'n. visite',
    'prenotazioni', 'tot appuntamenti', 'numero visite', 'tot visite',
    // English
    'appointments', 'total appointments', 'appointment count', 'num appointments',
    'number of appointments', 'no. appointments', '# appointments',
    'visit count', 'visits count', 'total visits', 'visits', 'num visits',
    'number of visits', 'no. visits', '# visits',
    'booking count', 'total bookings', 'bookings', 'num bookings',
    'sessions', 'total sessions', 'session count',
  ],
  total_spent: [
    // Italian
    'spesa totale', 'totale speso', 'speso', 'speso totale', 'fatturato', 'importo totale',
    'spesa', 'valore', 'totale', 'totale fatturato', 'ricavo', 'ricavi',
    // English
    'total spent', 'amount spent', 'money spent', 'total amount',
    'amount', 'revenue', 'total revenue', 'gross revenue',
    'spend', 'total spend', 'spending',
    'paid', 'total paid', 'amount paid',
    'lifetime value', 'ltv', 'sales', 'total sales',
  ],
  last_visit_at: [
    // Italian
    'ultima visita', 'ultima data', 'data ultimo appuntamento',
    'ultimo accesso', 'data ultima visita', 'ultimo appuntamento',
    'data ultima prenotazione', 'ultima prenotazione',
    'ult. visita', 'ult visita', 'data ult. visita', 'data ult visita',
    'ult. appuntamento', 'ult appuntamento',
    // English
    'last visit', 'last visit date', 'date last visit', 'date of last visit',
    'last appointment', 'last appointment date', 'date of last appointment',
    'last booking', 'last booking date',
    'last seen', 'last session', 'last session date',
    'latest visit', 'latest appointment', 'latest booking',
    'most recent visit', 'most recent appointment',
    'recent visit', 'last date', 'last visit at',
  ],
  birth_date: [
    'data nascita', 'data di nascita', 'birthday', 'dob', 'nascita',
    'data natale', 'compleanno', 'data compleanno', 'birth date', 'birth day',
    'd.n', 'd.n.', 'dn', 'anno di nascita', 'anno nascita',
  ],
  gender: ['sesso', 'gender', 'genere', 'sex', 'm/f', 'sesso/genere'],
};

// Pass 2: partial contains match
const PARTIAL_KEYWORDS: Record<keyof ColumnMapping, string[]> = {
  full_name: ['nome', 'cognome', 'cliente', 'nominativo', 'anagrafica', 'paziente', 'intestat'],
  email: ['email', 'mail'],
  phone: ['telefono', 'cellulare', 'mobile', 'phone', 'whatsapp', 'recapito'],
  notes: ['note', 'commento', 'osservazione', 'annotazione', 'appunto'],
  preferences: ['preferenz', 'trattament', 'pref'],
  total_appointments: ['appuntament', 'prenotazion', 'appointment', 'booking', 'session'],
  total_spent: ['spesa', 'fattur', 'importo', 'ricavo', 'speso', 'spent', 'revenue', 'amount', 'paid', 'ltv', 'lifetime'],
  last_visit_at: ['ultima visita', 'ultimo appuntamento', 'ultima prenotazione', 'ult. vis', 'ult. appunt', 'last visit', 'last appoint', 'last booking', 'last seen', 'latest visit', 'recent visit'],
  birth_date: ['nascita', 'compleanno', 'birthday'],
  gender: ['sesso', 'genere', 'gender'],
};

// ============================================================================
// PARSING HELPERS (browser-only, called client-side)
// ============================================================================

function detectDelimiter(line: string): string {
  const counts: Record<string, number> = {
    ',': (line.match(/,/g) || []).length,
    ';': (line.match(/;/g) || []).length,
    '\t': (line.match(/\t/g) || []).length,
  };
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function parseCSVLine(line: string, delimiter = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim()); current = '';
    } else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

async function parseFile(file: File): Promise<ParsedData> {
  const arrayBuffer = await file.arrayBuffer();
  const ext = file.name.split('.').pop()?.toLowerCase();
  let headers: string[] = [];
  let rows: Record<string, string>[] = [];

  if (ext === 'csv') {
    let text = new TextDecoder('utf-8').decode(arrayBuffer);
    // Strip UTF-8 BOM (common in Excel exports)
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return { headers: [], rows: [], totalRows: 0 };
    const delimiter = detectDelimiter(lines[0]);
    headers = parseCSVLine(lines[0], delimiter);
    rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line, delimiter);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
      return row;
    });
  } else {
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '', raw: false });
    if (jsonData.length === 0) return { headers: [], rows: [], totalRows: 0 };
    headers = (jsonData[0] as string[]).map(h => String(h ?? '').trim());
    rows = jsonData.slice(1).map(rawRow => {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = String((rawRow as string[])[i] ?? '').trim(); });
      return row;
    });
  }

  rows = rows.filter(r => Object.values(r).some(v => v !== ''));
  return { headers, rows, totalRows: rows.length };
}

function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    full_name: null, email: null, phone: null, notes: null, preferences: null,
    total_appointments: null, total_spent: null, last_visit_at: null, birth_date: null, gender: null,
  };
  // Normalize: lowercase, underscores→spaces, strip currency/parentheses/trailing period, collapse spaces
  const normalized = headers.map(h =>
    h.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/[€$£¥]/g, '')
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/\.$/, '')
      .trim()
      .replace(/\s+/g, ' ')
  );

  // Pass 1: exact match
  for (const [field, aliases] of Object.entries(ALIASES) as [keyof ColumnMapping, string[]][]) {
    if (mapping[field] !== null) continue;
    for (const alias of aliases) {
      const idx = normalized.indexOf(alias.toLowerCase());
      if (idx !== -1) { mapping[field] = headers[idx]; break; }
    }
  }

  // Pass 2: partial contains (only for still-unmapped fields)
  for (const [field, keywords] of Object.entries(PARTIAL_KEYWORDS) as [keyof ColumnMapping, string[]][]) {
    if (mapping[field] !== null) continue;
    for (let i = 0; i < normalized.length; i++) {
      const alreadyClaimed = (Object.values(mapping) as (string | null)[]).includes(headers[i]);
      if (alreadyClaimed) continue;
      for (const kw of keywords) {
        if (normalized[i].includes(kw)) { mapping[field] = headers[i]; break; }
      }
      if (mapping[field] !== null) break;
    }
  }

  return mapping;
}

function normalizeEmail(v?: string): string | undefined {
  if (!v) return undefined;
  const c = v.toLowerCase().trim();
  return c.includes('@') ? c : undefined;
}

function normalizePhone(v?: string): string | undefined {
  if (!v) return undefined;
  let c = v.replace(/[\s\-().+]/g, '').replace(/^(\+39|0039)/, '').replace(/\D/g, '');
  return c.length >= 6 ? c : undefined;
}

function normalizeDate(v?: string): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.substring(0, 10);
  const m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return undefined;
}

function normalizeGender(v?: string): string | undefined {
  if (!v) return undefined;
  const lv = v.toLowerCase().trim();
  if (['m', 'male', 'uomo', 'maschio', 'm.'].includes(lv)) return 'M';
  if (['f', 'female', 'donna', 'femmina', 'femminile', 'f.'].includes(lv)) return 'F';
  if (['altro', 'other', 'non specificato', 'nd', 'n/d'].includes(lv)) return 'other';
  return undefined;
}

function validateAndMap(data: ParsedData, mapping: ColumnMapping): ValidationCounts {
  const valid: ImporterParsedRow[] = [];
  const warnings: ImporterParsedRow[] = [];
  const errors: ImporterParsedRow[] = [];

  for (const rawRow of data.rows) {
    const full_name = (mapping.full_name ? rawRow[mapping.full_name] : '').trim();
    if (!full_name) { errors.push({ full_name: '' }); continue; }

    const email = normalizeEmail(mapping.email ? rawRow[mapping.email] : undefined);
    const phone = normalizePhone(mapping.phone ? rawRow[mapping.phone] : undefined);
    const notes = (mapping.notes ? rawRow[mapping.notes] : undefined) || undefined;
    const preferences = (mapping.preferences ? rawRow[mapping.preferences] : undefined) || undefined;
    const taRaw = mapping.total_appointments ? rawRow[mapping.total_appointments] : undefined;
    const total_appointments = taRaw !== undefined ? parseFloat(taRaw) || 0 : undefined;
    const tsRaw = mapping.total_spent ? rawRow[mapping.total_spent] : undefined;
    const total_spent = tsRaw !== undefined ? parseFloat(tsRaw.replace(',', '.').replace(/[^0-9.]/g, '')) || 0 : undefined;
    const last_visit_at = normalizeDate(mapping.last_visit_at ? rawRow[mapping.last_visit_at] : undefined);
    const birth_date = normalizeDate(mapping.birth_date ? rawRow[mapping.birth_date] : undefined);
    const gender = normalizeGender(mapping.gender ? rawRow[mapping.gender] : undefined);

    const parsed: ImporterParsedRow = {
      full_name,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(notes ? { notes } : {}),
      ...(preferences ? { preferences } : {}),
      ...(total_appointments !== undefined ? { total_appointments } : {}),
      ...(total_spent !== undefined ? { total_spent } : {}),
      ...(last_visit_at ? { last_visit_at } : {}),
      ...(birth_date ? { birth_date } : {}),
      ...(gender ? { gender } : {}),
    };

    if (!email && !phone) { warnings.push(parsed); }
    else { valid.push(parsed); }
  }

  return { valid, warnings, duplicates: [], errors };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ImporterModal({
  isOpen,
  onClose,
  onImportComplete,
  onCheckDuplicates,
}: ImporterModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isParsing, setIsParsing] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [counts, setCounts] = React.useState<ValidationCounts | null>(null);
  const [parsedRows, setParsedRows] = React.useState<ImporterParsedRow[]>([]);
  const [updateDuplicates, setUpdateDuplicates] = React.useState(false);
  const [isCheckingDups, setIsCheckingDups] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = React.useState<{ success: number; errors: number; importedIds: string[] } | null>(null);
  const [isInviting, setIsInviting] = React.useState(false);
  const [inviteDone, setInviteDone] = React.useState(false);
  const stepKeyRef = React.useRef(0);
  const [stepDir, setStepDir] = React.useState<'fwd' | 'bwd'>('fwd');

  React.useEffect(() => {
    if (isOpen) { setMounted(true); setClosing(false); resetState(); }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  function resetState() {
    setStep(1); setIsParsing(false); setParseError(null); setCounts(null);
    setParsedRows([]); setUpdateDuplicates(false); setIsCheckingDups(false);
    setIsImporting(false); setImportProgress({ current: 0, total: 0 });
    setImportResult(null); setIsInviting(false); setInviteDone(false);
    setStepDir('fwd'); stepKeyRef.current = 0;
  }

  function handleClose() {
    setMounted(false);
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); resetState(); }, 220);
  }

  function goToStep(s: 1 | 2 | 3) {
    setStepDir(s > step ? 'fwd' : 'bwd');
    stepKeyRef.current += 1;
    setStep(s);
  }

  async function handleFileDrop(file: File) {
    setParseError(null);
    setIsParsing(true);
    try {
      const data = await parseFile(file);
      if (data.totalRows === 0) {
        setParseError('Il file è vuoto o non contiene righe valide.');
        setIsParsing(false);
        return;
      }
      const mapping = autoDetectMapping(data.headers);
      if (!mapping.full_name) {
        setParseError("Non è stata trovata la colonna 'Nome'. Assicurati che il file contenga una colonna chiamata Nome, Cliente, Nominativo o Full Name.");
        setIsParsing(false);
        return;
      }
      const result = validateAndMap(data, mapping);
      const allRows = [...result.valid, ...result.warnings];
      setParsedRows(allRows);
      let finalCounts: ValidationCounts = { ...result, duplicates: [] };
      setCounts(finalCounts);
      setIsParsing(false);
      goToStep(2);

      if (onCheckDuplicates && allRows.length > 0) {
        setIsCheckingDups(true);
        try {
          const emails = allRows.filter(r => r.email).map(r => r.email!);
          const phones = allRows.filter(r => r.phone).map(r => r.phone!);
          const { duplicateEmails, duplicatePhones } = await onCheckDuplicates(emails, phones);
          const duplicates = allRows.filter(r =>
            (r.email && duplicateEmails.has(r.email)) || (r.phone && duplicatePhones.has(r.phone))
          );
          finalCounts = { ...result, duplicates };
          setCounts(finalCounts);
        } catch { /* non-critical */ }
        finally { setIsCheckingDups(false); }
      }
    } catch {
      setParseError('Errore durante la lettura del file. Verifica che il formato sia supportato (.xlsx, .csv).');
      setIsParsing(false);
    }
  }

  async function handleConfirmImport() {
    if (!counts) return;
    const rowsToImport = [...counts.valid, ...counts.warnings].filter(r =>
      updateDuplicates ? true : !counts.duplicates.some(d => d.email === r.email && d.phone === r.phone)
    );
    if (rowsToImport.length === 0) return;
    goToStep(3);
    setIsImporting(true);

    // Split into batches of 25 for real progress tracking
    const BATCH_SIZE = 25;
    const batches: ImporterParsedRow[][] = [];
    for (let i = 0; i < rowsToImport.length; i += BATCH_SIZE) {
      batches.push(rowsToImport.slice(i, i + BATCH_SIZE));
    }

    setImportProgress({ current: 0, total: rowsToImport.length });

    let totalSuccess = 0;
    let totalErrors = 0;
    const allImportedIds: string[] = [];
    let processed = 0;

    try {
      for (const batch of batches) {
        const res = await fetch('/api/clients/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: batch, updateDuplicates }),
        });
        if (res.ok) {
          const data = await res.json() as { success: number; errors: number; importedIds: string[] };
          totalSuccess += data.success;
          totalErrors += data.errors;
          allImportedIds.push(...data.importedIds);
        } else {
          totalErrors += batch.length;
        }
        processed += batch.length;
        setImportProgress({ current: processed, total: rowsToImport.length });
      }
      setImportResult({ success: totalSuccess, errors: totalErrors, importedIds: allImportedIds });
    } catch {
      setImportResult({ success: totalSuccess, errors: rowsToImport.length - totalSuccess, importedIds: allImportedIds });
    } finally {
      setIsImporting(false);
    }
  }

  async function handleSendInvites() {
    if (!importResult || importResult.importedIds.length === 0) return;
    setIsInviting(true);
    try {
      await fetch('/api/clients/invite-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds: importResult.importedIds }),
      });
    } catch { /* stub */ }
    finally {
      setIsInviting(false);
      setInviteDone(true);
      setTimeout(() => { onImportComplete(); handleClose(); }, 900);
    }
  }

  function handleSkipInvites() { onImportComplete(); handleClose(); }

  // ── DROPZONE ────────────────────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: isParsing,
    onDrop: accepted => { if (accepted[0]) handleFileDrop(accepted[0]); },
  });

  if (!isOpen && !closing) return null;
  if (typeof window === 'undefined') return null;

  const invitableCount = parsedRows.filter(r => r.email).length;

  // ── MODAL CARD STYLE (stesso di AppointmentModal / QRCodeModal) ─────────────
  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 24,
    border: '1px solid rgba(168,85,247,0.35)',
    boxShadow: mounted
      ? '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(147,51,234,0.12), 0 0 0 1px rgba(168,85,247,0.2), 0 0 40px rgba(168,85,247,0.18)'
      : '0 8px 32px rgba(0,0,0,0.08)',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
    maxHeight: 'calc(100vh - 2rem)',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const stepContent = (
    <div key={stepKeyRef.current} style={{ animation: `imp-slide-${stepDir} 0.28s cubic-bezier(0.16,1,0.3,1) both` }}>
      {step === 1 && (
        <Step1
          isDragActive={isDragActive} isParsing={isParsing} parseError={parseError}
          getRootProps={getRootProps} getInputProps={getInputProps}
        />
      )}
      {step === 2 && counts && (
        <Step2
          counts={counts} isCheckingDups={isCheckingDups}
          updateDuplicates={updateDuplicates} onUpdateDuplicatesChange={setUpdateDuplicates}
          onBack={() => goToStep(1)} onConfirm={handleConfirmImport}
        />
      )}
      {step === 3 && (
        <Step3
          isImporting={isImporting} importProgress={importProgress}
          importResult={importResult} invitableCount={invitableCount}
          isInviting={isInviting} inviteDone={inviteDone}
          onSendInvites={handleSendInvites} onSkipInvites={handleSkipInvites}
        />
      )}
    </div>
  );

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop — stesso di AppointmentModal */}
      <div
        className="absolute inset-0"
        onClick={step !== 3 ? handleClose : undefined}
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-lg" style={cardStyle}>
        {/* Ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Importa Clienti</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {step === 1 ? 'Carica un file Excel o CSV' : step === 2 ? 'Verifica e conferma' : 'Importazione in corso'}
              </p>
            </div>
          </div>
          {step !== 3 && (
            <button onClick={handleClose}
              className="p-2 rounded-xl"
              style={{ color: 'rgba(0,0,0,0.3)', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(0,0,0,0.6)'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)' }} />

        {/* Body */}
        <div className="overflow-y-auto flex-1" style={{ overflowX: 'hidden', scrollbarWidth: 'none' }}>
          {stepContent}
        </div>
      </div>

      <style>{`
        @keyframes imp-slide-fwd { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes imp-slide-bwd { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes imp-shimmer   { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes imp-skeleton  { 0%,100% { opacity: 0.35; } 50% { opacity: 0.7; } }
        @keyframes imp-fade-up   { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes imp-pulse-border {
          0%,100% { box-shadow: 0 0 0 4px rgba(168,85,247,0.08), inset 0 0 20px rgba(168,85,247,0.04); }
          50%      { box-shadow: 0 0 0 7px rgba(168,85,247,0.14), inset 0 0 30px rgba(168,85,247,0.07); }
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}

// ============================================================================
// STEP 1 — UPLOAD
// ============================================================================

interface Step1Props {
  isDragActive: boolean;
  isParsing: boolean;
  parseError: string | null;
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
}

function Step1({ isDragActive, isParsing, parseError, getRootProps, getInputProps }: Step1Props) {
  return (
    <div className="px-6 pt-5 pb-6 space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className="relative rounded-2xl cursor-pointer select-none text-center"
        style={{
          border: isDragActive ? '2px dashed rgba(168,85,247,0.6)' : '2px dashed rgba(168,85,247,0.2)',
          background: isDragActive ? 'rgba(168,85,247,0.04)' : 'rgba(168,85,247,0.01)',
          padding: '36px 24px',
          outline: 'none',
          transition: 'all 0.2s ease',
          animation: isDragActive ? 'imp-pulse-border 1s ease-in-out infinite' : 'none',
        }}
      >
        <input {...getInputProps()} />

        {isParsing ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">Analisi del file in corso...</p>
            {[55, 75, 45].map((w, i) => (
              <div key={i} className="h-3 rounded-full mx-auto"
                style={{ width: `${w}%`, background: 'rgba(168,85,247,0.1)', animation: `imp-skeleton 1.4s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
              style={{
                background: isDragActive ? 'rgba(147,51,234,0.1)' : 'rgba(168,85,247,0.06)',
                border: `1px solid ${isDragActive ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.12)'}`,
                transition: 'all 0.2s ease',
              }}>
              <Upload className="w-5 h-5" style={{ color: isDragActive ? '#7c3aed' : '#a855f7' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: isDragActive ? '#7c3aed' : '#374151' }}>
                {isDragActive ? 'Rilascia il file per caricarlo' : 'Trascina il file qui oppure clicca per scegliere'}
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                Formati supportati: Excel (.xlsx) · CSV (.csv)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error or hint */}
      {parseError ? (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
          <p className="text-sm text-red-600 leading-relaxed">{parseError}</p>
        </div>
      ) : (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
          <p className="text-xs text-gray-400 leading-relaxed">
            Il file deve contenere almeno una colonna con i nomi dei clienti (Nome, Cliente, Nominativo o Full Name).
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 2 — RIEPILOGO
// ============================================================================

interface Step2Props {
  counts: ValidationCounts;
  isCheckingDups: boolean;
  updateDuplicates: boolean;
  onUpdateDuplicatesChange: (v: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
}

function Step2({ counts, isCheckingDups, updateDuplicates, onUpdateDuplicatesChange, onBack, onConfirm }: Step2Props) {
  const total = counts.valid.length + counts.warnings.length;

  const stats: Array<{
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    value: React.ReactNode;
    bg: string;
    border: string;
    borderHover: string;
    shadow: string;
    textColor: string;
    iconBg: string;
    iconColor: string;
    accentColor: string;
  }> = [
    {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Clienti validi',
      sublabel: "pronti all'import",
      value: counts.valid.length.toLocaleString('it-IT'),
      bg: 'rgba(5,150,105,0.04)',
      border: 'rgba(5,150,105,0.12)',
      borderHover: 'rgba(5,150,105,0.3)',
      shadow: '0 8px 24px rgba(5,150,105,0.13), 0 2px 8px rgba(5,150,105,0.08)',
      textColor: '#059669',
      iconBg: 'rgba(5,150,105,0.1)',
      iconColor: '#059669',
      accentColor: 'linear-gradient(90deg, #059669, rgba(5,150,105,0.2))',
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Senza contatto',
      sublabel: 'senza email o tel.',
      value: counts.warnings.length.toLocaleString('it-IT'),
      bg: 'rgba(245,158,11,0.04)',
      border: 'rgba(245,158,11,0.12)',
      borderHover: 'rgba(245,158,11,0.3)',
      shadow: '0 8px 24px rgba(245,158,11,0.13), 0 2px 8px rgba(245,158,11,0.08)',
      textColor: '#d97706',
      iconBg: 'rgba(245,158,11,0.1)',
      iconColor: '#d97706',
      accentColor: 'linear-gradient(90deg, #d97706, rgba(245,158,11,0.2))',
    },
    {
      icon: <RefreshCw className="w-4 h-4" />,
      label: 'Duplicati',
      sublabel: 'già nel database',
      value: isCheckingDups ? (
        <span style={{ display: 'flex', alignItems: 'center', height: 29 }}>
          <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin inline-block" />
        </span>
      ) : counts.duplicates.length.toLocaleString('it-IT'),
      bg: 'rgba(100,116,139,0.04)',
      border: 'rgba(100,116,139,0.12)',
      borderHover: 'rgba(100,116,139,0.3)',
      shadow: '0 8px 24px rgba(100,116,139,0.13), 0 2px 8px rgba(100,116,139,0.06)',
      textColor: '#64748b',
      iconBg: 'rgba(100,116,139,0.1)',
      iconColor: '#64748b',
      accentColor: 'linear-gradient(90deg, #64748b, rgba(100,116,139,0.2))',
    },
  ];

  const isDisabled = total === 0;

  return (
    <div className="px-6 pt-5 pb-6 space-y-4">
      <p className="text-sm font-semibold text-gray-700">Pronti per l'importazione:</p>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ icon, label, sublabel, value, bg, border, borderHover, shadow, textColor, iconBg, iconColor, accentColor }, idx) => (
          <div
            key={label}
            style={{
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: 12,
              padding: '10px 10px 12px',
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
              cursor: 'default',
              animation: `imp-fade-up 0.3s ease ${idx * 0.07}s both`,
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = shadow;
              e.currentTarget.style.border = `1px solid ${borderHover}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = `1px solid ${border}`;
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 2, borderRadius: 99, background: accentColor, marginBottom: 13 }} />
            {/* Icon */}
            <div style={{ width: 26, height: 26, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: iconColor }}>
              {icon}
            </div>
            {/* Value */}
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1, color: textColor, fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
              {value}
            </div>
            {/* Label */}
            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>{label}</div>
            {/* Sublabel */}
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>{sublabel}</div>
          </div>
        ))}
      </div>
      {counts.errors.length > 0 && (
        <p className="text-xs text-gray-400 px-0.5">
          {counts.errors.length} {counts.errors.length === 1 ? 'riga scartata' : 'righe scartate'} per assenza del nome
        </p>
      )}

      {/* Duplicate handling */}
      {!isCheckingDups && counts.duplicates.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(168,85,247,0.15)' }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'rgba(168,85,247,0.04)', borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(168,85,247,0.1)' }}>
              <Layers className="w-3.5 h-3.5" style={{ color: '#9333ea' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#4b5563' }}>Come gestire i duplicati?</p>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(168,85,247,0.08)', color: '#7c3aed' }}>
              {counts.duplicates.length} trovati
            </span>
          </div>
          {/* Options */}
          <div className="p-3 space-y-2" style={{ background: '#fafafa' }}>
            {([
              { value: false, Icon: SkipForward, label: 'Salta i duplicati', description: 'I clienti già presenti non vengono toccati' },
              { value: true,  Icon: PencilLine,  label: 'Aggiorna dati esistenti', description: 'Sovrascrive nome, telefono, email, note del cliente esistente' },
            ] as const).map(({ value, Icon, label, description }) => {
              const active = updateDuplicates === value;
              return (
                <div
                  key={String(value)}
                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                  style={{
                    background: active ? 'rgba(168,85,247,0.05)' : '#fff',
                    border: `1.5px solid ${active ? 'rgba(147,51,234,0.3)' : 'rgba(0,0,0,0.06)'}`,
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}
                  onClick={() => onUpdateDuplicatesChange(value)}
                >
                  <div className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: active ? '#9333ea' : '#fff',
                      border: active ? 'none' : '1.5px solid rgba(0,0,0,0.2)',
                      transition: 'all 0.15s ease',
                    }}>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: active ? '#7c3aed' : '#9ca3af' }} />
                      <p className="text-sm font-semibold" style={{ color: active ? '#7c3aed' : '#374151' }}>{label}</p>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
        >
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </button>

        <button
          onClick={onConfirm}
          disabled={isDisabled}
          className="flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden"
          style={{
            background: isDisabled ? '#c084fc' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
            boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(147,51,234,0.25)',
            opacity: isDisabled ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = isDisabled ? 'none' : '0 2px 8px rgba(147,51,234,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {!isDisabled && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'imp-shimmer 2.5s ease-in-out infinite' }}
            />
          )}
          <span className="relative z-10">Conferma e Importa</span>
          <span className="relative z-10 text-white/70 text-xs font-normal">
            ({total.toLocaleString('it-IT')} {total === 1 ? 'cliente' : 'clienti'})
          </span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3 — PROGRESS + SUCCESSO + INVITE
// ============================================================================

interface Step3Props {
  isImporting: boolean;
  importProgress: { current: number; total: number };
  importResult: { success: number; errors: number; importedIds: string[] } | null;
  invitableCount: number;
  isInviting: boolean;
  inviteDone: boolean;
  onSendInvites: () => void;
  onSkipInvites: () => void;
}

function Step3({ isImporting, importProgress, importResult, invitableCount, isInviting, inviteDone, onSendInvites, onSkipInvites }: Step3Props) {
  const progressPct = importProgress.total > 0
    ? Math.min(Math.round((importProgress.current / importProgress.total) * 100), 100)
    : 0;
  const isComplete = !isImporting && importResult !== null;
  const displayPct = isComplete ? 100 : progressPct;

  return (
    <div className="px-6 pt-5 pb-6 space-y-5">

      {/* ── Progress ───────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isComplete ? (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(5,150,105,0.12)' }}>
                <Check className="w-3 h-3" style={{ color: '#059669' }} />
              </div>
            ) : (
              <div className="relative w-4 h-4 flex-shrink-0">
                <span className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(168,85,247,0.35)', animationDuration: '1.2s' }} />
                <span className="absolute inset-[3px] rounded-full"
                  style={{ background: '#a855f7' }} />
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800">
              {isComplete ? 'Importazione completata' : 'Importazione in corso...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-gray-400">
              {importProgress.current}/{importProgress.total > 0 ? importProgress.total : '—'}
            </span>
            <span className="text-sm font-bold tabular-nums w-10 text-right"
              style={{ color: isComplete ? '#059669' : '#9333ea' }}>
              {displayPct}%
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(168,85,247,0.08)' }}>
          <div className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${displayPct}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #059669, #10b981)'
                : 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
              boxShadow: isComplete
                ? '0 0 10px rgba(5,150,105,0.4)'
                : '0 0 10px rgba(168,85,247,0.5)',
              transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.6s ease, box-shadow 0.6s ease',
            }}
          >
            {/* Moving shimmer while loading */}
            {!isComplete && (
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: 'imp-shimmer 1.4s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Success cards ─────────────────────────────────────── */}
      {isComplete && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: importResult.errors > 0 ? '1fr 1fr' : '1fr',
            gap: 10,
            animation: 'imp-fade-up 0.35s ease both',
          }}
        >
          {/* Importati */}
          <div
            style={{
              background: 'rgba(5,150,105,0.04)',
              border: '1px solid rgba(5,150,105,0.12)',
              borderRadius: 16,
              padding: '14px 14px 16px',
              transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(5,150,105,0.13), 0 2px 8px rgba(5,150,105,0.08)';
              e.currentTarget.style.border = '1px solid rgba(5,150,105,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '1px solid rgba(5,150,105,0.12)';
            }}
          >
            <div style={{ height: 2, borderRadius: 99, background: 'linear-gradient(90deg, #059669, rgba(5,150,105,0.2))', marginBottom: 13 }} />
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 11, color: '#059669' }}>
              <Check className="w-4 h-4" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: '#059669', fontVariantNumeric: 'tabular-nums', marginBottom: 5 }}>
              {importResult.success.toLocaleString('it-IT')}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>Importati</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>aggiunti ai clienti</div>
          </div>

          {/* Saltati — solo se ci sono errori */}
          {importResult.errors > 0 && (
            <div
              style={{
                background: 'rgba(245,158,11,0.04)',
                border: '1px solid rgba(245,158,11,0.12)',
                borderRadius: 16,
                padding: '14px 14px 16px',
                transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                animation: 'imp-fade-up 0.35s 0.07s ease both',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.13), 0 2px 8px rgba(245,158,11,0.08)';
                e.currentTarget.style.border = '1px solid rgba(245,158,11,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.border = '1px solid rgba(245,158,11,0.12)';
              }}
            >
              <div style={{ height: 2, borderRadius: 99, background: 'linear-gradient(90deg, #d97706, rgba(245,158,11,0.2))', marginBottom: 13 }} />
              <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 11, color: '#d97706' }}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: '#d97706', fontVariantNumeric: 'tabular-nums', marginBottom: 5 }}>
                {importResult.errors.toLocaleString('it-IT')}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>Saltati</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>righe non importate</div>
            </div>
          )}
        </div>
      )}

      {/* ── Invite card ───────────────────────────────────────── */}
      {isComplete && invitableCount > 0 && !inviteDone && (
        <div
          style={{
            background: 'rgba(168,85,247,0.04)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: 16,
            padding: '14px 14px 16px',
            animation: 'imp-fade-up 0.35s 0.14s ease both',
          }}
        >
          <div style={{ height: 2, borderRadius: 99, background: 'linear-gradient(90deg, #9333ea, rgba(168,85,247,0.2))', marginBottom: 13 }} />
          <div className="flex items-start gap-3">
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9333ea' }}>
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Invita i clienti su Aegis Beauty</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Invia un'email di benvenuto a{' '}
                <span style={{ fontWeight: 700, color: '#7c3aed' }}>{invitableCount}</span>{' '}
                {invitableCount === 1 ? 'cliente' : 'clienti'} con email per invitarli a prenotare online.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 mt-4">
            <button onClick={onSkipInvites} disabled={isInviting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { if (!isInviting) e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
            >
              Salta
            </button>
            <button onClick={onSendInvites} disabled={isInviting}
              className="flex-1 relative flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white overflow-hidden"
              style={{
                background: isInviting ? '#c084fc' : 'linear-gradient(135deg, #9333ea, #7c3aed)',
                boxShadow: isInviting ? 'none' : '0 2px 8px rgba(147,51,234,0.25)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!isInviting) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(147,51,234,0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = isInviting ? 'none' : '0 2px 8px rgba(147,51,234,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {!isInviting && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 'imp-shimmer 2.5s ease-in-out infinite' }}
                />
              )}
              {isInviting ? (
                <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Invio in corso...</span></>
              ) : (
                <><Mail className="w-3.5 h-3.5 relative z-10" /><span className="relative z-10">Invia inviti</span></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Invite done ───────────────────────────────────────── */}
      {inviteDone && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl"
          style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)', animation: 'imp-fade-up 0.3s ease both' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(168,85,247,0.15)' }}>
            <Check className="w-3 h-3" style={{ color: '#9333ea' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#7c3aed' }}>Inviti inviati con successo</p>
        </div>
      )}

      {/* ── Close when no invites ─────────────────────────────── */}
      {isComplete && invitableCount === 0 && !inviteDone && (
        <button onClick={onSkipInvites}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600"
          style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
        >
          Chiudi
        </button>
      )}
    </div>
  );
}
