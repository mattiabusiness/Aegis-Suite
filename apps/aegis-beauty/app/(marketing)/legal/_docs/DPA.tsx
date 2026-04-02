// ============================================================================
// AEGIS BEAUTY — Data Processing Agreement (DPA)
// Versione 1.0 (Fase Beta) | 29 Marzo 2026
// ============================================================================

import type { ReactNode, CSSProperties } from 'react';

// ---- Helpers ----------------------------------------------------------------

function DocHeader() {
  return (
    <div style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: 40 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
        Documento legale
      </p>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px', lineHeight: 1.2 }}>
        Data Processing Agreement (DPA)
      </h2>
      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px' }}>
        Accordo sul Trattamento dei Dati Personali ai sensi dell&apos;Art. 28 GDPR
      </p>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid rgba(124,58,237,0.12)' }}>
        <span style={{ fontSize: 13, color: '#64748B' }}>Versione: <strong style={{ color: '#a855f7' }}>1.0 (Fase Beta)</strong></span>
        <span style={{ fontSize: 13, color: '#64748B' }}>Ultimo aggiornamento: <strong style={{ color: '#94A3B8' }}>29 Marzo 2026</strong></span>
      </div>
    </div>
  );
}

function AT({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#F8FAFC', borderLeft: '4px solid #7c3aed', paddingLeft: 14, margin: '40px 0 16px', lineHeight: 1.4 }}>
      {children}
    </h3>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <p style={{ color: '#a855f7', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 6px' }}>
      {children}
    </p>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.8, margin: '0 0 12px' }}>{children}</p>;
}

function Ul({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, color: '#94A3B8', lineHeight: 1.7 }}>
          <span style={{ color: '#7c3aed', flexShrink: 0, marginTop: '0.15em', fontWeight: 700 }}>—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div style={{ backdropFilter: 'blur(4px)', background: 'rgba(76,29,149,0.15)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 12, padding: '20px 24px', margin: '20px 0' }}>
      {children}
    </div>
  );
}

function Def({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)', marginBottom: 10 }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>{term}</p>
      <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{children}</p>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', lineHeight: 1.7, margin: '10px 0' }}>
      {children}
    </p>
  );
}

function B({ children }: { children: ReactNode }) {
  return <strong style={{ color: '#F8FAFC', fontWeight: 600 }}>{children}</strong>;
}

const mail: CSSProperties = { color: '#a855f7', textDecoration: 'none', fontWeight: 600 };

// ---- Component --------------------------------------------------------------

