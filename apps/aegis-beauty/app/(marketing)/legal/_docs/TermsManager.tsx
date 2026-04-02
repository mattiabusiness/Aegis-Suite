// ============================================================================
// AEGIS BEAUTY — Termini di Servizio Gestore
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
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 16px', lineHeight: 1.2 }}>
        Termini di Servizio — Gestore
      </h2>
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

export function TermsManager() {
  return (
    <div>
      <DocHeader />

      {/* Intro */}
      <P>I presenti Termini di Servizio (di seguito <B>"Termini"</B> o <B>"ToS"</B>) regolano l&apos;accesso e l&apos;utilizzo della piattaforma Aegis Beauty da parte del Gestore durante la fase di collaudo denominata <B>"Programma Aegis Pioneers"</B>.</P>
      <P>La piattaforma è sviluppata e fornita da <B>Mattia Papa</B>, sviluppatore indipendente residente a Torino, Italia (di seguito <B>"Aegis Beauty"</B> o <B>"Fornitore"</B>).</P>
      <P>Utilizzando la piattaforma, il Gestore accetta integralmente i presenti Termini. In caso di mancata accettazione, l&apos;utilizzo della piattaforma non è consentito.</P>

      {/* Art. 1 */}
      <AT>Art. 1 — Definizioni</AT>
      <Def term="Piattaforma o Software">
        L&apos;applicazione web SaaS denominata &quot;Aegis Beauty&quot;, comprensiva di tutte le sue funzionalità: calendario appuntamenti, sistema di prenotazione online, CRM clienti, gestione staff e statistiche.
      </Def>
      <Def term="Beta / Programma Aegis Pioneers">
        La fase di rilascio sperimentale e gratuita della Piattaforma, destinata a un numero chiuso di professionisti selezionati (massimo 40), attiva da Aprile 2026 a Dicembre 2026.
      </Def>
      <Def term="Gestore">
        Il professionista o il titolare di attività (salone di acconciatura o centro estetico) che accede alla Piattaforma per gestire la propria attività professionale.
      </Def>
      <Def term="Cliente Finale">
        La persona fisica che prenota servizi presso il Gestore tramite l&apos;interfaccia pubblica messa a disposizione dalla Piattaforma.
      </Def>
      <Def term="DPA — Data Processing Agreement">
        L&apos;accordo sul trattamento dei dati personali, separato dai presenti Termini, che disciplina i rispettivi ruoli ai sensi del GDPR tra il Gestore e Aegis Beauty.
      </Def>
      <Def term="Forza Maggiore">
        Qualsiasi evento imprevedibile, inevitabile e al di fuori del ragionevole controllo di una delle parti, inclusi a titolo esemplificativo: disastri naturali, pandemie, blackout infrastrutturali di larga scala, attacchi informatici di origine esterna, provvedimenti dell&apos;autorità pubblica.
      </Def>

      {/* Art. 2 */}
      <AT>Art. 2 — Oggetto del contratto</AT>
      <P>Aegis Beauty concede al Gestore una licenza d&apos;uso personale, non esclusiva, non trasferibile e temporaneamente gratuita per l&apos;utilizzo della Piattaforma in versione Beta. La concessione ha come scopo esclusivo il collaudo delle funzionalità del software in un ambiente operativo reale e la raccolta di feedback qualitativo prima del lancio commerciale ufficiale.</P>
      <P>Il presente accordo è inquadrato come <B>concessione in uso gratuito di software a scopo di collaudo (Beta Testing)</B> tra Aegis Beauty e il Gestore, che agisce per scopi inerenti alla propria attività professionale. In quanto accordo B2B, non si applicano le disposizioni del Codice del Consumo italiano (D.Lgs. 206/2005).</P>

      {/* Art. 3 */}
      <AT>Art. 3 — Dichiarazione di rappresentanza</AT>
      <P>Accedendo alla Piattaforma e accettando i presenti Termini, il Gestore dichiara e garantisce di:</P>
      <Ul items={[
        "avere piena capacità giuridica e i poteri necessari per vincolare contrattualmente sé stesso e, ove applicabile, l'attività o la società che rappresenta;",
        "avere letto, compreso e accettato integralmente i presenti Termini, la Privacy Policy e il DPA;",
        "agire per scopi connessi alla propria attività professionale o imprenditoriale, e non come consumatore ai sensi del D.Lgs. 206/2005.",
      ]} />
      <P>Qualora il Gestore acceda alla Piattaforma per conto di un&apos;entità giuridica (società, associazione o altra organizzazione), dichiara di avere i poteri di rappresentanza necessari per vincolare tale entità ai presenti Termini.</P>

      {/* Art. 4 */}
      <AT>Art. 4 — Accettazione dei Termini</AT>
      <P>L&apos;accettazione dei presenti Termini avviene in modalità <B>&quot;click-wrap&quot;</B> al momento della registrazione o del primo accesso alla Piattaforma. Non è richiesta alcuna firma autografa o digitale.</P>
      <P>L&apos;utilizzo continuativo della Piattaforma successivo a eventuali modifiche dei Termini, effettuato dopo il ricevimento della relativa comunicazione, costituisce accettazione tacita delle modifiche stesse.</P>

      {/* Art. 5 */}
      <AT>Art. 5 — Durata e gratuità della fase Beta</AT>
      <Sub>Accesso gratuito</Sub>
      <P>L&apos;accesso al Programma Aegis Pioneers è completamente gratuito. Nessun corrispettivo economico è richiesto al Gestore per l&apos;utilizzo della Piattaforma fino al <B>31 Dicembre 2026</B>.</P>
      <Sub>Transizione al servizio a pagamento</Sub>
      <P>A partire da Gennaio 2027, la Piattaforma diventerà un servizio a pagamento. Aegis Beauty comunicherà al Gestore, con un preavviso di almeno <B>30 (trenta) giorni</B>, le nuove condizioni economiche e i nuovi termini contrattuali applicabili.</P>
      <Sub>Libertà di recesso</Sub>
      <P>Il Gestore potrà liberamente scegliere se aderire al servizio a pagamento o cessare l&apos;utilizzo della Piattaforma, esportando i propri dati gratuitamente prima della scadenza della Beta, senza penali o oneri di alcun tipo.</P>

      {/* Art. 6 */}
      <AT>Art. 6 — Obblighi del Gestore</AT>
      <P>Il Gestore si impegna a:</P>
      <Ul items={[
        "utilizzare la Piattaforma esclusivamente per scopi leciti e connessi alla gestione della propria attività professionale;",
        "fornire dati accurati, veritieri e aggiornati in fase di configurazione e utilizzo;",
        "mantenere la riservatezza delle proprie credenziali di accesso; ogni operazione effettuata tramite il proprio account ricade sotto la sua esclusiva responsabilità;",
        "gestire in piena autonomia il rapporto commerciale, fiscale e professionale con i propri Clienti Finali; Aegis Beauty fornisce unicamente l'infrastruttura tecnologica e non è parte del rapporto tra Gestore e Cliente Finale;",
        "informare adeguatamente i propri Clienti Finali in merito al trattamento dei loro dati personali, predisponendo un'informativa privacy conforme alla normativa vigente;",
        "non cedere, sublicenziare o trasferire a terzi l'accesso alla Piattaforma.",
      ]} />

      {/* Art. 7 */}
      <AT>Art. 7 — Condotta vietata</AT>
      <P>Il Gestore si impegna a non utilizzare la Piattaforma per:</P>
      <Ul items={[
        "attività illegali o contrarie all'ordine pubblico, alla morale o alla normativa vigente;",
        "raccogliere, estrarre o scaricare in modo automatizzato dati dalla Piattaforma (scraping, crawling o tecniche analoghe);",
        "tentare di accedere ad aree riservate, account di altri utenti o all'infrastruttura tecnica della Piattaforma senza autorizzazione;",
        "eseguire o tentare operazioni di decompilazione, reverse engineering o disassemblaggio del codice sorgente della Piattaforma;",
        "trasmettere virus, malware, codice dannoso o qualsiasi altro elemento in grado di compromettere il funzionamento della Piattaforma o dei sistemi di altri utenti;",
        "riprodurre, duplicare, copiare o rivendere qualsiasi parte della Piattaforma senza esplicita autorizzazione scritta di Aegis Beauty;",
        "utilizzare la Piattaforma per inviare comunicazioni non sollecitate (spam) ai propri Clienti Finali.",
      ]} />
      <Note>La violazione di uno qualsiasi dei divieti sopra elencati legittima Aegis Beauty a sospendere o risolvere immediatamente l&apos;accesso ai sensi dell&apos;Art. 8.</Note>

      {/* Art. 8 */}
      <AT>Art. 8 — Sospensione e risoluzione</AT>
      <Sub>Risoluzione per giusta causa</Sub>
      <P>Aegis Beauty si riserva il diritto di sospendere o risolvere immediatamente e senza preavviso l&apos;accesso del Gestore alla Piattaforma in caso di:</P>
      <Ul items={[
        "violazione grave o reiterata dei presenti Termini;",
        "condotta vietata ai sensi dell'Art. 7;",
        "utilizzo della Piattaforma per scopi illeciti o lesivi di diritti di terzi;",
        "fornitura di dati falsi o fraudolenti in fase di registrazione.",
      ]} />
      <Sub>Risoluzione ordinaria</Sub>
      <P>Ciascuna delle parti può recedere dal presente accordo in qualsiasi momento, con un preavviso di <B>15 (quindici) giorni</B> comunicato via email. Il Gestore ha diritto all&apos;esportazione dei propri dati entro il periodo di preavviso.</P>
      <Sub>Effetti della risoluzione</Sub>
      <P>In caso di risoluzione, la licenza d&apos;uso concessa al Gestore cessa immediatamente. Aegis Beauty conserva i dati del Gestore per un periodo massimo di <B>30 giorni</B> dalla risoluzione, durante i quali il Gestore può richiederne l&apos;esportazione. Trascorso tale periodo, i dati vengono eliminati definitivamente.</P>

      {/* Art. 9 */}
      <AT>Art. 9 — Obblighi e livelli di servizio di Aegis Beauty</AT>
      <Sub>Fornitura &quot;As Is&quot;</Sub>
      <P>Trattandosi di software in fase sperimentale, la Piattaforma è fornita <B>&quot;così com&apos;è&quot;</B> e <B>&quot;come disponibile&quot;</B>. Aegis Beauty si impegna, secondo il criterio del massimo sforzo (<em>best effort</em>), a garantire la continuità del servizio, senza tuttavia fornire garanzie contrattuali (SLA) su specifici livelli di disponibilità, uptime o tempi di risoluzione dei bug.</P>
      <Sub>Manutenzione e aggiornamenti</Sub>
      <P>Aegis Beauty si riserva il diritto di sospendere temporaneamente l&apos;accesso alla Piattaforma per interventi di manutenzione, aggiornamento o correzione di errori, impegnandosi, ove possibile, a darne preventivo avviso via email.</P>
      <Sub>Modifica delle funzionalità</Sub>
      <P>Aegis Beauty si riserva il diritto di aggiungere, modificare o rimuovere funzionalità della Piattaforma in qualsiasi momento durante la fase Beta, senza che ciò costituisca inadempimento dei presenti Termini. Le modifiche rilevanti verranno comunicate al Gestore via email con ragionevole anticipo.</P>
      <Sub>Supporto</Sub>
      <P>Durante la fase Beta, il Gestore può richiedere supporto tecnico tramite la sezione Aiuto della Piattaforma o scrivendo a <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>. I tempi di risposta sono indicativi e non garantiti contrattualmente.</P>

      {/* Art. 10 */}
      <AT>Art. 10 — Trattamento dei dati personali (GDPR)</AT>
      <Sub>Ruoli nel trattamento</Sub>
      <P>Ai sensi del Regolamento UE 2016/679 (GDPR), per i dati personali dei Clienti Finali inseriti nella Piattaforma, il Gestore opera in qualità di <B>Titolare del Trattamento</B>. Aegis Beauty opera in qualità di <B>Responsabile del Trattamento</B> per conto del Gestore, come definito all&apos;Art. 28 GDPR.</P>
      <Sub>DPA</Sub>
      <P>Il rapporto dettagliato sul trattamento dei dati è disciplinato dal <B>Data Processing Agreement (DPA)</B> disponibile su aegisbeauty.app/legal, che costituisce parte integrante dei presenti Termini e deve essere accettato contestualmente.</P>
      <Sub>Infrastruttura e sub-responsabili</Sub>
      <P>I dati sono archiviati su server situati a <B>Zurigo, Svizzera (AWS eu-central-2)</B>, gestiti da Supabase. La Svizzera beneficia di una <B>decisione di adeguatezza</B> della Commissione Europea ai sensi dell&apos;Art. 45 GDPR, garantendo un livello di protezione equivalente a quello europeo senza necessità di meccanismi aggiuntivi. Per le comunicazioni transazionali, Aegis Beauty si avvale di <B>ZeptoMail</B> in qualità di sub-responsabile del trattamento.</P>
      <Sub>Dati personali del Gestore</Sub>
      <P>Per le modalità di trattamento dei dati personali del Gestore — incluse finalità, basi giuridiche, periodi di conservazione e diritti dell&apos;interessato — si rinvia alla <B>Privacy Policy</B> disponibile su aegisbeauty.app/legal.</P>

      {/* Art. 11 */}
      <AT>Art. 11 — Proprietà intellettuale</AT>
      <Sub>Della Piattaforma</Sub>
      <P>Tutti i diritti di proprietà intellettuale relativi alla Piattaforma — inclusi codice sorgente, interfaccia grafica, loghi e marchi — sono e restano di esclusiva proprietà di <B>Mattia Papa</B>. La licenza concessa al Gestore non trasferisce alcun diritto di proprietà intellettuale.</P>
      <Sub>Dei dati del Gestore</Sub>
      <P>Tutti i dati inseriti dal Gestore nella Piattaforma — anagrafiche clienti, storici appuntamenti, schede colore, schede anamnesi, statistiche — appartengono <B>esclusivamente al Gestore</B>. Aegis Beauty non rivendica alcun diritto su tali dati e non li utilizza per scopi diversi dall&apos;erogazione del servizio.</P>

      {/* Art. 12 */}
      <AT>Art. 12 — Feedback e contributi al prodotto</AT>
      <P>Il Gestore si impegna a fornire feedback periodici sull&apos;utilizzo della Beta tramite il modulo mensile predisposto da Aegis Beauty. Ogni suggerimento, segnalazione di bug o idea di miglioramento fornito dal Gestore può essere liberamente utilizzato da Aegis Beauty per sviluppare e migliorare la Piattaforma.</P>
      <P>Il Gestore riconosce che tali contributi non generano alcun <B>diritto di compensazione economica</B> né alcun <B>diritto di proprietà intellettuale</B> sulle funzionalità eventualmente sviluppate. La partecipazione al Programma Aegis Pioneers costituisce di per sé il corrispettivo non economico riconosciuto al Gestore per tale contributo.</P>

      {/* Art. 13 */}
      <AT>Art. 13 — Riservatezza</AT>
      <P>Il Gestore riconosce che la versione Beta contiene funzionalità, design e logiche di prodotto non ancora di pubblico dominio. Per tutta la durata del Programma e per i <B>12 (dodici) mesi</B> successivi, il Gestore si impegna a:</P>
      <Ul items={[
        "non divulgare a terzi informazioni riservate sulla Piattaforma, sulle sue funzionalità interne o sulle roadmap di sviluppo;",
        "non condividere screenshot, registrazioni o documentazione tecnica relativa alle aree non pubbliche della Piattaforma senza il preventivo consenso scritto di Aegis Beauty.",
      ]} />
      <P>L&apos;obbligo di riservatezza non si applica alle informazioni già di pubblico dominio al momento della divulgazione, o che devono essere comunicate per obbligo di legge.</P>

      {/* Art. 14 */}
      <AT>Art. 14 — Portabilità e cancellazione dei dati</AT>
      <P>In qualsiasi momento, il Gestore ha il diritto di:</P>
      <Ul items={[
        "richiedere l'esportazione integrale dei propri dati in formato strutturato e leggibile (CSV o Excel), senza costi aggiuntivi;",
        "richiedere la cancellazione permanente del proprio account e di tutti i dati ad esso associati dai server di Aegis Beauty.",
      ]} />
      <P>La cancellazione verrà eseguita entro <B>30 giorni</B> dalla richiesta, fatti salvi gli eventuali obblighi di conservazione previsti dalla legge italiana. Le richieste vanno inviate a <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>.</P>

      {/* Art. 15 */}
      <AT>Art. 15 — Limitazione di responsabilità</AT>
      <P>Nei limiti massimi consentiti dalla legge italiana e in ragione della natura esclusivamente gratuita e sperimentale del servizio, Aegis Beauty non è responsabile per alcun danno diretto, indiretto, incidentale o consequenziale derivante dall&apos;uso o dall&apos;impossibilità di usare la Piattaforma.</P>
      <P>In particolare, Aegis Beauty declina ogni responsabilità per:</P>
      <Ul items={[
        "interruzioni del servizio causate da malfunzionamenti dell'infrastruttura di terze parti (Supabase, Vercel, ZeptoMail);",
        "perdita di dati derivante da eventi di Forza Maggiore come definiti all'Art. 1;",
        "danni indiretti subiti dal Gestore o dai suoi Clienti Finali a seguito di utilizzo improprio della Piattaforma.",
      ]} />
      <Note>La presente limitazione è applicabile nei limiti dell&apos;Art. 1229 del Codice Civile italiano, che vieta l&apos;esclusione della responsabilità per dolo o colpa grave.</Note>

      {/* Art. 16 */}
      <AT>Art. 16 — Indennizzo</AT>
      <P>Il Gestore si impegna a tenere indenne Aegis Beauty da qualsiasi richiesta, reclamo, danno o spesa avanzata da terzi e derivante da:</P>
      <Ul items={[
        "utilizzo della Piattaforma in violazione dei presenti Termini o della normativa vigente;",
        "violazione dei diritti di terzi, inclusi i diritti dei Clienti Finali in materia di protezione dei dati personali;",
        "contenuti, dati o informazioni inseriti dal Gestore nella Piattaforma.",
      ]} />

      {/* Art. 17 */}
      <AT>Art. 17 — Forza Maggiore</AT>
      <P>Nessuna delle parti è ritenuta inadempiente qualora l&apos;inadempimento sia causato da un evento di Forza Maggiore come definito all&apos;Art. 1, purché la parte colpita:</P>
      <Ul items={[
        "notifichi l'altra parte per iscritto entro 5 (cinque) giorni lavorativi dal verificarsi dell'evento;",
        "adotti tutte le misure ragionevoli per limitare l'impatto dell'evento e riprendere l'esecuzione degli obblighi nel più breve tempo possibile.",
      ]} />
      <P>Le obbligazioni delle parti sono sospese per tutta la durata dell&apos;evento. Qualora l&apos;evento persista per un periodo superiore a <B>60 (sessanta) giorni</B>, ciascuna delle parti ha la facoltà di risolvere i presenti Termini senza penali, con preavviso scritto di 15 giorni.</P>

      {/* Art. 18 */}
      <AT>Art. 18 — Modifiche ai Termini</AT>
      <P>Aegis Beauty si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche sostanziali verranno comunicate via email con un preavviso di almeno <B>30 (trenta) giorni</B> prima della loro entrata in vigore.</P>
      <P>Continuare a utilizzare la Piattaforma dopo la data di entrata in vigore costituisce accettazione dei nuovi Termini. In caso di mancata accettazione, il Gestore ha il diritto di recedere e di richiedere l&apos;esportazione dei propri dati entro il termine di preavviso.</P>

      {/* Art. 19 */}
      <AT>Art. 19 — Comunicazioni ufficiali</AT>
      <P>Tutte le comunicazioni ufficiali tra le parti devono avvenire per iscritto via email.</P>
      <Callout>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 8px', lineHeight: 1.7 }}>
          Comunicazioni ad Aegis Beauty:{' '}
          <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>
        </p>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>
          Comunicazioni al Gestore: inviate all&apos;indirizzo email fornito in fase di registrazione.
        </p>
      </Callout>
      <Note>Le comunicazioni si considerano ricevute il giorno lavorativo successivo all&apos;invio, salvo prova contraria. Il Gestore ha l&apos;obbligo di mantenere aggiornato il proprio indirizzo email nella Piattaforma.</Note>

      {/* Art. 20 */}
      <AT>Art. 20 — Accordo completo</AT>
      <P>I presenti Termini, unitamente alla Privacy Policy e al DPA disponibili su aegisbeauty.app/legal, costituiscono l&apos;intero accordo tra Aegis Beauty e il Gestore e sostituiscono integralmente qualsiasi accordo, comunicazione o intesa precedente — scritta o verbale — avente ad oggetto la medesima materia.</P>

      {/* Art. 21 */}
      <AT>Art. 21 — Cessione del contratto</AT>
      <P>Il Gestore non può cedere, trasferire o sublicenziare i diritti o gli obblighi derivanti dai presenti Termini a terzi senza il preventivo consenso scritto di Aegis Beauty.</P>
      <P>Aegis Beauty si riserva il diritto di cedere i propri diritti e obblighi in caso di fusione, acquisizione, riorganizzazione societaria o vendita sostanziale degli asset, dandone comunicazione con un preavviso di <B>30 giorni</B>. Il Gestore avrà facoltà di recedere entro tale termine senza penali.</P>

      {/* Art. 22 */}
      <AT>Art. 22 — Clausola di salvaguardia</AT>
      <P>Qualora una o più disposizioni dei presenti Termini risultassero invalide o inapplicabili, tale invalidità non inficia la validità delle restanti disposizioni, che rimangono pienamente in vigore. La clausola invalida verrà sostituita da una disposizione che si avvicini maggiormente all&apos;intenzione originaria delle parti.</P>

      {/* Art. 23 */}
      <AT>Art. 23 — Rinuncia</AT>
      <P>Il mancato esercizio da parte di Aegis Beauty di un diritto o rimedio previsto dai presenti Termini non costituisce rinuncia a tale diritto o rimedio, né preclude l&apos;esercizio dello stesso in futuro. Nessuna rinuncia produce effetti se non espressa per iscritto.</P>

      {/* Art. 24 */}
      <AT>Art. 24 — Risoluzione alternativa delle controversie</AT>
      <P>Prima di ricorrere all&apos;autorità giudiziaria, le parti si impegnano a tentare una risoluzione amichevole della controversia. La parte che intende avviare un procedimento notifica per iscritto all&apos;altra parte la natura della controversia e le proprie pretese.</P>
      <P>Le parti dispongono di <B>30 (trenta) giorni</B> dal ricevimento della notifica per raggiungere un accordo stragiudiziale. Qualora il tentativo non abbia esito positivo, le parti possono avvalersi di una procedura di mediazione ai sensi del D.Lgs. 28/2010 presso un organismo di mediazione accreditato con sede a Torino.</P>
      <P>Solo in caso di esito negativo della mediazione, o qualora le parti non concordino sul ricorso entro il termine di 30 giorni, sarà competente in via esclusiva il Foro di Torino ai sensi dell&apos;Art. 25.</P>

      {/* Art. 25 */}
      <AT>Art. 25 — Legge applicabile e foro competente</AT>
      <P>I presenti Termini sono disciplinati esclusivamente dalla <B>legge italiana</B> e interpretati in conformità ad essa, con particolare riferimento al Codice Civile e al Regolamento UE 2016/679 (GDPR).</P>
      <P>Poiché il Gestore agisce per scopi inerenti alla propria attività imprenditoriale o professionale, il presente accordo è qualificato come <B>B2B</B> e non si applicano le disposizioni del Codice del Consumo italiano (D.Lgs. 206/2005).</P>
      <P>Esperito il tentativo di risoluzione alternativa ai sensi dell&apos;Art. 24, per qualsiasi controversia residua sarà competente in via esclusiva il <B>Foro di Torino</B>.</P>

      {/* Art. 26 */}
      <AT>Art. 26 — Lingua del contratto</AT>
      <P>I presenti Termini sono redatti in <B>lingua italiana</B>, che costituisce la versione ufficiale e prevalente. In caso di traduzione in altre lingue, la versione italiana prevarrà in caso di conflitto o ambiguità interpretativa.</P>

      {/* Art. 27 */}
      <AT>Art. 27 — Contatti</AT>
      <P>Per qualsiasi domanda, richiesta di supporto o comunicazione legale relativa ai presenti Termini, il Gestore può contattare Aegis Beauty ai seguenti recapiti:</P>
      <Callout>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 8px', lineHeight: 1.7 }}>
          Email: <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>
        </p>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>
          Sito web: <span style={{ color: '#94A3B8' }}>aegisbeauty.app</span>
        </p>
      </Callout>
      <Note>Aegis Beauty risponde alle comunicazioni di natura legale entro 15 giorni lavorativi dal ricevimento.</Note>

      {/* Implementation Note */}
      <div style={{ marginTop: 48, padding: '24px 28px', borderRadius: 16, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.18)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>
          Nota di implementazione tecnica — Artt. 1341–1342 Codice Civile
        </p>
        <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.8, margin: '0 0 10px' }}>
          Ai sensi degli Artt. 1341 e 1342 del Codice Civile italiano, le clausole che limitano la responsabilità, attribuiscono facoltà di recesso anticipato, stabiliscono un foro competente in deroga o prevedono limitazioni ai diritti dell&apos;altra parte devono essere specificamente approvate per iscritto.
        </p>
        <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.8, margin: '0 0 20px' }}>
          Il flusso di registrazione deve implementare obbligatoriamente due checkbox distinte, non pre-spuntate e obbligatorie per completare la registrazione.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(76,29,149,0.15)', border: '1px solid rgba(139,92,246,0.18)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
              Checkbox 1 — Accettazione generale
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid rgba(139,92,246,0.4)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
                Ho letto e accetto i Termini di Servizio, la Privacy Policy e il Data Processing Agreement (DPA) di Aegis Beauty, disponibili su aegisbeauty.app/legal. Confermo di agire per scopi inerenti alla mia attività professionale o imprenditoriale (accordo B2B).
              </p>
            </div>
          </div>
          <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(76,29,149,0.15)', border: '1px solid rgba(139,92,246,0.18)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
              Checkbox 2 — Approvazione clausole vessatorie (Artt. 1341–1342 c.c.)
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid rgba(139,92,246,0.4)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
                Ai sensi e per gli effetti degli Artt. 1341 e 1342 del Codice Civile italiano, dichiaro di approvare specificamente:{' '}
                <B>Art. 5</B> (Durata e gratuità — transizione al pagamento) —{' '}
                <B>Art. 8</B> (Sospensione e risoluzione anticipata) —{' '}
                <B>Art. 9</B> (Fornitura &quot;As Is&quot;, assenza di SLA) —{' '}
                <B>Art. 15</B> (Limitazione di responsabilità) —{' '}
                <B>Art. 18</B> (Modifica unilaterale dei Termini) —{' '}
                <B>Art. 21</B> (Cessione del contratto) —{' '}
                <B>Art. 25</B> (Foro esclusivo: Torino).
              </p>
            </div>
          </div>
        </div>
        <Note>
          Implementazione tecnica: entrambe le checkbox devono essere required, non pre-spuntate. Registrare nel DB: tabella <strong>acceptances</strong> — campi: user_id, terms_version, checkbox1_accepted_at, checkbox2_accepted_at, ip_address.
        </Note>
      </div>
    </div>
  );
}
