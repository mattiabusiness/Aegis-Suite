'use client';

// ============================================================================
// AEGIS BEAUTY - FAQ SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/FAQSection.tsx
// ============================================================================

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

const faqs = [
  {
    q: 'Sei davvero uno studente di 16 anni. Posso fidarmi?',
    a: 'È la domanda giusta. Sì, ho 16 anni e vado ancora a scuola. Ho costruito un software completo, una suite legale da 6 documenti, un\'infrastruttura su server europei certificati SOC 2. Puoi giudicarmi dall\'età o da quello che ho costruito. Preferisco il secondo.',
  },
  {
    q: 'Quanto costerà dopo la beta?',
    a: 'Non lo so ancora — e te lo dico onestamente. Il prezzo commerciale verrà definito insieme ai Pioneers, sulla base di quello che il prodotto vale davvero per il tuo salone. Quello che sappiamo è che chi entra adesso avrà accesso prioritario e condizioni migliori di chiunque altro.',
  },
  {
    q: 'Ho già un gestionale. È complicato passare ad Aegis?',
    a: 'No. L\'onboarding lo facciamo insieme in una videocall di 30 minuti — io e te. Importiamo i tuoi dati, configuriamo il salone, testiamo tutto. Se hai un gestionale vecchio, ti aiuto a migrare. Se usi ancora carta e WhatsApp, partiamo da zero in meno di un\'ora.',
  },
  {
    q: 'I dati dei miei clienti sono al sicuro?',
    a: 'I tuoi dati sono archiviati su server a Zurigo, Svizzera — gli stessi standard di sicurezza delle banche europee. Certificazione SOC 2 Type II, cifratura completa, isolamento totale tra un salone e l\'altro. Hai una suite legale completa — DPA, Privacy Policy, Termini di Servizio — disponibile su questa pagina. Niente è nascosto.',
  },
  {
    q: 'Se non mi piace, posso smettere?',
    a: 'Quando vuoi. La beta è gratuita, non ci sono contratti vincolanti, non ci sono penali. Esporti tutti i tuoi dati in un click e te ne vai. Ma te lo diciamo già adesso: nessun Pioneer ha mai voluto andarsene.',
  },
];

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(bodyRef.current.scrollHeight);
    }
  }, [a]);

  return (
    <div
      style={{
        borderRadius: 14,
        border: `1px solid ${open ? 'rgba(168,85,247,0.25)' : 'rgba(124,58,237,0.12)'}`,
        background: open ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.3s, background 0.3s',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '22px 24px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
            fontWeight: 600,
            color: open ? '#F8FAFC' : '#CBD5E1',
            lineHeight: 1.4,
            transition: 'color 0.3s',
          }}
        >
          {q}
        </span>
        <ChevronDown
          size={20}
          style={{
            color: '#a855f7',
            flexShrink: 0,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      <div
        style={{
          height: open ? height : 0,
          overflow: 'hidden',
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div ref={bodyRef}>
          <p
            style={{
              fontSize: 15,
              color: '#94A3B8',
              lineHeight: 1.8,
              margin: 0,
              padding: '0 24px 22px',
            }}
          >
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #080010 100%)', padding: '100px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <ScrollReveal direction="up">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: 100,
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#a855f7',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              FAQ
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Le domande che stai già facendo.
            </h2>
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
