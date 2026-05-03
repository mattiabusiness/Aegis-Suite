# 🛡️ PRD: AEGIS SUITE - ALL-IN-ONE B2B SAAS

## 1. VISIONE DEL PROGETTO
Aegis Suite è una piattaforma SaaS B2B multi-tenant e multi-verticale progettata per digitalizzare servizi professionali. La filosofia cardine è: **"Potenza enterprise, semplicità domestica"**.
L'obiettivo è fornire a piccoli e medi business uno strumento futuristico che sembri un'app custom da migliaia di euro per poter gestire tutto il proprio business e automatizzare processi che fanno perdere tante ore al giorno come gestire le prenotazioni degli appuntamenti telefonicamente o whatsapp evitando no-show con promemoria automatici, con una UX talmente intuitiva da essere utilizzabile senza formazione ("Grandma-proof").

### Verticali in Roadmap:
1. **Aegis Beauty** (Focus attuale: Saloni, Centri estetici)
2. **Aegis Sport** (Palestre, Centri sportivi)
3. **Aegis Home** (Artigiani, Manutenzione)
4. **Aegis Health** (Studi medici)
5. **Aegis Law** (Studi professionali)
6. **Aegis Book** (Marketplace aggregatore finale)

---

## 2. MODELLO DI BUSINESS & ARCHITETTURA URL
- **Isolamento Totale**: Non è un marketplace (per ora). Ogni business vive nel proprio spazio isolato grazie al multi-tenat.
- **Path-Based Routing**: `aegisbeauty.app/[business-slug]`
- **White-Label**: L'interfaccia si adatta al brand del business (logo, nomi, servizi), ma ce sempre il nostro brand Aegis Group, e ogni verticale ha il suo, in questo caso stiamo sviluppando Aegis Beauty.

---

## 3. STATUS ATTUALE & ARCHITETTURA TECNICA
- **Stack**: Next.js 15 (App Router), Supabase (Auth/DB/RLS), Tailwind CSS, Framer Motion.
- **Monorepo Strategy**: 
    - `packages/ui` & `packages/core`: Il "cuore" riutilizzabile.
    - `apps/aegis-beauty`: Il verticale specifico.
- **Database**: 17 tabelle core già implementate con RLS rigoroso.

---

## 4. INTERFACCIA GESTORE (MANAGEMENT DASHBOARD)
L'area dedicata al titolare del business. Deve essere **Desktop-First** ma completamente responsive.

### Struttura Pagine (8 Core):
1. **Overview**: Dashboard con KPI (appuntamenti oggi, appuntamenti settimana, clienti totali, servizi attivi), una panoramica dei prossimi appuntamenti, azioni rapide, gestione staff, QrCode del business.
2. **Calendario**: Vista interattiva molto moderna e futuristica con tooltip e form calendarevent (Giorno/Settimana/mese) per gestione di tutti gli appuntamenti, si possono anche creare manualmente dal form nuovo appuntamento.
3. **Servizi**: CRUD servizi (prezzo, durata, categoria, nome), con form aggiungi categoria e aggiungi servizio.
4. **Staff**: Gestione membri, orari di lavoro e associazione servizi, con form aggiungi membro.
5. **Clienti**: CRM con storico trattamenti, note e contatti, con tasto esporta e form importa i tuoi dati da implementare per aggiungere tutti i dati che un business possiede gia dei suoi clienti, dati, email, telefono, appuntamenti etc, in 3 click cosi da migliorare la possibile migrazione da un sito web, un altro software o excel
6. **Statistiche**: Grafici avanzati su entrate, appuntamenti, tasso di ritorno, performance staff, servizi piu venduti, mappa attività, funzioni preddittive sui dati del business e tabbella ROI.
7. **Impostazioni**: Tutte le impostazioni del business che potenzialmente vuole cambiare, molte delle quali gia chieste nel onboarding.
8. **Aiuto**: Supporto ticket e documentazione rapida con FAQ e guide rapide.

---

