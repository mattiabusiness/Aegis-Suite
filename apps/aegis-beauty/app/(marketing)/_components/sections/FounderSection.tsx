'use client';

// ============================================================================
// AEGIS BEAUTY - FOUNDER SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/FounderSection.tsx
// ============================================================================

import { Linkedin } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

export function FounderSection() {
  return (
    <section id="founder" style={{ backgroundColor: '#0A0A0F', padding: '100px 24px', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <ScrollReveal>
          {/* Label */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
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
              }}
            >
              Chi sono
            </span>
          </div>

          {/* Card */}
          <div
            style={{
              padding: '40px 36px',
              borderRadius: 24,
              background: 'rgba(124,58,237,0.04)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,58,237,0.12)',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.07), 0 20px 40px rgba(0,0,0,0.4)',
              textAlign: 'center',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6b21a8, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 0 24px rgba(124,58,237,0.35)',
              }}
            >
              M
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px' }}>
              Mattia
            </h3>
            <p style={{ fontSize: 14, color: '#a855f7', fontWeight: 600, margin: '0 0 20px' }}>
              Fondatore, Aegis Group
            </p>

            <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.8, margin: '0 0 24px' }}>
              Sono Mattia, ho 16 anni e vado al liceo scientifico a Torino. Ho costruito Aegis Beauty da solo — ogni riga di codice, ogni decisione di prodotto, ogni documento legale. Non per dimostrare qualcosa, ma perché credevo che il problema dei saloni italiani meritasse una soluzione vera.
            </p>

            <p
              style={{
                fontSize: 13,
                color: '#475569',
                fontStyle: 'italic',
                lineHeight: 1.6,
                margin: '0 0 28px',
                padding: '16px',
                borderRadius: 10,
                background: 'rgba(124,58,237,0.05)',
                border: '1px solid rgba(124,58,237,0.1)',
              }}
            >
              Aegis Beauty è il primo prodotto di <span style={{ color: '#a855f7', fontWeight: 600 }}>Aegis Group</span> — la holding tecnologica che sto costruendo per trasformare settori tradizionali attraverso software moderno.
              <br />Questo è solo l&apos;inizio...
            </p>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/mattia-papa-9b1b523a7/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 10,
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#94A3B8',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
                e.currentTarget.style.color = '#a855f7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
