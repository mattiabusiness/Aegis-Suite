// ============================================================================
// AEGIS BEAUTY — Termini di Servizio Cliente Finale
// Versione 1.0 (Fase Beta) | 29 Marzo 2026
// ============================================================================

import type { ReactNode } from 'react';

// ---- Helpers ----------------------------------------------------------------

function DocHeader() {
  return (
    <div style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: 40 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
        Documento legale
      </p>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D2D2D', margin: '0 0 16px', lineHeight: 1.2 }}>
        Termini di Servizio — Cliente Finale
      </h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid rgba(124,58,237,0.12)' }}>
        <span style={{ fontSize: 13, color: '#6E6678' }}>Versione: <strong style={{ color: '#7e22ce' }}>1.0 (Fase Beta)</strong></span>
        <span style={{ fontSize: 13, color: '#6E6678' }}>Ultimo aggiornamento: <strong style={{ color: '#4F4858' }}>29 Marzo 2026</strong></span>
      </div>
    </div>
  );
}

function AT({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2D2D2D', borderLeft: '4px solid #7e22ce', paddingLeft: 14, margin: '40px 0 16px', lineHeight: 1.4 }}>
      {children}
    </h3>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <p style={{ color: '#7e22ce', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '20px 0 6px' }}>
      {children}
    </p>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 15, color: '#4F4858', lineHeight: 1.8, margin: '0 0 12px' }}>{children}</p>;
}

function Ul({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, color: '#4F4858', lineHeight: 1.7 }}>
          <span style={{ color: '#7e22ce', flexShrink: 0, marginTop: '0.15em', fontWeight: 700 }}>—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div style={{ backdropFilter: 'blur(4px)', background: 'rgba(147,51,234,0.07)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: 12, padding: '20px 24px', margin: '20px 0' }}>
      {children}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 13, color: '#6E6678', fontStyle: 'italic', lineHeight: 1.7, margin: '10px 0' }}>
      {children}
    </p>
  );
}

// ---- Document ---------------------------------------------------------------