## 5. INTERFACCIA CLIENTE (BOOKING APP)
L'area dedicata all'utente finale del salone. **Mobile-First strict.**

### Flussi Principali:
- **Onboarding Cliente**: Registrazione rapida e login.
- **Flusso Prenotazione**:
    1. Selezione Servizio (con categorie).
    2. Selezione Staff (opzionale - logica di matching disponibilità).
    3. Selezione Slot (Logica: Staff libero + Postazione libera + Orari apertura).
- **Area Personale**:
    - I miei appuntamenti (Prossimi e passati).
    - Gestione Profilo con anche impostazioni e aiuto.
    - **Area Business**:
    - "Chi Siamo": Pagina brandizzata del business.

---

### P0 — (Sessione corrente)
- PWA: manifest, service worker, installabile, notifiche push e email transazionali (ZeptoMail) + notifiche: conferma, reminder 24h, notifica gestore
### P1 — LAUNCH PREP



## 7. REGOLE D'ORO PER LO SVILUPPO
- **Nessuna Duplicazione**: Se una logica serve a due pagine, va in un Hook in `packages/core`.
- **Performance**: Lighthouse score > 90.
- **Sicurezza**: RLS deve impedire a un gestore di vedere i dati di un altro anche via API.
- **Estetica**: Se non è futuristico, non è Aegis.

# (Marketing): Sito web 
Non è da Toccare, è stato appena finito e deployato correttamente, non toccarlo, lo userai solo come riferimento e aiuto per il miglioramento del interfaccia cliente che facciamo adesso

---

# 🐛 BUG APERTO — Appuntamenti non visibili nell'area cliente

## Sintomo
Dopo una prenotazione andata a buon fine, la pagina `/[businessSlug]/account` mostra la sezione "Prossimi appuntamenti" vuota. Il dato **esiste nel database** (confermato via SQL admin).

## File coinvolti
| File | Ruolo |
|---|---|
| `apps/aegis-beauty/app/(customer)/[businessSlug]/account/page.tsx` | Server Component che carica customer + appointments |
| `apps/aegis-beauty/app/(customer)/[businessSlug]/layout.tsx` | Layout che chiama anch'esso `getCustomerByUserId` |
| `packages/core/src/lib/business.ts` — `getCustomerByUserId()` | Query `customers WHERE user_id=X AND business_id=Y` con `.single()` |
| `packages/core/src/lib/appointments.ts` — `getUpcomingAppointments()` | Query appointments con `staff!inner` join |
| `apps/aegis-beauty/middleware.ts` | Gestione sessione e cookie forwarding |

## Flusso server che fallisce
```
account/page.tsx
  ↓ createServerSupabaseClient(await cookies())
  ↓ getCurrentUser(supabase)         → user ≠ null ✓ (auth funziona)
  ↓ getCustomerByUserId(supabase, user.id, business.id)  → ritorna null ✗
  ↓ [upcoming e past vengono saltati perché customer è null]
  → AccountContent riceve upcoming=[] past=[]
```

## Diagnostic SQL eseguiti

### 1. Confermato che il dato esiste (query admin, bypassa RLS)
```sql
SELECT 
  a.id AS appointment_id,
  a.customer_id,
  a.staff_id,
  a.start_time,
  a.status,
  c.user_id AS customer_user_id,
  c.is_active
FROM appointments a
JOIN customers c ON c.id = a.customer_id
ORDER BY a.created_at DESC
LIMIT 5;
-- RISULTATO: dati presenti con customer_user_id corretto e is_active=true ✓
```

### 2. Confermato che le policy RLS esistono
```sql
SELECT policyname, cmd, roles FROM pg_policies 
WHERE tablename IN ('customers','appointments','staff') AND schemaname = 'public';
-- RISULTATO: 9 policy su appointments, 4 su customers, 7 su staff ✓
```

### 3. Confermato che i GRANT esistono
```sql
SELECT grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_name IN ('customers','appointments','staff') AND grantee = 'authenticated';
-- RISULTATO: SELECT granted su tutte le tabelle per il ruolo authenticated ✓
```

