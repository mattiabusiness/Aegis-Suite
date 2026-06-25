# Aegis Beauty — Known Issues & Quirks (da rivedere prima/durante produzione)

> Appunti emersi durante il test finale di isolamento dati (3 attività onboardate,
> orari/servizi/staff diversi per ognuna, flussi staff + creazione appuntamenti dashboard).
> **L'app funziona**: questi sono comportamenti da rifinire, non bug bloccanti.
> Ultimo aggiornamento: 2026-06-24.

---

## 1. Nuovo servizio NON auto-assegnato a tutti gli staff

**Comportamento attuale**
Quando creo un nuovo servizio (dashboard → Servizi), il servizio **non** viene
assegnato automaticamente a tutti gli staff. Devo andare manualmente in
dashboard → Staff e assegnare quel servizio a ciascun operatore.

**Impatto**
Finché non lo assegno, il servizio **non è prenotabile** con quegli staff
(né da dashboard né dal cliente). Rischio: servizio "invisibile" in prenotazione.

**Workaround attuale**
Assegnazione manuale per ogni staff dopo la creazione del servizio.

**Fix futura (dove guardare)**
- Creazione servizio (dashboard Servizi) + tabella `staff_services`.
- Idea: checkbox "Assegna a tutto lo staff" in creazione, oppure auto-creazione
  delle righe `staff_services` di default per gli staff attivi.

---

## 2. Sessione attiva "trasversale" tra saloni diversi

**Comportamento attuale**
Se ho una sessione attiva con un account (es. il gestore di un salone) e dallo
**stesso dispositivo** apro il link di prenotazione di **un altro salone**, la
sessione attiva mi fa procedere alla prenotazione — quindi posso prenotare su un
salone diverso usando un account che non è "cliente" di quel salone.

