// ============================================================================
// AEGIS BEAUTY — Cookie Policy
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
        Cookie Policy
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

// ---- Cookie table -----------------------------------------------------------

const cookies = [
  {
    name: 'Token di sessione JWT (Supabase Auth)',
    purpose: 'Mantiene l\'utente autenticato dopo il login, senza dover reinserire la password ad ogni pagina.',
    duration: 'Sessione o fino al logout',
    type: 'Tecnico necessario — prima parte',
  },
  {
    name: 'Cookie di preferenze interfaccia',
    purpose: 'Ricorda le preferenze visive e di navigazione dell\'utente (es. tema, lingua).',
    duration: 'Persistente (fino a cancellazione o scadenza)',
    type: 'Tecnico necessario — prima parte',
  },
  {
    name: 'Cookie di routing (Vercel)',
    purpose: 'Distribuisce il traffico internet per far caricare le pagine rapidamente. Non raccoglie dati personali per scopi diversi dal routing tecnico.',
    duration: 'Sessione',
    type: 'Tecnico necessario — terza parte tecnica',
  },
];

function CookieTable() {
  return (
    <div className="cookie-table-wrapper" style={{ overflowX: 'auto', margin: '20px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {/* Desktop table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }} className="cookie-table-desktop">
        <thead>
          <tr>
            {['Cookie / Strumento', 'Finalità', 'Durata', 'Tipo'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(124,58,237,0.15)', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cookies.map((c, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
              <td style={{ padding: '14px', color: '#2D2D2D', fontWeight: 600, verticalAlign: 'top', minWidth: 200 }}>{c.name}</td>
              <td style={{ padding: '14px', color: '#4F4858', lineHeight: 1.6, verticalAlign: 'top', minWidth: 240 }}>{c.purpose}</td>
              <td style={{ padding: '14px', color: '#6E6678', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{c.duration}</td>
              <td style={{ padding: '14px', verticalAlign: 'top' }}>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(124,58,237,0.12)', color: '#7e22ce', whiteSpace: 'nowrap' }}>
                  {c.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="cookie-table-mobile" style={{ display: 'none', flexDirection: 'column', gap: 16 }}>
        {cookies.map((c, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: 12, background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#2D2D2D', margin: '0 0 8px' }}>{c.name}</p>
            <p style={{ fontSize: 13, color: '#4F4858', lineHeight: 1.6, margin: '0 0 10px' }}>{c.purpose}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6E6678' }}>{c.duration}</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: 'rgba(124,58,237,0.12)', color: '#7e22ce', fontWeight: 600 }}>
                {c.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .cookie-table-desktop { display: none !important; }
          .cookie-table-mobile { display: flex !important; }
        }
        .cookie-table-wrapper::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ---- Document ---------------------------------------------------------------

export function CookiePolicy() {
  return (
    <div>
      <DocHeader />

      <P>
        La presente Cookie Policy spiega in modo chiaro e semplice cosa sono i cookie, quali
        utilizziamo sulla piattaforma Aegis Beauty e perché.
      </P>
      <P>
        Questo documento vale per tutti gli utenti di Aegis Beauty: i Gestori (titolari di salone
        che usano la dashboard gestionale) e i Clienti Finali (persone che prenotano appuntamenti
        tramite l&apos;interfaccia pubblica).
      </P>
      <P>
        La Cookie Policy è redatta nel rispetto del Regolamento UE 2016/679 (GDPR), del D.Lgs.
        196/2003 come modificato dal D.Lgs. 101/2018, della Direttiva ePrivacy 2002/58/CE, del
        Provvedimento del Garante dell&apos;8 maggio 2014 e delle Linee Guida del Garante sui
        cookie del 10 giugno 2021.
      </P>

      {/* 1 */}
      <AT>1. Cosa sono i cookie</AT>
      <P>
        I cookie sono piccoli file di testo che un sito web o un&apos;applicazione salva sul tuo
        dispositivo (computer, tablet o smartphone) quando lo visiti. Servono a far funzionare
        correttamente le piattaforme digitali e a ricordare alcune tue preferenze.
      </P>
      <P>
        I cookie si dividono principalmente in due categorie: cookie tecnici strettamente necessari
        al funzionamento del servizio, e cookie non necessari (profilazione, marketing, analisi).
        Aegis Beauty utilizza esclusivamente i primi.
      </P>

      {/* 2 */}
      <AT>2. Perché non vedi nessun banner cookie</AT>
      <Callout>
        <P>
          <strong style={{ color: '#2D2D2D' }}>Nessun banner. È tutto legale.</strong>
        </P>
        <P>
          Aegis Beauty utilizza esclusivamente cookie tecnici strettamente necessari. Ai sensi del
          Provvedimento del Garante dell&apos;8 maggio 2014 e delle Linee Guida del 10 giugno 2021,
          per i soli cookie tecnici non è richiesto il preventivo consenso dell&apos;utente. È
          sufficiente questa informativa. Non vedrai mai un banner di accettazione cookie su Aegis
          Beauty.
        </P>
      </Callout>

      {/* 3 */}
      <AT>3. Cookie utilizzati da Aegis Beauty</AT>
      <P>
        Di seguito l&apos;elenco completo e preciso dei cookie tecnici presenti sulla piattaforma:
      </P>
      <CookieTable />

      {/* 4 */}
      <AT>4. Cosa non è presente su Aegis Beauty</AT>
      <P>
        Per la massima trasparenza, dichiariamo esplicitamente che su Aegis Beauty non vengono
        utilizzati in alcun modo:
      </P>
      <Ul
        items={[
          'cookie di profilazione — non analizziamo le tue abitudini di navigazione per creare profili individuali;',
          'cookie pubblicitari o di marketing — non ti mostriamo pubblicità personalizzata;',
          'strumenti di analisi del traffico di terze parti (Google Analytics, Mixpanel o simili);',
          'pixel di tracciamento social (Facebook Pixel, TikTok Pixel o simili);',
          'qualsiasi strumento che colleghi la tua attività su Aegis Beauty ai tuoi profili sui social network.',
        ]}
      />

      {/* 5 */}
      <AT>5. Come gestire i cookie dal tuo browser</AT>
      <P>
        Hai sempre il diritto di gestire, bloccare o cancellare i cookie direttamente dalle
        impostazioni del tuo browser. Di solito trovi queste opzioni nel menu{' '}
        <strong style={{ color: '#4F4858' }}>Impostazioni → Privacy e Sicurezza → Cookie</strong>.
      </P>
      <P>Principali browser e relative guide:</P>
      <Ul
        items={[
          <><strong style={{ color: '#2D2D2D' }}>Google Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti</>,
          <><strong style={{ color: '#2D2D2D' }}>Safari:</strong> Preferenze → Privacy → Gestisci dati sito web</>,
          <><strong style={{ color: '#2D2D2D' }}>Firefox:</strong> Impostazioni → Privacy e Sicurezza → Cookie e dati dei siti web</>,
          <><strong style={{ color: '#2D2D2D' }}>Microsoft Edge:</strong> Impostazioni → Cookie e autorizzazioni sito → Cookie e dati archiviati</>,
        ]}
      />
      <Callout>
        <P>
          <strong style={{ color: '#2D2D2D' }}>Attenzione: disabilitare i cookie tecnici compromette il funzionamento.</strong>
        </P>
        <Note>
          Poiché Aegis Beauty usa solo cookie tecnici fondamentali, disabilitarli completamente dal
          browser renderà la piattaforma inutilizzabile: non potrai effettuare il login, completare
          una prenotazione o gestire il calendario, perché il sistema non potrà riconoscerti tra una
          pagina e l&apos;altra.
        </Note>
      </Callout>

      {/* 6 */}
      <AT>6. Documenti correlati</AT>
      <P>
        La Cookie Policy riguarda esclusivamente i cookie. Per una visione completa di come Aegis
        Beauty tratta i tuoi dati personali (nome, email, appuntamenti, ecc.), consulta i seguenti
        documenti disponibili su aegisbeauty.app/legal:
      </P>
      <Ul
        items={[
          'Privacy Policy Gestore — per i titolari di salone e centro estetico;',
          'Privacy Policy Cliente Finale — per chi prenota appuntamenti tramite la piattaforma;',
          'Termini di Servizio Gestore e Termini di Servizio Cliente Finale.',
        ]}
      />

      {/* 7 */}
      <AT>7. Aggiornamenti alla Cookie Policy</AT>
      <P>
        Aegis Beauty può aggiornare la presente Cookie Policy in caso di introduzione di nuovi
        strumenti tecnici o per adeguarsi a variazioni normative. Le modifiche sostanziali verranno
        comunicate via email. La versione aggiornata è sempre disponibile su aegisbeauty.app/legal
        con la data di ultimo aggiornamento.
      </P>

      {/* 8 */}
      <AT>8. Clausola di salvaguardia</AT>
      <P>
        Qualora una o più disposizioni della presente Cookie Policy risultassero invalide o
        inapplicabili ai sensi della legge italiana, ciò non inficia la validità delle restanti
        disposizioni, che rimangono pienamente in vigore.
      </P>

      {/* 9 */}
      <AT>9. Lingua del documento</AT>
      <P>
        La presente Cookie Policy è redatta in lingua italiana, che costituisce la versione
        ufficiale e prevalente.
      </P>

      {/* 10 */}
      <AT>10. Contatti</AT>
      <P>Per qualsiasi domanda sulla presente Cookie Policy:</P>
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
        Per informazioni sul trattamento dei dati personali, consulta le Privacy Policy disponibili
        su aegisbeauty.app/legal.
      </P>
    </div>
  );
}