## Ipotesi causa radice (in ordine di probabilità)

### Ipotesi A — `auth.uid()` è NULL per le query DB lato server (più probabile)
`getCurrentUser()` chiama `supabase.auth.getUser()` che fa una chiamata HTTP al servizio Auth di Supabase. Questo funziona anche con un token scaduto perché riesce a refresharlo. MA le query al database (PostgREST) usano il JWT che viene riletto dai cookie ogni volta tramite `storage.getItem()` in `@supabase/ssr`. Se il token nei cookie è scaduto e il refresh non riesce a persistere il nuovo token (perché `setAll` fallisce silenziosamente nei Server Component), PostgREST riceve un JWT scaduto → `auth.uid()` restituisce NULL → tutte le policy `USING (auth.uid() = user_id)` filtrano zero righe.

**Perché `getCurrentUser` funziona ma il DB no**: `getUser()` fa un network call separato al servizio Auth (non a PostgREST), che valida il JWT e lo refresha se necessario. Il DB invece riceve il JWT tramite header Authorization, che viene costruito a partire dai cookie — se questi non sono stati aggiornati, il JWT inviato a PostgREST è quello vecchio scaduto.

### Ipotesi B — Middleware non forwarda correttamente i cookie aggiornati
Il middleware usa:
```typescript
response = NextResponse.next({
  request: { headers: request.headers },  // ← potenzialmente sbagliato
});
```
Il pattern corretto raccomandato da Supabase è:
```typescript
response = NextResponse.next({ request });  // ← passa l'intero request object
```
Quando il token scade e il middleware lo refresha, il nuovo token viene scritto su `response.cookies` (per il browser) ma potrebbe non essere correttamente inoltrato ai Server Component downstream tramite `request.headers` se l'oggetto headers non riflette l'update di `request.cookies.set()`.

### Ipotesi C — `staff!inner` esclude l'intero appuntamento
```typescript
const APPOINTMENT_SELECT = `
  *,
  customers!inner(full_name, email, phone),
  staff!inner(full_name, nickname),   // ← !inner = se la riga staff non è accessibile, esclude tutto
  appointment_services(...)
`;
```
Se la riga nella tabella `staff` che corrisponde allo `staff_id` dell'appuntamento non è accessibile tramite RLS (ad es. il membro staff è stato eliminato, o la policy su `staff` non funziona), PostgREST esclude silenziosamente l'intero appuntamento dal risultato.

### Ipotesi D — `.single()` swallows errors
```typescript
// In getCustomerByUserId():
const { data } = await supabase.from('customers')...single();
return data ?? null;
// catch {} silenzioso sopra
```
`.single()` lancia un errore se trova 0 righe (code PGRST116). Questo viene catturato e ritorna null. Ogni tipo di errore (RLS block, network, JWT invalido) finisce silenziosamente come `null` → appointments mai caricati.

## Soluzione pianificata (3 fix code + 1 SQL)

### Fix 1 — Middleware: correggere il cookie forwarding
**File**: `apps/aegis-beauty/middleware.ts`
```typescript
// Prima (potenzialmente sbagliato):
response = NextResponse.next({
  request: { headers: request.headers },
});

// Dopo (pattern ufficiale Supabase):
response = NextResponse.next({ request });
```

### Fix 2 — appointments.ts: rimuovere `!inner` da staff
**File**: `packages/core/src/lib/appointments.ts`
```typescript
// Prima:
const APPOINTMENT_SELECT = `
  *,
  customers!inner(full_name, email, phone),
  staff!inner(full_name, nickname),
  appointment_services(...)
`;

// Dopo (left join — se staff mancante, appuntamento ancora visibile):
const APPOINTMENT_SELECT = `
  *,
  customers!inner(full_name, email, phone),
  staff(full_name, nickname),
  appointment_services(...)
`;
```

