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

## 6. ACTIVE BACKLOG (Prioritized)

### P0 — CLIENT INTERFACE NOW (Sessione corrente)
- PWA: manifest, service worker, installabile, notifiche push e email transazionali (ZeptoMail) + notifiche: conferma, reminder 24h, notifica gestore
  


### P1 — LAUNCH PREP
- Inserire Toggle ON/OFF nelle impostazioni gestore (default: ON),Inserire altre due piccole features
- [ ] Lighthouse > 90 su tutte le pagine
- [ ] Security audit finale (RLS, API routes, input sanitization)
- [ ] Performance: bundle analysis, lazy loading, image optimization

## 7. REGOLE D'ORO PER LO SVILUPPO
- **Nessuna Duplicazione**: Se una logica serve a due pagine, va in un Hook in `packages/core`.
- **Performance**: Lighthouse score > 90.
- **Sicurezza**: RLS deve impedire a un gestore di vedere i dati di un altro anche via API.
- **Estetica**: Se non è futuristico, non è Aegis.

# (Marketing): Sito web 
Non è da Toccare, è stato appena finito e deployato correttamente, non toccarlo, lo userai solo come riferimento e aiuto per il miglioramento del interfaccia cliente che facciamo adesso