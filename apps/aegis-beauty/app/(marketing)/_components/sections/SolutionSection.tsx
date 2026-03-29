'use client';

// ============================================================================
// AEGIS BEAUTY - SOLUTION SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/SolutionSection.tsx
// ============================================================================

import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Smartphone,
  Bell,
} from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

const features = [
  {
    icon: Calendar,
    title: 'Prenotazioni senza caos.',
    description:
      'Calendario intelligente, disponibilità in tempo reale, nessun doppio appuntamento. I tuoi clienti prenotano quando vogliono. Tu trovi tutto già organizzato.',
  },
  {
    icon: Users,
    title: 'CRM che conosce i tuoi clienti.',
    description:
      'Nome, storico, preferenze, note del professionista. Ogni cliente ha la sua scheda completa. Non dimentichi più nulla — e loro lo sentono.',
  },
  {
    icon: BarChart3,
    title: 'Dati che guidano le decisioni.',
    description:
      'Quali servizi rendono di più. Quali ore sono sempre piene. Quanto vale ogni cliente nel tempo. Smetti di andare a sensazione — inizia a crescere con certezza.',
  },
  {
    icon: Settings,
    title: 'Staff gestito senza attriti.',
    description:
      'Permessi granulari per ogni collaboratrice, inviti via QR code, orari personalizzati. La tua squadra lavora in autonomia — senza toccare quello che non deve toccare.',
  },
  {
    icon: Smartphone,
    title: 'Il tuo brand. Non il nostro.',
    description:
      'Pagina prenotazione personalizzata con il nome e il brand del tuo salone. I tuoi clienti vedono te — non una piattaforma generica. White-label puro, zero commissioni.',
  },
  {
    icon: Bell,
    title: 'Promemoria automatici.',
    description:
      'Email e notifiche push prima di ogni appuntamento. I no-show calano. I clienti arrivano puntuali. Tu pensi al lavoro — non ai messaggi di reminder su WhatsApp.',
  },
];

export function SolutionSection() {
  return (
    <section id="solution" style={{ backgroundColor: '#0D0D16', padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
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
                marginBottom: 20,
              }}
            >
              Il Prodotto
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                margin: '0 0 16px',
                lineHeight: 1.2,
              }}
            >
              Un solo sistema. Tutto quello che serve.
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Progettato per i professionisti italiani della bellezza. Costruito per durare decenni.
            </p>
          </div>
        </ScrollReveal>

        {/* Features grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
          className="solution-grid"
        >
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <ScrollReveal key={i} delay={i * 80}>
                <div
                  style={{
                    padding: '28px 24px',
                    borderRadius: 16,
                    background: 'rgba(124,58,237,0.03)',
                    border: '1px solid rgba(124,58,237,0.1)',
                    transition: 'transform 0.25s, background 0.25s, border-color 0.25s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.background = 'rgba(124,58,237,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.22)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = 'rgba(124,58,237,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.1)';
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))',
                      border: '1px solid rgba(168,85,247,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={20} color="#a855f7" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                    {feat.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .solution-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 540px) { .solution-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