export function DPA() {
  return (
    <div>
      <DocHeader />

      {/* Intro */}
      <P>Il presente Data Processing Agreement (di seguito <B>"DPA"</B> o <B>"Accordo"</B>) è stipulato ai sensi dell&apos;Art. 28 del Regolamento (UE) 2016/679 (<B>"GDPR"</B>) e disciplina il trattamento dei dati personali dei Clienti Finali effettuato da Aegis Beauty per conto del Gestore nell&apos;ambito dell&apos;utilizzo della Piattaforma.</P>
      <P>Il DPA costituisce parte integrante e sostanziale dei Termini di Servizio (ToS) di Aegis Beauty. In caso di conflitto tra le disposizioni del presente DPA e quelle dei ToS in materia di protezione dei dati personali, le disposizioni del presente DPA prevalgono.</P>

      <Callout>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Parti dell&apos;Accordo</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
            <B>Titolare del Trattamento (Data Controller):</B> il Gestore — professionista o titolare di salone di acconciatura o centro estetico che utilizza la Piattaforma e determina finalità e mezzi del trattamento dei dati dei propri Clienti Finali.
          </p>
          <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
            <B>Responsabile del Trattamento (Data Processor):</B> Aegis Beauty — Mattia Papa, sviluppatore indipendente residente a Torino, Italia (<a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>) — che tratta i dati dei Clienti Finali per conto del Gestore nell&apos;ambito della fornitura della Piattaforma.
          </p>
        </div>
      </Callout>

      {/* Art. 1 */}
      <AT>Art. 1 — Definizioni</AT>
      <P>Ove non diversamente specificato, i termini del presente DPA hanno il significato attribuito dal GDPR e dai ToS di Aegis Beauty. In particolare:</P>
      <Def term="GDPR">Il Regolamento (UE) 2016/679 del Parlamento Europeo e del Consiglio del 27 aprile 2016.</Def>
      <Def term="Codice Privacy">Il D.Lgs. 196/2003, come modificato dal D.Lgs. 101/2018.</Def>
      <Def term="Dati Personali">Qualsiasi informazione riguardante una persona fisica identificata o identificabile ai sensi dell&apos;Art. 4.1 GDPR.</Def>
      <Def term="Clienti Finali / Interessati">Le persone fisiche (clienti del salone) i cui dati personali sono inseriti e trattati nella Piattaforma dal Gestore.</Def>
      <Def term="Violazione dei Dati Personali">La violazione di sicurezza che comporta accidentalmente o in modo illecito la distruzione, la perdita, la modifica, la divulgazione non autorizzata o l&apos;accesso ai dati personali trasmessi, conservati o altrimenti trattati, ai sensi dell&apos;Art. 4.12 GDPR.</Def>
      <Def term="Sub-Responsabile">Qualsiasi soggetto terzo nominato da Aegis Beauty per trattare Dati Personali dei Clienti Finali nell&apos;ambito della fornitura della Piattaforma.</Def>
      <Def term="SCC">Le Clausole Contrattuali Tipo per il trasferimento di dati personali verso paesi terzi, adottate dalla Commissione Europea ai sensi dell&apos;Art. 46.2.c GDPR.</Def>
      <Def term="EDPB">Il Comitato Europeo per la Protezione dei Dati (European Data Protection Board).</Def>

      {/* Art. 2 */}
      <AT>Art. 2 — Oggetto, natura e finalità del trattamento</AT>
      <Sub>2.1 Ruoli delle parti</Sub>
      <P>Nell&apos;ambito dell&apos;erogazione della Piattaforma, il Gestore agisce in qualità di <B>Titolare del Trattamento</B> e determina finalità e mezzi del trattamento dei dati dei propri Clienti Finali. Aegis Beauty agisce in qualità di <B>Responsabile del Trattamento</B> ai sensi dell&apos;Art. 28 GDPR.</P>

      <Sub>2.2 Categorie di dati trattati</Sub>
      <P>Aegis Beauty tratta, per conto del Gestore, le seguenti categorie di Dati Personali dei Clienti Finali:</P>
      <Ul items={[
        <><B>Dati anagrafici:</B> nome, cognome;</>,
        <><B>Dati di contatto:</B> indirizzo email, numero di telefono;</>,
        <><B>Dati di appuntamento:</B> data, ora, servizio prenotato, membro dello staff assegnato;</>,
        <><B>Scheda colore</B> (saloni di parrucchieri): note su colorazioni, formule, trattamenti e preferenze tecniche;</>,
        <><B>Scheda anamnesi</B> (centri estetici): note su trattamenti, allergie rilevanti, sensibilità cutanee;</>,
        "Storico appuntamenti e note generali del professionista sul cliente.",
      ]} />
      <Note>I dati delle schede colore e anamnesi possono contenere informazioni relative alla salute (es. allergie). Il Gestore, in qualità di Titolare, è responsabile di verificare la base giuridica adeguata per il trattamento di tali categorie particolari di dati ai sensi dell&apos;Art. 9 GDPR, ove applicabile.</Note>

      <Sub>2.3 Finalità del trattamento</Sub>
      <P>Aegis Beauty tratta i Dati Personali dei Clienti Finali esclusivamente per le seguenti finalità strumentali all&apos;erogazione del servizio:</P>
      <Ul items={[
        "fornitura del servizio gestionale SaaS (calendario, CRM, prenotazioni online);",
        "invio di comunicazioni transazionali (reminder automatici di appuntamento) ai Clienti Finali;",
        "archiviazione e mantenimento dello storico accessibile al Gestore;",
        "garanzia della sicurezza, manutenzione e continuità del servizio informatico.",
      ]} />
      <Note>Aegis Beauty non utilizza i Dati Personali dei Clienti Finali per finalità proprie, per profilazione, per marketing o per qualsiasi scopo diverso da quelli sopra elencati.</Note>

      {/* Art. 3 */}
      <AT>Art. 3 — Obblighi di Aegis Beauty come Responsabile del Trattamento</AT>
      <P>In conformità all&apos;Art. 28 par. 3 GDPR e alle Linee Guida dell&apos;EDPB sui concetti di titolare e responsabile del trattamento (07/2020), Aegis Beauty si impegna a:</P>

      <Sub>3.1 Istruzioni documentate</Sub>
      <P>Trattare i Dati Personali esclusivamente su istruzione documentata del Gestore. I presenti ToS e il DPA costituiscono le istruzioni documentate complete. Aegis Beauty informa immediatamente il Gestore qualora ritenga che un&apos;istruzione violi il GDPR, con il diritto di sospendere il trattamento contestato fino a chiarimento, senza che ciò costituisca inadempimento contrattuale.</P>

      <Sub>3.2 Riservatezza</Sub>
      <P>Garantire che tutte le persone autorizzate al trattamento dei Dati Personali abbiano assunto impegni vincolanti di riservatezza o siano soggette a obblighi legali equivalenti.</P>

      <Sub>3.3 Registro delle attività di trattamento</Sub>
      <P>Aegis Beauty mantiene il proprio registro delle attività di trattamento svolte per conto dei Gestori ai sensi dell&apos;Art. 30.2 GDPR. Tale registro è messo a disposizione del Gestore e del Garante su richiesta.</P>

      <Sub>3.4 Sicurezza</Sub>
      <P>Adottare tutte le misure tecniche e organizzative adeguate ai sensi dell&apos;Art. 32 GDPR, come dettagliate all&apos;Art. 6 del presente DPA.</P>

      <Sub>3.5 Sub-responsabili</Sub>
      <P>Rispettare le condizioni di cui agli Artt. 28.2 e 28.4 GDPR per il ricorso a Sub-Responsabili, come disciplinato all&apos;Art. 4 del presente DPA.</P>

      <Sub>3.6 Assistenza per i diritti degli Interessati</Sub>
      <P>Assistere il Gestore nel dare seguito alle richieste di esercizio dei diritti degli Interessati ai sensi degli Artt. 15–22 GDPR, come disciplinato all&apos;Art. 7 del presente DPA.</P>

      <Sub>3.7 Assistenza per la compliance</Sub>
      <P>Assistere il Gestore nel garantire il rispetto degli obblighi in materia di sicurezza (Art. 32), notifica delle violazioni (Artt. 33–34) e valutazione d&apos;impatto (Art. 35 GDPR), tenendo conto della natura del trattamento e delle informazioni a disposizione di Aegis Beauty.</P>

      <Sub>3.8 Cancellazione o restituzione</Sub>
      <P>Su scelta del Gestore, cancellare o restituire tutti i Dati Personali al termine della prestazione dei servizi ed eliminare le copie esistenti, salvo che il diritto dell&apos;Unione o degli Stati membri non preveda diversamente.</P>

      <Sub>3.9 Audit e ispezioni</Sub>
      <P>Mettere a disposizione del Gestore tutte le informazioni necessarie per dimostrare il rispetto degli obblighi di cui all&apos;Art. 28 GDPR e contribuire alle attività di revisione e ispezione, come disciplinato all&apos;Art. 8 del presente DPA.</P>

      {/* Art. 4 */}
      <AT>Art. 4 — Sub-Responsabili del Trattamento</AT>
      <Sub>4.1 Autorizzazione generale</Sub>
      <P>Il Gestore fornisce ad Aegis Beauty un&apos;autorizzazione generale a ricorrere ai Sub-Responsabili elencati al paragrafo 4.2. Aegis Beauty impone a ciascun Sub-Responsabile, tramite accordo scritto, obblighi di protezione dei dati equivalenti a quelli del presente DPA, ai sensi dell&apos;Art. 28.4 GDPR.</P>

      <Sub>4.2 Elenco dei Sub-Responsabili approvati</Sub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
        <Callout>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px' }}>Supabase Inc.</p>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Finalità: archiviazione del database (PostgreSQL) e gestione dell&apos;autenticazione. Sede legale: USA. Localizzazione dati: <B>Zurigo, Svizzera (AWS eu-central-2)</B>. La Svizzera beneficia di decisione di adeguatezza UE ai sensi dell&apos;Art. 45 GDPR. DPA stipulato con Supabase.
          </p>
        </Callout>
        <Callout>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px' }}>ZeptoMail by Zoho</p>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Finalità: invio di reminder automatici di appuntamento ai Clienti Finali. Sede: USA/India. Localizzazione server: Unione Europea. DPA stipulato con ZeptoMail.
          </p>
        </Callout>
        <Callout>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px' }}>Vercel Inc.</p>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Finalità: hosting e distribuzione dell&apos;applicazione web. Sede: USA. Vercel non archivia Dati Personali dei Clienti Finali in modo permanente, elaborando esclusivamente dati tecnici transitori di routing necessari al funzionamento dell&apos;infrastruttura.
          </p>
        </Callout>
      </div>

      <Sub>4.3 Modifiche ai Sub-Responsabili</Sub>
      <P>Aegis Beauty informa il Gestore tramite email con preavviso di almeno <B>30 giorni</B> di eventuali modifiche riguardanti l&apos;aggiunta o la sostituzione di Sub-Responsabili. Il Gestore può opporsi motivatamente entro tale termine. In caso di opposizione accettata, il Gestore ha facoltà di recedere ed esportare i propri dati senza penali.</P>

      {/* Art. 5 */}
      <AT>Art. 5 — Trasferimenti di dati verso paesi terzi</AT>
      <Sub>5.1 Localizzazione primaria e Svizzera</Sub>
      <P>Tutti i Dati Personali dei Clienti Finali sono archiviati a <B>Zurigo, Svizzera (AWS eu-central-2)</B>. La Svizzera è oggetto di una decisione di adeguatezza della Commissione Europea ai sensi dell&apos;Art. 45 GDPR. I trasferimenti verso la Svizzera sono pertanto legittimi senza necessità di meccanismi aggiuntivi di garanzia.</P>

      <Sub>5.2 Meccanismi di garanzia per trasferimenti verso gli USA</Sub>
      <P>La sede legale di Supabase Inc. e Vercel Inc. è negli Stati Uniti d&apos;America. I trasferimenti avvengono nel rispetto del Capitolo V GDPR attraverso i seguenti meccanismi:</P>
      <Ul items={[
        <><B>EU-US Data Privacy Framework (DPF):</B> decisione di adeguatezza adottata dalla Commissione Europea ai sensi dell&apos;Art. 45 GDPR per i fornitori certificati nel registro DPF;</>,
        <><B>Standard Contractual Clauses (SCC):</B> clausole contrattuali tipo approvate dalla Commissione Europea ai sensi dell&apos;Art. 46.2.c GDPR, utilizzate come meccanismo parallelo e di fallback indipendente.</>,
      ]} />
      <Callout>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Aggiornamento Marzo 2026 — Stato del DPF</p>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
          Il General Court dell&apos;UE ha confermato la validità del DPF il 3 settembre 2025 (causa T-553/23). Il meccanismo è tuttavia soggetto a ulteriore revisione della CGUE. In ragione di questa incertezza strutturale, Aegis Beauty si avvale contestualmente delle SCC come garanzia aggiuntiva indipendente, assicurando la continuità della conformità ai trasferimenti extra-SEE.
        </p>
      </Callout>

      {/* Art. 6 */}
      <AT>Art. 6 — Misure di sicurezza (Art. 32 GDPR)</AT>
      <P>In conformità all&apos;Art. 32 GDPR e alle Linee Guida EDPB, Aegis Beauty applica le seguenti misure tecniche e organizzative proporzionate al rischio:</P>
      <Ul items={[
        <><B>Cifratura in transito:</B> tutte le comunicazioni tra client e server sono cifrate tramite protocollo TLS/HTTPS.</>,
        <><B>Row Level Security (RLS):</B> policy a livello di riga nel database Supabase — ogni Gestore accede esclusivamente ai dati del proprio salone, rendendo tecnicamente impossibile l&apos;accesso ai dati di altri tenant anche in caso di errori applicativi.</>,
        <><B>Autenticazione:</B> utilizzo di token crittografici JWT per la gestione sicura delle sessioni utente.</>,
        <><B>Controllo degli accessi (RBAC):</B> permessi granulari che consentono al Gestore di definire i livelli di accesso di ciascun membro dello staff.</>,
        <><B>Certificazioni datacenter:</B> infrastruttura Supabase su AWS con certificazioni SOC 2 Type II e ISO 27001.</>,
        <><B>Monitoraggio:</B> sistemi di log applicativi per la rilevazione proattiva di anomalie di sicurezza e accessi non autorizzati.</>,
        <><B>Accesso minimizzato:</B> accesso ai Dati Personali dei Clienti Finali limitato al minimo indispensabile per l&apos;erogazione del servizio (Art. 5.1.c GDPR).</>,
      ]} />

      {/* Art. 7 */}
      <AT>Art. 7 — Esercizio dei diritti degli Interessati</AT>
      <P>I Clienti Finali inoltrano le proprie richieste di esercizio dei diritti direttamente al Gestore, che è il Titolare del Trattamento. Aegis Beauty fornisce al Gestore gli strumenti tecnici nella dashboard per adempiere in autonomia a tali richieste, tra cui:</P>
      <Ul items={[
        "esportazione della singola scheda cliente in formato CSV o Excel;",
        "eliminazione permanente e irreversibile di un contatto e di tutti i dati ad esso associati;",
        "modifica e rettifica dei dati del Cliente Finale.",
      ]} />
      <P>Qualora Aegis Beauty riceva direttamente una richiesta da un Cliente Finale, provvede a inoltrarla al Gestore entro <B>5 (cinque) giorni lavorativi</B> dal ricevimento, senza rispondere direttamente all&apos;Interessato. Il Gestore ha l&apos;obbligo di dare riscontro entro i termini previsti dal GDPR (30 giorni, prorogabili di ulteriori 60 giorni).</P>

      {/* Art. 8 */}
      <AT>Art. 8 — Audit e verifiche</AT>
      <Sub>8.1 Verifica documentale</Sub>
      <P>In via prioritaria, tramite richiesta e analisi della documentazione tecnica, delle policy di sicurezza e delle certificazioni disponibili. Aegis Beauty risponde alle richieste documentali entro <B>15 giorni lavorativi</B> dal ricevimento.</P>

      <Sub>8.2 Audit in loco</Sub>
      <P>Qualora il Gestore ritenga insufficiente la verifica documentale, può richiedere un audit, da svolgersi a proprie spese, previa richiesta scritta motivata con preavviso di almeno <B>30 (trenta) giorni</B>. Gli audit non devono perturbare in modo irragionevole le attività operative di Aegis Beauty e devono essere condotti in orari concordati.</P>
      <Note>Data la natura della beta gratuita e le dimensioni dell&apos;infrastruttura, la verifica documentale è lo strumento preferito e proporzionato per verificare la conformità di Aegis Beauty.</Note>

      {/* Art. 9 */}
      <AT>Art. 9 — Gestione delle violazioni dei dati (Data Breach)</AT>
      <Sub>9.1 Notifica al Gestore</Sub>
      <P>In caso di Violazione dei Dati Personali che coinvolga i dati dei Clienti Finali, Aegis Beauty notifica l&apos;evento al Gestore senza ingiustificato ritardo e, in ogni caso, entro <B>72 ore</B> dalla scoperta della violazione.</P>

      <Sub>9.2 Contenuto della notifica</Sub>
      <P>La notifica al Gestore include, nella misura disponibile al momento della comunicazione:</P>
      <Ul items={[
        "la natura della violazione e le categorie di Dati Personali coinvolti;",
        "il numero approssimativo di Clienti Finali interessati;",
        "le probabili conseguenze della violazione;",
        "le misure tecniche adottate o proposte per porre rimedio alla violazione e attenuarne gli effetti.",
      ]} />
      <Note>Qualora non tutte le informazioni siano disponibili entro le 72 ore, Aegis Beauty fornisce le informazioni iniziali disponibili e integra la notifica non appena possibile.</Note>

      <Sub>9.3 Responsabilità di notifica al Garante</Sub>
      <P>L&apos;obbligo di notificare la violazione all&apos;Autorità Garante (Art. 33 GDPR) e di comunicarla agli Interessati (Art. 34 GDPR) ricade in capo al <B>Gestore</B>, in qualità di Titolare del Trattamento. Aegis Beauty fornisce tutto il supporto tecnico e documentale necessario.</P>

      <Sub>9.4 Limitazione di responsabilità per eventi esterni</Sub>
      <P>Aegis Beauty non è responsabile per Violazioni dei Dati derivanti da attacchi informatici esterni diretti contro l&apos;infrastruttura dei Sub-Responsabili o da eventi di Forza Maggiore, purché Aegis Beauty abbia adottato le misure di sicurezza previste dall&apos;Art. 6 del presente DPA e non abbia contribuito alla violazione per dolo o colpa grave.</P>

      {/* Art. 10 */}
      <AT>Art. 10 — Valutazione d&apos;impatto sulla protezione dei dati (DPIA)</AT>
      <P>Qualora il Gestore sia tenuto a condurre una DPIA ai sensi dell&apos;Art. 35 GDPR, Aegis Beauty si impegna ad assisterlo fornendo:</P>
      <Ul items={[
        "informazioni sulla natura del trattamento effettuato come Responsabile;",
        "descrizione delle misure di sicurezza tecniche e organizzative adottate;",
        "documentazione sui Sub-Responsabili e sui trasferimenti verso paesi terzi.",
      ]} />
      <Note>Considerata la natura del trattamento — gestione di appuntamenti e CRM per saloni con un numero limitato di clienti — una DPIA obbligatoria ai sensi dell&apos;Art. 35.3 GDPR è generalmente non applicabile. Il Gestore è responsabile di effettuare questa valutazione autonomamente qualora le caratteristiche specifiche del trattamento lo richiedessero.</Note>

      {/* Art. 11 */}
      <AT>Art. 11 — Durata, risoluzione e cancellazione dei dati</AT>
      <Sub>11.1 Durata</Sub>
      <P>Il presente DPA entra in vigore contestualmente all&apos;accettazione dei ToS e rimane valido per tutta la durata del Programma Aegis Pioneers (Beta) fino al <B>31 dicembre 2026</B>, salvo eventuale rinnovo correlato al passaggio al servizio commerciale nel 2027.</P>

      <Sub>11.2 Effetti della risoluzione</Sub>
      <P>Alla risoluzione del rapporto contrattuale, per qualsiasi causa:</P>
      <Ul items={[
        "il Gestore ha facoltà di esportare integralmente i dati dei propri Clienti Finali in formato strutturato (CSV o Excel) prima della chiusura dell'account;",
        "Aegis Beauty provvede alla cancellazione sicura e irreversibile di tutti i Dati Personali dei Clienti Finali dai propri server entro 30 giorni dalla chiusura dell'account;",
        "i dati tecnici di sistema (log) possono essere conservati per il periodo previsto dalla normativa applicabile.",
      ]} />
      <Note>Aegis Beauty conferma per iscritto al Gestore l&apos;avvenuta cancellazione entro 10 giorni dal completamento delle operazioni.</Note>

      {/* Art. 12 */}
      <AT>Art. 12 — Prevalenza del DPA</AT>
      <P>In caso di conflitto o discrepanza tra le disposizioni del presente DPA e quelle dei ToS in materia di protezione dei dati personali, le disposizioni del presente DPA prevalgono. Per tutte le materie non disciplinate dal presente DPA, si applicano i ToS.</P>

      {/* Art. 13 */}
      <AT>Art. 13 — Modifiche al DPA</AT>
      <P>Aegis Beauty si riserva il diritto di modificare il presente DPA per adeguarlo a variazioni normative, provvedimenti del Garante o linee guida dell&apos;EDPB, o per riflettere modifiche all&apos;infrastruttura tecnica. Le modifiche sostanziali vengono comunicate via email con un preavviso di almeno <B>30 giorni</B>. Continuare a utilizzare la Piattaforma dopo l&apos;entrata in vigore delle modifiche costituisce accettazione del nuovo DPA.</P>

      {/* Art. 14 */}
      <AT>Art. 14 — Lingua del documento</AT>
      <P>Il presente DPA è redatto in <B>lingua italiana</B>, che costituisce la versione ufficiale e prevalente. In caso di traduzione in altre lingue, la versione italiana prevarrà in caso di conflitto o ambiguità interpretativa.</P>

      {/* Art. 15 */}
      <AT>Art. 15 — Legge applicabile, risoluzione delle controversie e foro competente</AT>
      <P>Il presente DPA è disciplinato dalla <B>legge italiana</B> e interpretato in conformità al GDPR, al D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018, e ai provvedimenti del Garante.</P>
      <P>Prima di ricorrere all&apos;autorità giudiziaria, le parti tentano una risoluzione amichevole entro <B>30 giorni</B> dalla notifica scritta del disaccordo. In caso di esito negativo, le parti possono avvalersi di mediazione ai sensi del D.Lgs. 28/2010 presso un organismo accreditato con sede a Torino. Per qualsiasi controversia residua sarà competente in via esclusiva il <B>Foro di Torino</B>.</P>
      <Note>Fermo restando quanto sopra, il Garante per la Protezione dei Dati Personali italiano rimane competente per qualsiasi questione relativa al rispetto della normativa in materia di protezione dei dati personali, indipendentemente dal foro contrattualmente eletto.</Note>

      {/* Art. 16 */}
      <AT>Art. 16 — Contatti</AT>
      <P>Per qualsiasi comunicazione relativa al presente DPA, le parti utilizzano i seguenti recapiti:</P>
      <Callout>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 8px' }}>Aegis Beauty — Responsabile del Trattamento</p>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.7 }}>
          Mattia Papa — <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a> — aegisbeauty.app
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 8px' }}>Gestore — Titolare del Trattamento</p>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>
          L&apos;indirizzo email fornito in fase di registrazione alla Piattaforma.
        </p>
      </Callout>
      <Note>Aegis Beauty risponde alle comunicazioni relative al presente DPA entro 15 giorni lavorativi dal ricevimento.</Note>
    </div>
  );
}