export function TermsCustomer() {
  return (
    <div>
      <DocHeader />

      <P>
        Benvenuto su Aegis Beauty. I presenti Termini di Servizio ("Termini") spiegano le regole per
        l'utilizzo della piattaforma quando prenoti un appuntamento presso il tuo salone o centro
        estetico di fiducia.
      </P>
      <P>
        Aegis Beauty è una piattaforma tecnologica sviluppata e gestita da Mattia Papa, sviluppatore
        indipendente residente a Torino, Italia (email: mattia@aegisbeauty.app).
      </P>
      <P>
        Utilizzando la piattaforma, accetti integralmente i presenti Termini. Se non accetti, ti
        chiediamo di non utilizzare il servizio.
      </P>

      {/* Art. 1 */}
      <AT>Art. 1 — Cos&apos;è Aegis Beauty e il nostro ruolo</AT>
      <P>
        Aegis Beauty è un&apos;infrastruttura tecnologica che permette ai saloni di parrucchieri e
        ai centri estetici (di seguito "Salone" o "Gestore") di ricevere prenotazioni online dai
        propri clienti.
      </P>
      <P>
        Quando utilizzi Aegis Beauty, il tuo rapporto commerciale e professionale è esclusivamente
        con il Salone. Aegis Beauty non eroga servizi di bellezza o estetici, non è un salone e non
        è parte del contratto tra te e il tuo professionista di fiducia. Aegis Beauty fornisce
        unicamente la tecnologia che rende possibile la prenotazione online.
      </P>
      <Sub>Pagina pubblica del salone</Sub>
      <P>
        La pagina pubblica del tuo salone è accessibile da chiunque senza registrazione: puoi vedere
        i servizi, gli orari e la disponibilità. La registrazione è richiesta solo se vuoi
        completare una prenotazione o accedere allo storico dei tuoi appuntamenti.
      </P>

      {/* Art. 2 */}
      <AT>Art. 2 — Cosa offre la Piattaforma</AT>
      <P>Tramite Aegis Beauty puoi:</P>
      <Ul
        items={[
          'creare un account personale gratuito;',
          'prenotare appuntamenti online presso il tuo Salone;',
          'ricevere promemoria automatici prima dei tuoi appuntamenti;',
          'consultare lo storico delle tue prenotazioni passate e future.',
        ]}
      />

      <Sub>Promemoria e notifiche</Sub>
      <P>
        Non perdere mai un appuntamento — Aegis Beauty ti invia promemoria automatici prima di ogni
        appuntamento prenotato. I promemoria vengono sempre inviati via email, garantendo che tu li
        riceva indipendentemente dal dispositivo.
      </P>
      <P>
        Se utilizzi un dispositivo mobile, ti sarà chiesto se vuoi attivare anche le notifiche push.
        Le notifiche push sono il modo più rapido e diretto per ricevere i tuoi promemoria —
        arrivano direttamente sul tuo schermo anche quando non hai l&apos;app aperta. Per attivarle,
        basta accettare la richiesta quando appare sul tuo dispositivo.
      </P>
      <P>
        Se preferisci non attivarle o ignori la richiesta, non succede nulla: continuerai a ricevere
        tutti i promemoria via email come sempre. Puoi modificare le tue preferenze di notifica in
        qualsiasi momento dalle impostazioni del tuo dispositivo.
      </P>

      <Sub>Il servizio è completamente gratuito per te</Sub>
      <P>
        Aegis Beauty non ti chiederà mai pagamenti. La piattaforma non gestisce transazioni
        economiche tra te e il Salone, non vende i tuoi dati a terzi e non ti invierà mai
        comunicazioni pubblicitarie non richieste.
      </P>
      <Callout>
        <Note>
          Nella fase attuale (Beta, Aprile–Dicembre 2026), la piattaforma non gestisce pagamenti
          online di alcun tipo. Qualora in futuro venisse introdotta questa funzionalità, verrà
          comunicata con congruo preavviso e i Termini verranno aggiornati.
        </Note>
      </Callout>

      {/* Art. 3 */}
      <AT>Art. 3 — Età minima per l&apos;utilizzo</AT>
      <P>
        Ai sensi dell&apos;Art. 2-quinquies del D.Lgs. 196/2003, come modificato dal D.Lgs.
        101/2018, in Italia l&apos;età minima per il consenso autonomo al trattamento dei dati nei
        servizi digitali è fissata a 14 anni.
      </P>
      <Ul
        items={[
          <>
            <strong style={{ color: '#2D2D2D' }}>Minori di 14 anni:</strong> non possono
            registrarsi. Il trattamento dei dati è lecito solo con il consenso espresso di un
            genitore o tutore legale. Se hai meno di 14 anni, chiedi a un genitore di completare la
            registrazione per te.
          </>,
          <>
            <strong style={{ color: '#2D2D2D' }}>Dai 14 anni in su:</strong> puoi registrarti e
            utilizzare la piattaforma in completa autonomia, in conformità alla legge italiana.
          </>,
        ]}
      />
      <P>
        Accedendo alla piattaforma, dichiari di avere almeno 14 anni o, in alternativa, di avere il
        consenso del tuo genitore o tutore legale.
      </P>

      {/* Art. 4 */}
      <AT>Art. 4 — I tuoi obblighi</AT>
      <P>Registrandoti e utilizzando la piattaforma, ti impegni a:</P>
      <Ul
        items={[
          'fornire dati personali (nome, cognome, email, telefono) veritieri e aggiornati;',
          'utilizzare il servizio esclusivamente per prenotare appuntamenti in buona fede;',
          'rispettare le politiche del Salone in materia di cancellazioni e ritardi (ogni salone può avere le proprie regole, ad esempio disdire con un certo preavviso);',
          'mantenere riservate le credenziali di accesso al tuo account; ogni operazione effettuata tramite il tuo account è sotto la tua responsabilità.',
        ]}
      />

      {/* Art. 5 */}
      <AT>Art. 5 — Condotta vietata</AT>
      <P>Non è consentito utilizzare la piattaforma per:</P>
      <Ul
        items={[
          'attività illegali, fraudolente o contrarie alla normativa vigente;',
          'creare account falsi o fornire informazioni false in fase di registrazione;',
          'effettuare prenotazioni in malafede (es. prenotazioni multiple per lo stesso slot con intenzione di non presentarsi);',
          'tentare di accedere ad aree riservate della piattaforma, all\'account di altri utenti o all\'infrastruttura tecnica senza autorizzazione;',
          'eseguire o tentare operazioni di decompilazione, reverse engineering o disassemblaggio del codice sorgente della piattaforma;',
          'raccogliere, estrarre o scaricare in modo automatizzato dati dalla piattaforma (scraping, crawling o tecniche analoghe);',
          'trasmettere virus, malware, codice dannoso o qualsiasi altro elemento in grado di compromettere il funzionamento della piattaforma o i sistemi di altri utenti;',
          'riprodurre, copiare, duplicare o distribuire qualsiasi parte della piattaforma — inclusi interfaccia, design e contenuti — senza autorizzazione scritta di Aegis Beauty;',
          'inviare comunicazioni non richieste (spam) tramite la piattaforma.',
        ]}
      />

      {/* Art. 6 */}
      <AT>Art. 6 — Limitazione di responsabilità</AT>
      <P>
        Poiché Aegis Beauty fornisce unicamente l&apos;infrastruttura tecnologica, non è
        responsabile per:
      </P>
      <Ul
        items={[
          'la qualità, la sicurezza o il risultato dei servizi fisici erogati dal Salone;',
          'ritardi, cancellazioni improvvise o mancata presentazione del personale del Salone;',
          'dispute, disservizi o richieste di rimborso tra te e il Salone, che devono essere risolte direttamente con il Salone;',
          'interruzioni temporanee della piattaforma per manutenzione, aggiornamenti o cause di forza maggiore (guasti di rete, eventi eccezionali, attacchi informatici esterni).',
        ]}
      />
      <Callout>
        <Note>
          Nei limiti consentiti dal Codice del Consumo italiano (D.Lgs. 206/2005), Aegis Beauty non
          è responsabile per danni indiretti derivanti dall&apos;uso in buona fede della
          piattaforma. Le limitazioni sopra indicate non si applicano in caso di dolo o colpa grave
          di Aegis Beauty.
        </Note>
      </Callout>

      {/* Art. 7 */}
      <AT>Art. 7 — Cancellazione dell&apos;account e recesso</AT>
      <P>
        Poiché il servizio è completamente gratuito, puoi interromperne l&apos;utilizzo e cancellare
        il tuo account in qualsiasi momento e senza alcuna penale.
      </P>
      <P>
        Per cancellare definitivamente il tuo account, scrivi a{' '}
        <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#7e22ce', textDecoration: 'none' }}>
          mattia@aegisbeauty.app
        </a>
        . Il tuo account e tutti i tuoi dati personali verranno eliminati in modo sicuro entro 30
        giorni dalla richiesta, nel rispetto del tuo diritto alla cancellazione ai sensi
        dell&apos;Art. 17 del GDPR.
      </P>

      {/* Art. 8 */}
      <AT>Art. 8 — Privacy e trattamento dei dati personali</AT>
      <P>
        La tua privacy è importante. Per sapere come raccogliamo, proteggiamo e gestiamo i tuoi
        dati personali — in conformità al GDPR (Regolamento UE 2016/679) e al D.Lgs. 196/2003 —
        ti invitiamo a leggere la nostra Privacy Policy per i Clienti Finali, disponibile su
        aegisbeauty.app/legal.
      </P>
      <P>
        I dati che inserisci in fase di registrazione dell&apos;account (nome, email, telefono) sono
        trattati da Aegis Beauty in qualità di Titolare del Trattamento. I dati relativi ai tuoi
        appuntamenti e alle schede cliente sono trattati dal Salone in qualità di Titolare del
        Trattamento, con Aegis Beauty che agisce come Responsabile del Trattamento per conto del
        Salone. Per esercitare i tuoi diritti (accesso, rettifica, cancellazione) puoi scrivere a{' '}
        <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#7e22ce', textDecoration: 'none' }}>
          mattia@aegisbeauty.app
        </a>{' '}
        o rivolgerti direttamente al Salone per i dati degli appuntamenti.
      </P>

      {/* Art. 9 */}
      <AT>Art. 9 — Modifiche ai Termini</AT>
      <P>
        Aegis Beauty può aggiornare i presenti Termini per riflettere nuove funzionalità,
        adeguamenti normativi o il passaggio dalla fase Beta al servizio commerciale. Le modifiche
        sostanziali ti verranno comunicate via email con almeno 30 giorni di preavviso.
      </P>
      <P>
        Se continui a utilizzare la piattaforma dopo la data di entrata in vigore delle modifiche,
        si intende che le hai accettate. Se non sei d&apos;accordo, puoi cancellare il tuo account
        in qualsiasi momento senza penali.
      </P>

      {/* Art. 10 */}
      <AT>Art. 10 — Proprietà intellettuale</AT>
      <P>
        Tutti i diritti di proprietà intellettuale relativi alla piattaforma Aegis Beauty — inclusi
        codice sorgente, interfaccia grafica, design, loghi, marchi e contenuti originali — sono e
        restano di esclusiva proprietà di Mattia Papa.
      </P>
      <P>
        L&apos;accesso alla piattaforma non ti trasferisce alcun diritto di proprietà
        intellettuale. I contenuti inseriti da te (nome, dati personali, storico appuntamenti)
        restano tuoi e puoi richiederne la cancellazione in qualsiasi momento.
      </P>

      {/* Art. 11 */}
      <AT>Art. 11 — Sospensione dell&apos;account</AT>
      <P>
        Aegis Beauty si riserva il diritto di sospendere temporaneamente o disattivare
        definitivamente il tuo account in caso di:
      </P>
      <Ul
        items={[
          'violazione grave o reiterata dei presenti Termini;',
          'condotta vietata ai sensi dell\'Art. 5;',
          'utilizzo della piattaforma per scopi illeciti o lesivi di terzi;',
          'fornitura di dati falsi in fase di registrazione.',
        ]}
      />
      <P>
        In caso di sospensione, Aegis Beauty ti comunicherà il motivo via email. Se ritieni la
        sospensione ingiustificata, puoi contattarci a{' '}
        <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#7e22ce', textDecoration: 'none' }}>
          mattia@aegisbeauty.app
        </a>{' '}
        per richiedere una verifica.
      </P>

      {/* Art. 12 */}
      <AT>Art. 12 — Risoluzione alternativa delle controversie (ODR/ADR)</AT>
      <P>
        Ai sensi del Regolamento UE n. 524/2013 e del D.Lgs. 130/2015, ti informiamo che la
        Commissione Europea ha istituito una piattaforma online per la risoluzione delle controversie
        tra consumatori e professionisti (piattaforma ODR), accessibile al seguente indirizzo:
      </P>
      <Callout>
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#7e22ce', fontSize: 14, wordBreak: 'break-all' }}
        >
          https://ec.europa.eu/consumers/odr
        </a>
      </Callout>
      <P>
        Prima di ricorrere alla piattaforma ODR o all&apos;autorità giudiziaria, ti invitiamo a
        contattarci direttamente a{' '}
        <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#7e22ce', textDecoration: 'none' }}>
          mattia@aegisbeauty.app
        </a>
        : nella maggior parte dei casi siamo in grado di risolvere qualsiasi problema in modo rapido
        e informale.
      </P>

      {/* Art. 13 */}
      <AT>Art. 13 — Accordo completo</AT>
      <P>
        I presenti Termini, unitamente alla Privacy Policy disponibile su aegisbeauty.app/legal,
        costituiscono l&apos;intero accordo tra Aegis Beauty e il Cliente Finale in relazione
        all&apos;utilizzo della piattaforma, e sostituiscono qualsiasi comunicazione o accordo
        precedente avente ad oggetto la medesima materia.
      </P>

      {/* Art. 14 */}
      <AT>Art. 14 — Clausola di salvaguardia</AT>
      <P>
        Qualora una o più disposizioni dei presenti Termini risultassero invalide o inapplicabili ai
        sensi della legge italiana, ciò non inficia la validità delle restanti disposizioni, che
        rimangono pienamente in vigore.
      </P>

      {/* Art. 15 */}
      <AT>Art. 15 — Rinuncia</AT>
      <P>
        Il mancato esercizio da parte di Aegis Beauty di un diritto previsto dai presenti Termini
        non costituisce rinuncia definitiva a tale diritto. Nessuna rinuncia produce effetti se non
        espressa per iscritto.
      </P>

      {/* Art. 16 */}
      <AT>Art. 16 — Lingua del documento</AT>
      <P>
        I presenti Termini sono redatti in lingua italiana, che costituisce la versione ufficiale e
        prevalente.
      </P>

      {/* Art. 17 */}
      <AT>Art. 17 — Legge applicabile e foro competente</AT>
      <P>
        I presenti Termini sono regolati dalla legge italiana. Poiché utilizzi la piattaforma per
        scopi personali e non professionali, sei tutelato dal Codice del Consumo italiano (D.Lgs.
        206/2005).
      </P>
      <Sub>Tutela del consumatore — Foro competente</Sub>
      <Callout>
        <P>
          In quanto consumatore, sei protetto dall&apos;Art. 33 e seguenti del Codice del Consumo.
          Per qualsiasi controversia legale tra te e Aegis Beauty, il foro competente è quello del
          tuo luogo di residenza o domicilio — non quello di Torino. Questa è una tutela che la
          legge ti garantisce e alla quale non puoi rinunciare.
        </P>
      </Callout>

      {/* Art. 18 */}
      <AT>Art. 18 — Contatti e assistenza</AT>
      <P>
        Per domande su questi Termini, richieste di assistenza tecnica o per cancellare il tuo
        account:
      </P>
      <Ul
        items={[
          <>
            Email:{' '}
            <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#7e22ce', textDecoration: 'none' }}>
              mattia@aegisbeauty.app
            </a>
          </>,
          'Sito web: aegisbeauty.app',
        ]}
      />
      <P>
        Per spostare un appuntamento, chiedere informazioni su un trattamento o contattare il tuo
        professionista, scrivi direttamente al Salone.
      </P>

    </div>
  );
}
