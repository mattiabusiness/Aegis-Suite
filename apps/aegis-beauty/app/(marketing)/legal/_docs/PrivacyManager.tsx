// ============================================================================
// AEGIS BEAUTY — Privacy Policy Gestore
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
        Privacy Policy — Gestore
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

export function PrivacyManager() {
  return (
    <div>
      <DocHeader />

      {/* Intro */}
      <P>La presente Informativa sul Trattamento dei Dati Personali (di seguito <B>"Privacy Policy"</B>) descrive le modalità con cui Aegis Beauty raccoglie, utilizza, conserva e protegge i dati personali dei professionisti e titolari di saloni di acconciatura o centri estetici (di seguito <B>"Gestore"</B> o <B>"Interessato"</B>) che accedono e utilizzano la piattaforma SaaS Aegis Beauty.</P>
      <P>Il documento è redatto in conformità al Regolamento (UE) 2016/679 (<B>"GDPR"</B>), al D.Lgs. 196/2003 (<B>"Codice Privacy"</B>) come modificato dal D.Lgs. 101/2018, e ai provvedimenti del Garante per la Protezione dei Dati Personali italiano.</P>

      <Callout>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Ambito di applicazione</p>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
          La presente Privacy Policy si applica esclusivamente ai dati personali del <B>Gestore</B>. I dati personali dei clienti finali del salone (anagrafiche, schede colore, schede anamnesi, storico appuntamenti) sono trattati dal Gestore in qualità di Titolare del Trattamento autonomo. Aegis Beauty tratta tali dati unicamente come Responsabile del Trattamento per conto del Gestore, rapporto disciplinato dal Data Processing Agreement (DPA) separato.
        </p>
      </Callout>

      {/* 1. Titolare */}
      <AT>1. Titolare del Trattamento</AT>
      <P>Il Titolare del Trattamento dei dati personali del Gestore è:</P>
      <Callout>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>Mattia Papa</p>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px', lineHeight: 1.7 }}>Sviluppatore indipendente — Torino, Italia</p>
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px', lineHeight: 1.7 }}>
          Email: <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>
        </p>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.7 }}>Sito web: aegisbeauty.app</p>
      </Callout>
      <Note>In ragione delle dimensioni dell&apos;attività e della natura della fase sperimentale, non ricorre l&apos;obbligo di nomina di un Responsabile della Protezione dei Dati (DPO) ai sensi dell&apos;Art. 37 GDPR.</Note>

      {/* 2. Fonte */}
      <AT>2. Fonte e origine dei dati</AT>
      <P>I dati personali trattati dal Titolare provengono direttamente dal Gestore, che li fornisce volontariamente in fase di registrazione, configurazione dell&apos;account e utilizzo della Piattaforma. Non vengono raccolti dati personali del Gestore da fonti terze, banche dati esterne o soggetti diversi dall&apos;Interessato stesso.</P>

      {/* 3. Categorie */}
      <AT>3. Categorie di dati trattati</AT>

      <Sub>3.1 Dati anagrafici e identificativi del Gestore</Sub>
      <P>Nome e cognome del proprietario o responsabile del salone o centro estetico.</P>

      <Sub>3.2 Dati di contatto del Gestore</Sub>
      <P>Indirizzo email e numero di telefono cellulare.</P>

      <Sub>3.3 Dati del salone</Sub>
      <P>Nome dell&apos;attività, indirizzo fisico completo (via, numero civico, CAP, città), orari di apertura, festività e chiusure, numero di poltrone o cabine, logo aziendale.</P>

      <Sub>3.4 Dati dello staff del salone</Sub>
      <P>Nomi delle collaboratrici inseriti dal Gestore in fase di configurazione dello staff. Il Gestore ha l&apos;obbligo di aver previamente informato i propri collaboratori in merito al trattamento dei loro dati personali sulla Piattaforma e di aver ottenuto, ove necessario, il loro consenso ai sensi della normativa applicabile.</P>

      <Sub>3.5 Dati tecnici e di navigazione</Sub>
      <P>Indirizzo IP, tipo di browser, sistema operativo, tipo di dispositivo, log di accesso (login/logout) con timestamp. Tali dati sono generati automaticamente dall&apos;infrastruttura tecnica della Piattaforma (Vercel per il layer applicativo, Supabase per il database) e non sono inseriti direttamente dal Gestore.</P>

      <Sub>3.6 Dati di utilizzo della dashboard</Sub>
      <P>Interazioni con le sezioni della dashboard, funzionalità attivate, statistiche aggregate di utilizzo. Non viene effettuata alcuna profilazione individuale del Gestore né vengono adottati processi decisionali automatizzati che producano effetti giuridici.</P>

      <Sub>3.7 Dati di feedback</Sub>
      <P>Risposte ai moduli mensili del Programma Aegis Pioneers, segnalazioni di bug, suggerimenti di miglioramento e comunicazioni dirette con il supporto tecnico.</P>

      <Callout>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Dati di pagamento — non applicabile nella fase Beta</p>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
          Durante la fase Beta (Aprile – Dicembre 2026), Aegis Beauty non raccoglie, elabora né conserva dati di pagamento o dati finanziari del Gestore. Il servizio è completamente gratuito e non sono presenti integrazioni con sistemi di pagamento di alcun tipo. Qualora, a seguito del lancio commerciale (Gennaio 2027), venisse introdotto un sistema di pagamento, la presente sezione verrà aggiornata con congruo preavviso.
        </p>
      </Callout>
      <Note>Aegis Beauty non raccoglie né tratta categorie particolari di dati ai sensi dell&apos;Art. 9 GDPR (dati sulla salute, origine etnica, opinioni politiche, ecc.) relativi al Gestore.</Note>

      {/* 4. Finalità */}
      <AT>4. Finalità e basi giuridiche del trattamento</AT>
      <P>I dati del Gestore sono trattati esclusivamente per le seguenti finalità, ciascuna fondata su una specifica base giuridica ai sensi dell&apos;Art. 6 GDPR:</P>

      <Sub>4.1 Erogazione del servizio</Sub>
      <P>Registrazione, creazione dell&apos;account, configurazione del salone white-label e accesso alle funzionalità della Piattaforma.</P>
      <Note>Base giuridica: esecuzione del contratto di cui l&apos;Interessato è parte (Art. 6.1.b GDPR).</Note>

      <Sub>4.2 Comunicazioni di servizio</Sub>
      <P>Invio di email transazionali, avvisi di sicurezza, comunicazioni operative e aggiornamenti tecnici relativi alla Piattaforma.</P>
      <Note>Base giuridica: esecuzione del contratto (Art. 6.1.b GDPR).</Note>

      <Sub>4.3 Miglioramento del prodotto</Sub>
      <P>Analisi dei dati di utilizzo aggregati, elaborazione dei feedback del Programma Aegis Pioneers e risoluzione di bug, al fine di ottimizzare la Piattaforma in vista del rilascio commerciale.</P>
      <Note>Base giuridica: legittimo interesse del Titolare (Art. 6.1.f GDPR). Il bilanciamento degli interessi è stato effettuato tenendo conto che il trattamento è limitato ai dati di utilizzo aggregati e non incide sulle libertà fondamentali del Gestore.</Note>

      <Sub>4.4 Sicurezza e prevenzione abusi</Sub>
      <P>Monitoraggio dell&apos;infrastruttura, prevenzione di accessi non autorizzati, frodi o utilizzi illeciti della Piattaforma, gestione degli incidenti di sicurezza.</P>
      <Note>Base giuridica: legittimo interesse del Titolare a tutelare i propri sistemi informatici (Art. 6.1.f GDPR).</Note>

      <Sub>4.5 Adempimento obblighi legali</Sub>
      <P>Conservazione di log di sistema o altre informazioni richieste dalla normativa vigente o da ordini delle Autorità competenti.</P>
      <Note>Base giuridica: obbligo legale al quale è soggetto il Titolare (Art. 6.1.c GDPR).</Note>

      <Note>Il trattamento dei dati del Gestore non è basato sul consenso in nessuna delle finalità sopra indicate. Pertanto, non viene richiesta al Gestore alcuna manifestazione di consenso ai sensi dell&apos;Art. 7 GDPR per le finalità descritte.</Note>

      {/* 5. Destinatari */}
      <AT>5. Destinatari dei dati</AT>
      <P>Aegis Beauty non cede, vende o condivide i dati personali del Gestore a terze parti per finalità commerciali o pubblicitarie.</P>
      <P>I dati sono condivisi esclusivamente con i seguenti fornitori di servizi IT essenziali, regolarmente nominati Responsabili del Trattamento ai sensi dell&apos;Art. 28 GDPR:</P>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
        <Callout>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px' }}>Supabase Inc.</p>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Archiviazione del database (PostgreSQL) e gestione dell&apos;autenticazione. I dati sono archiviati a Zurigo, Svizzera (AWS eu-central-2). La Svizzera beneficia di una decisione di adeguatezza della Commissione Europea ai sensi dell&apos;Art. 45 GDPR. Supabase agisce come sub-responsabile del trattamento con DPA stipulato.
          </p>
        </Callout>
        <Callout>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px' }}>ZeptoMail (by Zoho)</p>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Invio di email transazionali e di sistema, operante su server situati in Europa. ZeptoMail agisce come sub-responsabile del trattamento con DPA stipulato.
          </p>
        </Callout>
        <Callout>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px' }}>Vercel Inc.</p>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Hosting e distribuzione dell&apos;applicazione web (Next.js). Vercel non viene nominato Responsabile del Trattamento ai sensi dell&apos;Art. 28 GDPR per i dati personali degli utenti, in quanto elabora esclusivamente dati tecnici transitori di routing (log di rete, headers HTTP) necessari al funzionamento dell&apos;infrastruttura.
          </p>
        </Callout>
      </div>

      {/* 6. Trasferimenti */}
      <AT>6. Trasferimenti di dati verso paesi terzi</AT>
      <P>Il database primario di Aegis Beauty è archiviato a <B>Zurigo, Svizzera (AWS eu-central-2)</B>. La Svizzera è oggetto di una decisione di adeguatezza della Commissione Europea ai sensi dell&apos;Art. 45 GDPR, che garantisce un livello di protezione dei dati equivalente a quello europeo. I trasferimenti verso la Svizzera sono pertanto legittimi senza necessità di meccanismi aggiuntivi di garanzia.</P>
      <P>Vercel Inc. e ZeptoMail hanno sede legale rispettivamente negli USA e nell&apos;area USA/India. I trasferimenti avvengono nel rispetto del Capitolo V del GDPR, attraverso i seguenti meccanismi di garanzia:</P>
      <Ul items={[
        <>Decisione di adeguatezza <B>&quot;EU-US Data Privacy Framework&quot; (DPF)</B>, adottata dalla Commissione Europea ai sensi dell&apos;Art. 45 GDPR, per i fornitori certificati nel registro DPF;</>,
        <><B>Clausole Contrattuali Tipo (SCC)</B> approvate dalla Commissione Europea ai sensi dell&apos;Art. 46 GDPR, utilizzate come meccanismo parallelo e di fallback.</>,
      ]} />
      <Note>Nota di aggiornamento (Marzo 2026): Il General Court dell&apos;UE ha confermato la validità del DPF il 3 settembre 2025. Tuttavia, il meccanismo è soggetto a ulteriore revisione della CJEU. Aegis Beauty si avvale contestualmente delle SCC come garanzia aggiuntiva indipendente, assicurando la continuità della conformità ai trasferimenti extra-SEE.</Note>

      {/* 7. Conservazione */}
      <AT>7. Periodi di conservazione dei dati</AT>
      <P>I dati personali sono conservati per il tempo strettamente necessario al conseguimento delle finalità per cui sono stati raccolti, nel rispetto del principio di minimizzazione (Art. 5.1.e GDPR):</P>
      <Ul items={[
        <><B>Dati account e configurazione salone:</B> per tutta la durata dell&apos;utilizzo della Piattaforma, eliminati definitivamente entro 30 giorni dalla richiesta di cancellazione.</>,
        <><B>Dati tecnici, di sicurezza e log di sistema:</B> massimo 12 mesi dalla loro generazione.</>,
        <><B>Dati di feedback e diagnostica:</B> massimo 24 mesi dal momento della raccolta.</>,
      ]} />
      <P>Il Gestore può richiedere la cancellazione anticipata dei propri dati in qualsiasi momento scrivendo a <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>. La cancellazione viene eseguita entro 30 giorni dalla richiesta, fatti salvi gli eventuali obblighi legali di conservazione.</P>

      {/* 8. Sicurezza */}
      <AT>8. Misure di sicurezza</AT>
      <P>Aegis Beauty adotta misure tecniche e organizzative adeguate a garantire un livello di sicurezza commisurato al rischio, ai sensi dell&apos;Art. 32 GDPR. Le misure implementate includono:</P>
      <Ul items={[
        "Password conservate in forma crittograficamente sicura (hash) da Supabase — mai accessibili in chiaro da Aegis Beauty o da chiunque altro;",
        "Cifratura dei dati in transito tramite protocollo TLS/HTTPS su tutti i canali di comunicazione;",
        "Row Level Security (RLS) a livello di database Supabase: ogni Gestore può accedere esclusivamente ai propri dati, rendendo tecnicamente impossibile l'accesso ai dati di altri saloni;",
        "Autenticazione sicura con gestione delle sessioni tramite token crittografici;",
        "Controllo degli accessi basato su ruoli (RBAC) con permessi granulari per titolare e staff;",
        "Accesso ai dati limitato al Titolare e ai sub-responsabili strettamente necessari all'erogazione del servizio;",
        "Monitoraggio dei log di sistema per la rilevazione di anomalie e accessi non autorizzati;",
        "Infrastruttura cloud con certificazioni di sicurezza riconosciute (Supabase: SOC 2 Type II).",
      ]} />

      <Sub>Violazione dei dati personali (Data Breach)</Sub>
      <P>In caso di violazione dei dati personali ai sensi dell&apos;Art. 33 GDPR, Aegis Beauty notificherà il Garante per la Protezione dei Dati Personali entro <B>72 ore</B> dalla scoperta dell&apos;evento. Qualora la violazione sia suscettibile di causare un rischio elevato per i diritti e le libertà del Gestore, quest&apos;ultimo verrà informato senza indebito ritardo ai sensi dell&apos;Art. 34 GDPR.</P>

      <Sub>Limitazione di responsabilità per eventi di cybersecurity e forza maggiore</Sub>
      <P>Aegis Beauty non può garantire una sicurezza informatica assoluta. Il Titolare declina ogni responsabilità per violazioni dei dati derivanti da:</P>
      <Ul items={[
        "attacchi informatici esterni di origine dolosa (hacking, ransomware, phishing, DDoS) diretti contro l'infrastruttura di terze parti o contro la Piattaforma stessa, che non siano stati resi possibili da negligenza grave del Titolare;",
        "vulnerabilità zero-day non ancora note alla comunità della sicurezza informatica al momento dell'evento;",
        "interruzioni o compromissioni dell'infrastruttura cloud dei sub-responsabili del trattamento (Supabase, Vercel) al di fuori del controllo ragionevole del Titolare;",
        "eventi di forza maggiore come definiti nei Termini di Servizio.",
      ]} />
      <Note>In tutti i casi sopra elencati, Aegis Beauty mantiene integralmente gli obblighi di notifica al Garante e al Gestore previsti dagli Artt. 33 e 34 GDPR, indipendentemente dalla causa della violazione.</Note>

      {/* 9. Profilazione */}
      <AT>9. Profilazione e processi decisionali automatizzati</AT>
      <P>Aegis Beauty non effettua alcuna profilazione del Gestore né adotta processi decisionali automatizzati che producano effetti giuridici o che incidano significativamente sulla persona dell&apos;Interessato, ai sensi dell&apos;Art. 22 GDPR.</P>
      <P>I dati di utilizzo della Piattaforma sono analizzati esclusivamente in forma <B>aggregata e anonimizzata</B> per finalità di miglioramento del prodotto, senza alcun processo di profilazione individuale.</P>

      {/* 10. Cookie */}
      <AT>10. Cookie e tecnologie di tracciamento</AT>
      <P>La Piattaforma Aegis Beauty, nell&apos;area riservata ai Gestori, utilizza esclusivamente <B>cookie tecnici strettamente necessari</B> al funzionamento del software: mantenimento della sessione di autenticazione, sicurezza e preferenze di interfaccia.</P>
      <P>Aegis Beauty non utilizza cookie di profilazione, marketing, retargeting o tracciamento pubblicitario di terze parti. Per un&apos;informativa completa, il Gestore è invitato a consultare la <B>Cookie Policy</B> disponibile su aegisbeauty.app/legal.</P>

      {/* 11. Diritti */}
      <AT>11. Diritti dell&apos;Interessato</AT>
      <P>Ai sensi degli Artt. 15–22 del GDPR, il Gestore può esercitare in qualsiasi momento, gratuitamente e senza formalità, i seguenti diritti:</P>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
        {[
          { title: 'Diritto di accesso (Art. 15)', body: "Ottenere conferma che sia in corso un trattamento di propri dati personali e, in tal caso, accedere alle informazioni sul trattamento e a una copia dei dati." },
          { title: 'Diritto di rettifica (Art. 16)', body: "Richiedere la correzione di dati inesatti o incompleti." },
          { title: 'Diritto alla cancellazione — "Diritto all\'oblio" (Art. 17)', body: "Richiedere l'eliminazione dei propri dati personali quando non siano più necessari alle finalità per cui sono stati raccolti, o in altre ipotesi previste dal GDPR." },
          { title: 'Diritto di limitazione del trattamento (Art. 18)', body: "Richiedere il blocco temporaneo del trattamento in specifiche circostanze (es. contestazione dell'esattezza dei dati o opposizione al trattamento in attesa di verifica)." },
          { title: 'Diritto alla portabilità (Art. 20)', body: "Ricevere i propri dati in formato strutturato, di uso comune e leggibile da dispositivo automatico, e trasmetterli a un altro titolare del trattamento." },
          { title: 'Diritto di opposizione (Art. 21)', body: "Opporsi in qualsiasi momento al trattamento dei propri dati fondato sul legittimo interesse del Titolare, salvo che sussistano motivi legittimi cogenti che prevalgono sugli interessi dell'Interessato." },
          { title: 'Diritto di non essere sottoposto a decisioni automatizzate (Art. 22)', body: "Non essere sottoposto a decisioni basate unicamente sul trattamento automatizzato. Come indicato alla Sezione 9, tale trattamento non viene effettuato da Aegis Beauty." },
        ].map(({ title, body }, i) => (
          <div key={i} style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>{title}</p>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{body}</p>
          </div>
        ))}
      </div>

      <P>Per esercitare qualsiasi diritto, il Gestore può inviare una richiesta scritta a <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>. Il Titolare fornirà riscontro entro <B>30 giorni</B> dal ricevimento, prorogabili di ulteriori 60 giorni in caso di particolare complessità, con comunicazione motivata entro il primo termine.</P>

      <Callout>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Diritto di reclamo al Garante (Art. 77 GDPR)</p>
        <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
          Qualora il Gestore ritenga che il trattamento dei propri dati personali violi il GDPR o la normativa italiana, ha il diritto di proporre reclamo formale al <B>Garante per la Protezione dei Dati Personali</B> (www.garanteprivacy.it), ai sensi dell&apos;Art. 77 GDPR e dell&apos;Art. 141 D.Lgs. 196/2003.
        </p>
      </Callout>

      {/* 12. Modifiche */}
      <AT>12. Modifiche alla Privacy Policy</AT>
      <P>Aegis Beauty si riserva il diritto di aggiornare la presente Privacy Policy per adeguarla all&apos;evoluzione normativa, a provvedimenti del Garante, all&apos;implementazione di nuove funzionalità o al passaggio dalla fase Beta alla fase commerciale.</P>
      <P>Le modifiche sostanziali verranno comunicate via email con un preavviso di almeno <B>30 giorni</B> prima dell&apos;entrata in vigore. La versione aggiornata sarà sempre disponibile su aegisbeauty.app/legal con indicazione della data di ultimo aggiornamento e del numero di versione.</P>

      {/* 13. Lingua */}
      <AT>13. Lingua del documento</AT>
      <P>La presente Privacy Policy è redatta in <B>lingua italiana</B>, che costituisce la versione ufficiale e prevalente. In caso di traduzione in altre lingue, la versione italiana prevarrà in caso di conflitto o ambiguità interpretativa.</P>

      {/* 14. Contatti */}
      <AT>14. Contatti per questioni privacy</AT>
      <P>Per qualsiasi richiesta relativa al trattamento dei propri dati personali, all&apos;esercizio dei diritti di cui alla Sezione 11, o per qualsiasi altra questione inerente alla presente Privacy Policy:</P>
      <Callout>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 8px', lineHeight: 1.7 }}>
          Email: <a href="mailto:mattia@aegisbeauty.app" style={mail}>mattia@aegisbeauty.app</a>
        </p>
        <p style={{ fontSize: 14, color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>
          Sito web: <span style={{ color: '#94A3B8' }}>aegisbeauty.app</span>
        </p>
      </Callout>
      <Note>Il Titolare risponde alle richieste in materia di privacy entro 30 giorni dal ricevimento, come previsto dall&apos;Art. 12.3 GDPR.</Note>
    </div>
  );
}
