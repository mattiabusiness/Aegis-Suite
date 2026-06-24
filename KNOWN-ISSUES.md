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

## Note generali
- Questi punti vanno verificati/sistemati **prima del rollout esteso** ai clienti,
  per evitare attriti in produzione.
- Da rivedere insieme quando si rimette mano al codice post-test.
