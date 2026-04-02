// ============================================================================
// AEGIS BEAUTY — Privacy Policy Cliente Finale
// Versione 1.0 (Fase Beta) | 29 Marzo 2026
// ============================================================================

import type { ReactNode } from 'react';

// ---- Helpers ----------------------------------------------------------------

function DocHeader() {
  return (
    <div style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: 40 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
        Documento legale
      </p>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC', margin: '0 0 16px', lineHeight: 1.2 }}>
        Privacy Policy — Cliente Finale
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

// ---- Document ---------------------------------------------------------------

export function PrivacyCustomer() {
  return (
    <div>
      <DocHeader />

      <P>
        Teniamo molto alla tua privacy. Questo documento ti spiega in modo chiaro e semplice come
        gestiamo i tuoi dati personali quando utilizzi Aegis Beauty per prenotare un appuntamento
        presso il tuo salone o centro estetico di fiducia.
      </P>
      <P>
        Il documento è redatto in conformità al Regolamento (UE) 2016/679 ("GDPR"), al D.Lgs.
        196/2003 come modificato dal D.Lgs. 101/2018, e ai provvedimenti del Garante per la
        Protezione dei Dati Personali italiano.
      </P>

      {/* 1 */}
      <AT>1. Chi gestisce i tuoi dati — una distinzione importante</AT>
      <P>
        Quando usi Aegis Beauty, i tuoi dati vengono gestiti su due livelli distinti. È importante
        capire questa differenza per sapere a chi rivolgerti per qualsiasi richiesta.
      </P>

      <Sub>Livello 1 — Il tuo account Aegis Beauty</Sub>
      <Def term="Chi decide (Titolare del Trattamento)">
        Mattia Papa, sviluppatore indipendente, Torino —{' '}
        <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#a855f7', textDecoration: 'none' }}>
          mattia@aegisbeauty.app
        </a>
      </Def>
      <Def term="Di cosa si occupa">
        Dei dati che usi per iscriverti (nome, email, telefono, password) e dei dati tecnici di
        funzionamento.
      </Def>

      <Sub>Livello 2 — I tuoi appuntamenti e le tue schede personali</Sub>
      <Def term="Chi decide (Titolare del Trattamento)">Il tuo Salone di fiducia.</Def>
      <Def term="Chi gestisce la tecnologia (Responsabile del Trattamento)">
        Aegis Beauty, che agisce solo come fornitore tecnico per conto del Salone.
      </Def>
      <Def term="Di cosa si occupa il Salone">
        Dello storico appuntamenti, delle schede colore (parrucchieri) e delle schede anamnesi
        (estetisti), delle note del professionista su di te.
      </Def>

      <Callout>
        <P>
          <strong style={{ color: '#F8FAFC' }}>In sintesi:</strong> Aegis Beauty gestisce il tuo
          login e i promemoria. Il tuo Salone gestisce il tuo storico di bellezza.
        </P>
        <Note>
          In ragione delle dimensioni e della natura dell&apos;attività in fase Beta, non ricorre
          l&apos;obbligo di nomina di un Responsabile della Protezione dei Dati (DPO) ai sensi
          dell&apos;Art. 37 GDPR. Per qualsiasi questione privacy puoi contattare direttamente{' '}
          <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#a855f7', textDecoration: 'none' }}>
            mattia@aegisbeauty.app
          </a>
          .
        </Note>
      </Callout>

      {/* 2 */}
      <AT>2. Da dove provengono i tuoi dati</AT>
      <P>
        I dati che Aegis Beauty tratta come Titolare (Livello 1) provengono direttamente da te, che
        li fornisci in fase di registrazione e utilizzo della piattaforma. Non raccogliamo tuoi dati
        da fonti terze o banche dati esterne.
      </P>
      <P>
        I dati tecnici (IP, browser, dispositivo) vengono generati automaticamente
        dall&apos;infrastruttura quando accedi alla piattaforma, e non sono inseriti da te
        direttamente.
      </P>

      {/* 3 */}
      <AT>3. Quali dati raccoglie Aegis Beauty e perché (Livello 1)</AT>
      <P>
        In qualità di Titolare del Trattamento per il Livello 1, Aegis Beauty raccoglie
        esclusivamente:
      </P>

      <Sub>3.1 Dati di registrazione</Sub>
      <P>Nome, cognome, indirizzo email, numero di telefono.</P>

      <Sub>3.2 Dati di sicurezza</Sub>
      <P>
        La tua password, conservata in forma crittograficamente sicura (hash) — non è mai
        accessibile in chiaro, nemmeno da Aegis Beauty.
      </P>

      <Sub>3.3 Dati tecnici (generati automaticamente dall&apos;infrastruttura)</Sub>
      <P>
        Indirizzo IP, tipo di browser, tipo di dispositivo, data e ora degli accessi. Generati
        automaticamente da Vercel e Supabase quando accedi alla piattaforma.
      </P>

      <Sub>3.4 Preferenze notifiche</Sub>
      <P>La tua scelta in merito all&apos;attivazione o meno delle notifiche push.</P>

      <Callout>
        <Note>
          <strong style={{ color: '#94A3B8' }}>Dati di pagamento — non applicabili nella fase Beta.</strong>{' '}
          Il servizio è completamente gratuito. Aegis Beauty non raccoglie, elabora né conserva dati
          di pagamento o dati finanziari di alcun tipo nella fase Beta (Aprile–Dicembre 2026).
        </Note>
      </Callout>

      {/* 4 */}
      <AT>4. Perché utilizziamo i tuoi dati e su quale base legale</AT>

      <Sub>4.1 Per farti usare la piattaforma</Sub>
      <P>Creazione account, accesso e invio promemoria appuntamenti via email.</P>
      <P>
        <strong style={{ color: '#94A3B8' }}>Base legale:</strong>{' '}
        <span style={{ color: '#64748B' }}>esecuzione del contratto (Art. 6.1.b GDPR).</span>
      </P>

      <Sub>4.2 Per inviarti notifiche push</Sub>
      <P>
        Solo se ci dai esplicitamente il permesso, ti inviamo promemoria direttamente sullo schermo
        del telefono. Puoi revocare questo consenso in qualsiasi momento dalle impostazioni del tuo
        dispositivo. Se le disattivi, riceverai i promemoria via email come sempre.
      </P>
      <P>
        <strong style={{ color: '#94A3B8' }}>Base legale:</strong>{' '}
        <span style={{ color: '#64748B' }}>consenso esplicito revocabile (Art. 6.1.a GDPR).</span>
      </P>

      <Sub>4.3 Per la sicurezza della piattaforma</Sub>
      <P>
        I dati tecnici ci servono per prevenire accessi non autorizzati, abusi e attacchi
        informatici.
      </P>
      <P>
        <strong style={{ color: '#94A3B8' }}>Base legale:</strong>{' '}
        <span style={{ color: '#64748B' }}>
          legittimo interesse di Aegis Beauty a proteggere i propri sistemi (Art. 6.1.f GDPR).
        </span>
      </P>

      <Sub>4.4 Per obblighi di legge</Sub>
      <P>
        Conservazione di log di sistema o risposta a richieste delle Autorità competenti.
      </P>
      <P>
        <strong style={{ color: '#94A3B8' }}>Base legale:</strong>{' '}
        <span style={{ color: '#64748B' }}>obbligo legale (Art. 6.1.c GDPR).</span>
      </P>

      {/* 5 */}
      <AT>5. Regole per i minori</AT>
      <P>
        Ai sensi dell&apos;Art. 2-quinquies del D.Lgs. 196/2003, come modificato dal D.Lgs.
        101/2018, in Italia l&apos;età minima per il consenso autonomo al trattamento dei dati nei
        servizi digitali è 14 anni.
      </P>
      <Ul
        items={[
          <>
            <strong style={{ color: '#F8FAFC' }}>Dai 14 anni in su:</strong> puoi usare Aegis
            Beauty in completa autonomia, in conformità alla legge italiana.
          </>,
          <>
            <strong style={{ color: '#F8FAFC' }}>Sotto i 14 anni:</strong> la registrazione è
            lecita solo con il consenso esplicito di un genitore o tutore legale.
          </>,
        ]}
      />
      <P>
        Aegis Beauty non raccoglie consapevolmente dati di minori di 14 anni senza consenso
        genitoriale.
      </P>

      {/* 6 */}
      <AT>6. Con chi condividiamo i tuoi dati</AT>
      <P>
        Aegis Beauty non vende e non cederà mai i tuoi dati a terzi per scopi commerciali o
        pubblicitari.
      </P>
      <P>
        Per far funzionare la piattaforma, ci avvaliamo dei seguenti fornitori tecnici, vincolati al
        rispetto della privacy:
      </P>

      <Def term="Supabase Inc.">
        Gestisce il database. I dati sono conservati a Zurigo, Svizzera (AWS eu-central-2). Supabase
        agisce come sub-responsabile del trattamento con DPA stipulato.
      </Def>
      <Def term="ZeptoMail (by Zoho)">
        Il sistema che invia materialmente le email di promemoria. Server in Europa. DPA stipulato.
      </Def>
      <Def term="Vercel Inc.">
        Ospita l&apos;applicazione web. Si occupa solo di distribuire il traffico tecnico su
        internet e non conserva i tuoi dati personali in modo permanente. Non è nominato
        Responsabile del Trattamento ai sensi dell&apos;Art. 28 GDPR per i dati degli utenti.
      </Def>

      {/* 7 */}
      <AT>7. Trasferimento dei dati fuori dall&apos;Europa</AT>

      <Sub>Svizzera (Supabase)</Sub>
      <P>
        I tuoi dati sono conservati a Zurigo, Svizzera. La Commissione Europea ha riconosciuto che
        la Svizzera garantisce un livello di protezione equivalente a quello europeo (decisione di
        adeguatezza Art. 45 GDPR). I tuoi dati sono protetti come se fossero in Italia.
      </P>

      <Sub>Stati Uniti (Vercel, ZeptoMail)</Sub>
      <P>
        Eventuali trasferimenti tecnici verso gli USA avvengono nel rispetto del Capitolo V GDPR
        attraverso due meccanismi paralleli: il Data Privacy Framework EU-USA (confermato dal
        Tribunale dell&apos;UE il 3 settembre 2025, causa T-553/23) e le Clausole Contrattuali Tipo
        (SCC) come garanzia aggiuntiva indipendente, che assicura continuità anche in caso di futura
        revisione del DPF.
      </P>

      {/* 8 */}
      <AT>8. Per quanto tempo conserviamo i tuoi dati</AT>
      <Ul
        items={[
          <>
            <strong style={{ color: '#F8FAFC' }}>Dati account</strong> (nome, email, telefono): per
            tutta la durata dell&apos;account. Cancellazione definitiva entro 30 giorni dalla tua
            richiesta.
          </>,
          <>
            <strong style={{ color: '#F8FAFC' }}>Password:</strong> conservata in forma hash;
            eliminata insieme all&apos;account.
          </>,
          <>
            <strong style={{ color: '#F8FAFC' }}>Log tecnici</strong> (IP, accessi): massimo 12
            mesi dalla generazione.
          </>,
          <>
            <strong style={{ color: '#F8FAFC' }}>Preferenze notifiche:</strong> fino a quando non
            le modifichi o cancelli l&apos;account.
          </>,
        ]}
      />
      <P>
        Puoi richiedere la cancellazione anticipata del tuo account in qualsiasi momento scrivendo a{' '}
        <a href="mailto:mattia@aegisbeauty.app" style={{ color: '#a855f7', textDecoration: 'none' }}>
          mattia@aegisbeauty.app
        </a>
        .
      </P>

      {/* 9 */}
      <AT>9. Come proteggiamo i tuoi dati e cosa succede in caso di violazione</AT>
      <P>
        Adottiamo misure di sicurezza tecniche e organizzative ai sensi dell&apos;Art. 32 GDPR:
      </P>
      <Ul
        items={[
          <>
            <strong style={{ color: '#F8FAFC' }}>Cifratura TLS/HTTPS:</strong> i dati viaggiano su
            internet in modo illeggibile per chiunque provi a intercettarli;
          </>,
          <>
            <strong style={{ color: '#F8FAFC' }}>Password in hash:</strong> la tua password non è
            mai accessibile in chiaro, nemmeno da Aegis Beauty;
          </>,
          <>
            <strong style={{ color: '#F8FAFC' }}>
              Isolamento dei dati (Row Level Security — RLS):
            </strong>{' '}
            l&apos;architettura del database isola i dati di ogni salone, riducendo
            significativamente il rischio che un salone o utente possa accedere ai dati di un altro;
          </>,
          'Autenticazione con token JWT sicuri;',
          'Datacenter certificati SOC 2 Type II (Supabase/AWS);',
          'Monitoraggio dei log per la rilevazione di accessi anomali.',
        ]}
      />

      <Sub>In caso di violazione dei dati (Data Breach)</Sub>
      <Callout>
        <P>
          Se si verificasse una violazione che mette a rischio i tuoi dati, Aegis Beauty notificherà
          il Garante entro 72 ore dalla scoperta (Art. 33 GDPR) e, se il rischio per te è elevato,
          ti avviserà direttamente senza indebito ritardo (Art. 34 GDPR).
        </P>
        <Note>
          Fatti salvi i casi di dolo o colpa grave di Aegis Beauty, non siamo responsabili per
          danni derivanti da attacchi informatici esterni imprevedibili (hacking, ransomware,
          zero-day) diretti contro l&apos;infrastruttura dei nostri fornitori tecnici o da eventi di
          forza maggiore.
        </Note>
      </Callout>

      {/* 10 */}
      <AT>10. Profilazione e decisioni automatizzate</AT>
      <P>
        Aegis Beauty non effettua alcuna profilazione individuale né adotta processi decisionali
        automatizzati che producano effetti giuridici o che incidano significativamente su di te, ai
        sensi dell&apos;Art. 22 GDPR.
      </P>

      {/* 11 */}
      <AT>11. Cookie e tecnologie di tracciamento</AT>
      <P>
        La piattaforma utilizza esclusivamente cookie tecnici strettamente necessari al
        funzionamento: mantenimento della sessione di login, sicurezza e preferenze di interfaccia.
      </P>
      <P>
        Non utilizziamo cookie di profilazione, marketing o tracciamento pubblicitario. Per tutti i
        dettagli, consulta la Cookie Policy disponibile su aegisbeauty.app/legal.
      </P>

      {/* 12 */}
      <AT>12. I tuoi diritti e a chi rivolgerti</AT>
      <P>
        Ai sensi degli Artt. 15–22 del GDPR hai il diritto di: accedere ai tuoi dati, correggerli,
        cancellarli, limitarne l&apos;uso, riceverli in formato portabile, opporti al trattamento e
        non essere sottoposto a decisioni automatizzate.
      </P>

      <Sub>A chi rivolgerti — ricorda i due livelli</Sub>
      <Ul
        items={[
          <>
            <strong style={{ color: '#F8FAFC' }}>
              Per il tuo account
            </strong>{' '}
            (cancellazione, modifica email/password, log accessi): scrivi a{' '}
            <a
              href="mailto:mattia@aegisbeauty.app"
              style={{ color: '#a855f7', textDecoration: 'none' }}
            >
              mattia@aegisbeauty.app
            </a>
            . Risponderemo entro 30 giorni, prorogabili di 60 in casi complessi.
          </>,
          <>
            <strong style={{ color: '#F8FAFC' }}>
              Per lo storico appuntamenti, schede colore, schede anamnesi, note del professionista:
            </strong>{' '}
            rivolgiti direttamente al tuo Salone — è lui il Titolare di quei dati. Se scrivi a noi,
            inoltreremo la tua richiesta al Salone, ma sarà il Salone a dover rispondere.
          </>,
        ]}
      />

      <Callout>
        <P>
          Se ritieni che i tuoi diritti siano stati violati, puoi presentare reclamo formale al
          Garante per la Protezione dei Dati Personali italiano:{' '}
          <a
            href="https://www.garanteprivacy.it"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#a855f7', textDecoration: 'none' }}
          >
            www.garanteprivacy.it
          </a>{' '}
          (Art. 77 GDPR).
        </P>
      </Callout>

      {/* 13 */}
      <AT>13. Aggiornamenti a questa Privacy Policy</AT>
      <P>
        Aegis Beauty può aggiornare questa Privacy Policy per adeguarla a variazioni normative,
        provvedimenti del Garante o nuove funzionalità. Le modifiche sostanziali verranno comunicate
        via email con almeno 30 giorni di preavviso.
      </P>
      <P>
        La versione aggiornata sarà sempre disponibile su aegisbeauty.app/legal con la data di
        ultimo aggiornamento. Se continui a usare la piattaforma dopo le modifiche, si intende che
        le hai accettate.
      </P>

      {/* 14 */}
      <AT>14. Lingua del documento</AT>
      <P>
        La presente Privacy Policy è redatta in lingua italiana, che costituisce la versione
        ufficiale e prevalente. In caso di traduzione in altre lingue, la versione italiana prevarrà
        in caso di conflitto.
      </P>

      {/* 15 */}
      <AT>15. Contatti per questioni privacy</AT>
      <P>
        Per qualsiasi domanda su questa Privacy Policy o per esercitare i tuoi diritti relativi
        all&apos;account:
      </P>
      <Ul
        items={[
          <>
            Email:{' '}
            <a
              href="mailto:mattia@aegisbeauty.app"
              style={{ color: '#a855f7', textDecoration: 'none' }}
            >
              mattia@aegisbeauty.app
            </a>
          </>,
          'Sito web: aegisbeauty.app',
        ]}
      />
      <P>
        Per domande sugli appuntamenti o sulle tue schede personali, contatta direttamente il tuo
        Salone.
      </P>
    </div>
  );
}
