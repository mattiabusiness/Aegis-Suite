import type { SupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// ============================================================
// TYPES
// ============================================================

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface ColumnMapping {
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

export interface ParsedRow {
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
  _originalRow?: Record<string, string>;
}

export interface ValidationResult {
  valid: ParsedRow[];
  warnings: ParsedRow[];  // senza email E senza telefono
  duplicates: ParsedRow[];
  errors: ParsedRow[];    // senza full_name — scartati
}

export interface ImportResult {
  success: number;
  skipped: number;
  errors: number;
}

// ============================================================
// ALIAS MAPPING
// ============================================================

// Pass 1: exact match (after trim + collapse whitespace + lowercase)
const ALIASES: Record<keyof ColumnMapping, string[]> = {
  full_name: [
    // field name itself
    'full_name',
    // Italian
    'nome completo', 'nome cognome', 'cognome nome', 'cognome e nome',
    'nome e cognome', 'nominativo', 'intestatario', 'nome', 'cliente',
    'ragione sociale', 'denominazione', 'anagrafica', 'titolare', 'paziente',
    // English
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

// Pass 2: partial contains match (keyword found anywhere in the header)
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

// ============================================================
// PARSE FILE
// ============================================================

export async function parseFile(file: File): Promise<ParsedData> {
  const arrayBuffer = await file.arrayBuffer();
  const ext = file.name.split('.').pop()?.toLowerCase();

  let headers: string[] = [];
  let rows: Record<string, string>[] = [];

  if (ext === 'csv') {
    let text = new TextDecoder('utf-8').decode(arrayBuffer);
    // Strip UTF-8 BOM (common in Excel exports)
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      return { headers: [], rows: [], totalRows: 0 };
    }

    const delimiter = detectDelimiter(lines[0]);
    headers = parseCSVLine(lines[0], delimiter);
    rows = lines.slice(1).map((line) => {
      const values = parseCSVLine(line, delimiter);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? '';
      });
      return row;
    });
  } else {
    // xlsx / xls / ods
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
    });

    if (jsonData.length === 0) {
      return { headers: [], rows: [], totalRows: 0 };
    }

    headers = (jsonData[0] as string[]).map((h) => String(h ?? '').trim());
    rows = jsonData.slice(1).map((rawRow) => {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = String((rawRow as string[])[i] ?? '').trim();
      });
      return row;
    });
  }

  // Rimuovi righe completamente vuote
  rows = rows.filter((r) => Object.values(r).some((v) => v !== ''));

  return { headers, rows, totalRows: rows.length };
}

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
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ============================================================
// AUTO-DETECT MAPPING
// ============================================================

export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    full_name: null,
    email: null,
    phone: null,
    notes: null,
    preferences: null,
    total_appointments: null,
    total_spent: null,
    last_visit_at: null,
    birth_date: null,
    gender: null,
  };

  // Normalize: lowercase, underscores→spaces, strip currency/parentheses/trailing period, collapse spaces
  const normalized = headers.map((h) =>
    h.toLowerCase()
      .replace(/_/g, ' ')               // underscores → spaces: last_visit → last visit
      .replace(/[€$£¥]/g, '')           // strip currency symbols
      .replace(/\s*\([^)]*\)\s*/g, ' ') // strip parenthetical content "(€)"
      .replace(/\.$/, '')               // strip trailing period "pref." → "pref"
      .trim()
      .replace(/\s+/g, ' '),
  );

  // Pass 1: exact match
  for (const [field, aliases] of Object.entries(ALIASES) as [
    keyof ColumnMapping,
    string[],
  ][]) {
    if (mapping[field] !== null) continue;
    for (const alias of aliases) {
      const idx = normalized.indexOf(alias.toLowerCase());
      if (idx !== -1) {
        mapping[field] = headers[idx];
        break;
      }
    }
  }

  // Pass 2: partial contains match (only for still-unmapped fields)
  for (const [field, keywords] of Object.entries(PARTIAL_KEYWORDS) as [
    keyof ColumnMapping,
    string[],
  ][]) {
    if (mapping[field] !== null) continue;
    for (let i = 0; i < normalized.length; i++) {
      // Skip columns already claimed by another field
      const alreadyClaimed = (Object.values(mapping) as (string | null)[]).includes(headers[i]);
      if (alreadyClaimed) continue;
      for (const kw of keywords) {
        if (normalized[i].includes(kw)) {
          mapping[field] = headers[i];
          break;
        }
      }
      if (mapping[field] !== null) break;
    }
  }

  return mapping;
}

// ============================================================
// VALIDATE AND MAP
// ============================================================