### Fix 3 — business.ts: `.single()` → `.maybeSingle()` + error logging
**File**: `packages/core/src/lib/business.ts` — funzione `getCustomerByUserId`
```typescript
// Prima:
const { data } = await supabase.from('customers').select(...).eq(...).single();
return data ?? null;

// Dopo:
const { data, error } = await supabase.from('customers').select(...).eq(...).maybeSingle();
if (error) console.error('[getCustomerByUserId] error:', JSON.stringify(error));
return data ?? null;
```

### Fix 4 — SQL Simulation (da eseguire in Supabase SQL Editor)
Per verificare se `auth.uid()` funziona correttamente con RLS prima di applicare i fix:
```sql
-- Sostituire <USER_ID> con l'UUID dell'utente di test (Authentication > Users nel dashboard)
BEGIN;
SET LOCAL role TO 'authenticated';
SET LOCAL "request.jwt.claims" TO '{"sub":"<USER_ID>","role":"authenticated","iss":"supabase"}';

-- Verificare che auth.uid() restituisce il UUID corretto:
SELECT auth.uid();

-- Verificare che la policy su customers funziona:
SELECT id, user_id, business_id FROM customers WHERE user_id = auth.uid();

-- Verificare che la policy su appointments funziona:
SELECT id, customer_id, staff_id, start_time FROM appointments
WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid());
ROLLBACK;
```
- Se `auth.uid()` restituisce NULL → conferma Ipotesi A/B (JWT non passa a PostgREST)
- Se restituisce l'UUID ma la query customers è vuota → policy SQL sbagliata
- Se tutto funziona → il bug è solo nel codice Next.js (Fix 1/2/3 risolvono)

## Priorità
Applicare i fix nell'ordine: Fix 3 prima (logging immediato), poi Fix 2 (sicuro), poi Fix 1 (middleware, richiede test).
Se il problema persiste dopo tutti e 3, considerare di usare `createAdminSupabaseClient()` nel `account/page.tsx` per le query customer/appointments (filtrando sempre per `user.id` dalla sessione autenticata — sicuro perché il `user.id` viene dal JWT validato, non dall'URL).

---

# 🐛 BUG APERTO — Orari staff vuoti nel modal "Gestisci orari"

## Sintomo
Nel modal `StaffHoursModal`, quando si disattiva il toggle "Usa orari del negozio", i campi orario appaiono visivamente vuoti nonostante gli orari del business esistano. L'utente dovrebbe vedere gli orari del business pre-impostati come punto di partenza.

## Cosa è stato fatto
- Aggiunta logica `resolveHours(custom, business, DEFAULT_WEEK)` a tre livelli di fallback
- Corretto bug `useState([] || array)` — array vuoto è truthy, risolto con lazy initializer
- Rimosso spurious reset del `useEffect` tramite refs + `[isOpen]` deps
- Aggiunto `DEFAULT_WEEK` con valori 09:00–18:00 come fallback finale
- Fix visivo: etichette giorni abbreviate (`Lun/Mar/Mer`…) → no overflow
- Fix visivo: `SEL_W` da `70px` → `80px` → select time non viene più troncata

## Problema residuo
I campi orario appaiono ancora vuoti nonostante i fix. L'ipotesi più probabile è che `businessHoursForModal` in `StaffContent.tsx` venga costruito in un formato diverso da quello che `resolveHours` si aspetta (es. `openTime1` vs `open_time`, oppure `isOpen` vs `is_open`). Non è stato ancora investigato in profondità.

## File coinvolti
| File | Ruolo |
|---|---|
| `packages/ui/src/components/dashboard/StaffModal.tsx` | Modal con `resolveHours`, `DEFAULT_WEEK`, `StaffHoursModal` |
| `apps/aegis-beauty/app/(dashboard)/dashboard/staff/StaffContent.tsx` | Costruisce `businessHoursForModal` e lo passa al modal |

## Prossimo passo
Fare `console.log(businessHoursForModal)` e `console.log(currentHours)` all'apertura del modal e verificare se i dati arrivano con la forma corretta (campi camelCase vs snake_case, array vuoto vs array con dati).

---