**Impatto**
Caso raro, ma in produzione un gestore/cliente potrebbe prenotare su un altro
salone con la propria sessione esistente.
⚠️ **Non è una fuga di dati** (le RLS reggono, l'isolamento è verificato): è un
tema di **contesto/identità** nel flusso di prenotazione.

**Workaround attuale**
Nessuno (comportamento intrinseco della sessione condivisa sul dispositivo).

**Fix futura (dove guardare)**
- Flusso `/[businessSlug]/prenota`: valutare se l'utente loggato debba essere
  effettivamente associato a quel business, o gestire esplicitamente il caso
  "sto prenotando con un account di un altro contesto" (es. avviso / scelta).

---

## 3. Permessi staff (toggle) non ereditati dai nuovi staff

**Comportamento attuale**
Se nei permessi staff è tutto attivato (o alcuni toggle sono attivi) e poi
**creo un nuovo staff**, i toggle dei permessi **non vengono salvati/applicati**
a quel nuovo staff.

**Workaround attuale**
Per dare i permessi al nuovo staff devo **disattivare e poi riattivare** i toggle
(così vengono ri-salvati anche per lui).

**Impatto**
Un nuovo staff può ritrovarsi senza i permessi attesi finché non si ri-togglano.

**Fix futura (dove guardare)**
- Creazione staff + assegnazione default dei permessi (colonne `can_*` su
  `business_members`).
- Idea: applicare i permessi di default correnti al momento della creazione del
  nuovo staff, invece di richiedere il re-toggle manuale.

---

## 4. Cliente associato a PIÙ saloni / centri estetici — decisione da prendere

**Comportamento attuale**
Un singolo account cliente può essere associato a più attività (una riga
`customers` per ogni business). Al login, il redirect prende **il primo
business attivo** trovato (`.limit(1)`), quindi ne sceglie **uno arbitrario**;
lo stesso vale per `/api/start` (PWA).

**Condizione di trigger (importante)**
Il problema si presenta **solo se il cliente usa la STESSA email** su più
attività: stessa email = un solo account auth (`user_id`) con più righe
`customers` → l'ambiguità sta lì. Con **email diversa per ogni salone** sono
account distinti, ognuno legato a un solo business → **nessun problema**.
⚠️ Non è un edge case esotico: in produzione una persona tende a usare la sua
email di sempre in più saloni/centri → scenario realistico.

**Impatto**
Se un cliente è cliente di più saloni/centri (stessa email), al login/avvio PWA
potrebbe ritrovarsi nel salone "sbagliato" (non quello che si aspettava). Non è
una fuga di dati — è una scelta di **UX/esperienza** non ancora definita.

**Workaround attuale**
Nessuno. Funziona se si accede sempre dal link specifico `/{slug}` del salone.

**Decisione da prendere (per la produzione)**
Definire come gestire il cliente multi-salone. Opzioni:
- pagina "Scegli salone" al login quando ci sono più associazioni;
- ricordare l'ultimo salone usato;
- entrare sempre dal contesto del link `/{slug}` e non avere un "salone di
  default" globale.

**Dove guardare**
- Redirect login cliente: `app/(auth)/login/page.tsx` (query `customers` con `.limit(1)`).
- `app/api/start/route.ts` (risoluzione destinazione PWA).
- Collegato anche al quirk #2 (sessione attiva trasversale tra saloni).

---

## 5. Stato email (ZeptoMail), profili & clienti — riepilogo sessione 2026-06-24

> Sezione di contesto: cos'è successo, come l'abbiamo risolto, e i passi da fare
> quando ZeptoMail tornerà attivo. Leggere prima del go-live.

### 5.1 — Email/SMTP non partivano dall'app — RISOLTO
**Causa reale (NON era un ban ZeptoMail):** il **token SMTP era stato rigenerato su
ZeptoMail ma NON aggiornato su Supabase** → Supabase non riusciva ad autenticarsi
verso ZeptoMail → "error sending confirmation/recovery email" su tutto. ZeptoMail in
sé era sano (test diretto consegnato, quota intatta, nessun ban reale).

**Fix:** rigenerato il token SMTP su ZeptoMail (tab SMTP) e **re-incollato in
Supabase → Authentication → Emails → SMTP Settings → Password** (host
`smtp.zeptomail.eu`, porta 587, username `emailapikey`, mittente
`noreply@aegisbeauty.app`). Poi **"Confirm email" riattivato** e messaggio di
registrazione ripristinato all'originale.

**Promemoria operativo:** mai inviare email di test a **indirizzi inventati** (es.
`test@test.it`) → generano hard bounce e l'avviso ZeptoMail ">5%". Usare solo alias
reali (`aegisbeauty2026+xxx@gmail.com`).

### 5.2 — Conferma email cross-dispositivo (token_hash) — RISOLTO
**Problema:** la conferma registrazione usava il flusso PKCE (`code` +
`exchangeCodeForSession`), che richiede il code_verifier **nello stesso browser** →
aprendo il link da un altro dispositivo o dall'app mail (webview) → "Autenticazione
fallita".

**Fix:** il callback ora gestisce **`token_hash` + `verifyOtp`** (stateless,
device-independent), tenendo `code` come fallback (`app/auth/callback/route.ts`).
⚠️ **Requisiti da NON rompere:**
- Template **"Confirm signup"** su Supabase DEVE usare
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
  (NON `{{ .ConfirmationURL }}`).
- **Site URL** (Authentication → URL Configuration) = dominio di produzione.
- Se un domani qualcuno ripristina il template di default → la conferma
  cross-dispositivo si rirompe (riconoscerlo da qui).

### 5.3 — Reset password cross-dispositivo — DA RITESTARE
Stesso problema PKCE della conferma. **Codice già pronto:** il callback gestisce
`type=recovery` via `verifyOtp` e per il recovery reindirizza **sempre** a
`/reset-password`. **Manca solo la verifica finale** dopo aver applicato il template.
- Template **"Reset Password"** deve usare
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`.
- ⚠️ Testare con un'email **generata DOPO** aver salvato il template (le vecchie
  mantengono il link vecchio → "porta al login").
- **Stato:** same-device funziona; cross-device da riverificare con email fresca.
  **Non bloccante** per il lancio (reset cross-dispositivo è un caso raro).
- Se anche con email fresca cross-device fallisse → sospettare lo scanner anti-phishing
  della mail che "preclicca" e consuma il token monouso.

### 5.4 — Rifinitura performance: indici sulle foreign key
Il controllo finale del DB ha trovato alcune **foreign key secondarie senza indice**
(le colonne tenant principali — i vari `business_id` — erano già indicizzate). Aggiunti
indici (migration **non distruttiva**, solo `CREATE INDEX IF NOT EXISTS`) su:
`notifications.business_id`, `push_subscriptions.business_id`, `reviews.appointment_id`,
`services.parent_service_id`, `appointments.parent_appointment_id`,
`appointments.cancelled_by`, `customers.referred_by`, `reviews.replied_by`,
`support_tickets.resolved_by`.
Servono solo a **velocizzare** ricerche e cancellazioni a cascata su grandi volumi.
Non cambiano dati né comportamento. Sopravvivono ai reset (sono schema).

### 5.5 — Problema profili/clienti e soluzione (il punto importante)
**Sintomo:** dopo un reset dati, registrando un cliente con Confirm email OFF, a
volte la riga `profiles` non veniva creata → la prenotazione falliva con
`violates foreign key constraint customers_user_id_fkey` (la `customers.user_id`
richiede un `profiles.id` esistente). Gli indici NON c'entravano (un indice non può
causare un errore di foreign key).

**Causa reale:** **non esisteva alcun trigger** sul database che creasse i profili.
Il profilo veniva creato **solo dall'app**, con percorsi diversi e non garantiti:
- titolare → durante l'onboarding;
- staff → `/api/staff/setup` (upsert diretto, affidabile);
- cliente → **solo** `/api/customer/provision`, che scatta solo in certi percorsi
  (registrazione con `business_slug`) → da qui i buchi intermittenti.

**Soluzione applicata (DB trigger — definitiva):** aggiunto
`public.handle_new_user()` + trigger `on_auth_user_created` su `auth.users`, che crea
**automaticamente** la riga `profiles` per **ogni** nuovo utente, qualunque percorso,
con Confirm email ON o OFF. Più backfill dei profili mancanti già esistenti.
(SQL salvato/riferito anche fuori da qui se versionato.)

**Esito:** profilo **garantito a livello database** → l'errore FK non può più capitare.

### 5.6 — Come funziona la creazione di profili e clienti (chiarimento)
- **`profiles`** → ora creato **automaticamente dal trigger** a ogni nuovo utente
  auth. Garantito.
- **`customers`** → NON è creato dal trigger (è legato a un business). Nasce:
  - alla **prenotazione** (`/api/bookings/create` crea il cliente se manca);
  - alla **registrazione dalla pagina del salone** (provision, se scatta);
  - da **dashboard** (gestore) o **importatore**.
- **Caso limite noto:** un cliente che **si registra ma non prenota mai** potrebbe
  non avere ancora la riga `customers` → al login finisce nel fallback invece che
  sul "suo" salone (collegato al punto #4). Non è bloccante: appena prenota si crea.
- **Possibile blindatura futura:** estendere il trigger perché crei **anche** la riga
  `customers` leggendo `business_slug` dai metadata della registrazione (rende il
  cliente solido come il profilo). Opzionale, valutata come miglioria post-lancio.

---

## Note generali
- Questi punti vanno verificati/sistemati **prima del rollout esteso** ai clienti,
  per evitare attriti in produzione.
- Da rivedere insieme quando si rimette mano al codice post-test.