export function validateAndMap(
  data: ParsedData,
  mapping: ColumnMapping,
): ValidationResult {
  const valid: ParsedRow[] = [];
  const warnings: ParsedRow[] = [];
  const errors: ParsedRow[] = [];

  for (const rawRow of data.rows) {
    const rawName = mapping.full_name ? rawRow[mapping.full_name] : '';
    const full_name = (rawName ?? '').trim();

    if (!full_name) {
      errors.push({ full_name: '', _originalRow: rawRow });
      continue;
    }

    const email = normalizeEmail(
      mapping.email ? rawRow[mapping.email] : undefined,
    );
    const phone = normalizePhone(
      mapping.phone ? rawRow[mapping.phone] : undefined,
    );
    const notes = (mapping.notes ? rawRow[mapping.notes] : undefined) || undefined;
    const preferences =
      (mapping.preferences ? rawRow[mapping.preferences] : undefined) ||
      undefined;

    const total_appointments_raw = mapping.total_appointments
      ? rawRow[mapping.total_appointments]
      : undefined;
    const total_appointments =
      total_appointments_raw !== undefined
        ? parseFloat(total_appointments_raw) || 0
        : undefined;

    const total_spent_raw = mapping.total_spent
      ? rawRow[mapping.total_spent]
      : undefined;
    const total_spent =
      total_spent_raw !== undefined
        ? parseFloat(total_spent_raw.replace(',', '.').replace(/[^0-9.]/g, '')) || 0
        : undefined;

    const last_visit_at = normalizeDate(
      mapping.last_visit_at ? rawRow[mapping.last_visit_at] : undefined,
    );
    const birth_date = normalizeDate(
      mapping.birth_date ? rawRow[mapping.birth_date] : undefined,
    );
    const gender = normalizeGender(
      mapping.gender ? rawRow[mapping.gender] : undefined,
    );

    const parsed: ParsedRow = {
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
      _originalRow: rawRow,
    };

    if (!email && !phone) {
      warnings.push(parsed);
    } else {
      valid.push(parsed);
    }
  }

  return { valid, warnings, duplicates: [], errors };
}

// ============================================================
// CHECK DUPLICATES
// ============================================================

export async function checkDuplicates(
  rows: ParsedRow[],
  businessId: string,
  supabase: SupabaseClient,
): Promise<{ unique: ParsedRow[]; duplicates: ParsedRow[] }> {
  const { data: existing } = await supabase
    .from('customers')
    .select('email, phone')
    .eq('business_id', businessId);

  if (!existing || existing.length === 0) {
    return { unique: rows, duplicates: [] };
  }

  const existingEmails = new Set(
    existing
      .filter((c: { email: string | null }) => c.email)
      .map((c: { email: string | null }) => c.email!.toLowerCase()),
  );
  const existingPhones = new Set(
    existing
      .filter((c: { phone: string | null }) => c.phone)
      .map((c: { phone: string | null }) => normalizePhone(c.phone!) ?? ''),
  );

  const unique: ParsedRow[] = [];
  const duplicates: ParsedRow[] = [];

  for (const row of rows) {
    const emailMatch =
      row.email && existingEmails.has(row.email.toLowerCase());
    const phoneMatch = row.phone && existingPhones.has(row.phone);

    if (emailMatch || phoneMatch) {
      duplicates.push(row);
    } else {
      unique.push(row);
    }
  }

  return { unique, duplicates };
}

// ============================================================
// NORMALIZERS
// ============================================================

function normalizeEmail(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value.toLowerCase().trim();
  return cleaned.includes('@') ? cleaned : undefined;
}

function normalizePhone(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let cleaned = value.replace(/[\s\-().+]/g, '');
  // Rimuovi prefisso +39 o 0039
  cleaned = cleaned.replace(/^(\+39|0039)/, '');
  // Tieni solo cifre
  cleaned = cleaned.replace(/\D/g, '');
  return cleaned.length >= 6 ? cleaned : undefined;
}

function normalizeDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();

  // ISO già nel formato corretto
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.substring(0, 10);
  }

  // DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY (fallback se giorno > 12)
  const mdyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    if (parseInt(m) > 12) {
      return `${y}-${d.padStart(2, '0')}-${m.padStart(2, '0')}`;
    }
  }

  return undefined;
}

function normalizeGender(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const v = value.toLowerCase().trim();
  if (['m', 'male', 'uomo', 'maschio', 'm.'].includes(v)) return 'M';
  if (['f', 'female', 'donna', 'femmina', 'femminile', 'f.'].includes(v))
    return 'F';
  if (['altro', 'other', 'non specificato', 'nd', 'n/d'].includes(v))
    return 'other';
  return undefined;
}
