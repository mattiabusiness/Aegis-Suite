// ============================================================================
// AEGIS SUITE - OVERVIEW PAGE COMPONENT (v2)
// File: packages/ui/src/components/dashboard/OverviewPage.tsx
// Generic, reusable overview/homepage for all verticals.
// ============================================================================

'use client';

import * as React from 'react';
import {
  ArrowRight,
  Link2,
  QrCode,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { QRCodeModal } from '../QRCodeDisplay';

// ============================================================================
// TYPES
// ============================================================================

export interface OverviewStat {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
}

export interface OverviewQuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface OverviewSection {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  linkLabel: string;
  onLinkClick: () => void;
  linkColor: string;
  children: React.ReactNode;
}

export interface OverviewSummaryItem {
  label: string;
  value: string | number;
  accent?: boolean;
}

export interface OverviewPageProps {
  greeting: string;
  businessName: string;
  dateString: string;
  stats: OverviewStat[];
  sections: OverviewSection[];
  quickActions: OverviewQuickAction[];
  summaryItems?: OverviewSummaryItem[];
  summaryTitle?: string;
  summarySubtitle?: string;
  businessSlug?: string;
  businessUrl?: string;
  qrTitle?: string;
  className?: string;
}

// ============================================================================
// GLASS STAT CARD
// ============================================================================

function GlassStat({ stat, delay }: { stat: OverviewStat; delay: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
        animation: `ov-card-in 0.4s ease-out ${delay}s both`,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08), 0 8px 24px rgba(147,51,234,0.15)';
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)';
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
      }}
    >
      {/* Subtle gradient accent blob */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.07]"
        style={{ background: stat.gradient }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{stat.title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5 tracking-tight">{stat.value}</p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex-shrink-0"
          style={{ background: stat.gradient, opacity: 0.12, borderRadius: 14 }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// QUICK ACTION
// ============================================================================

function QuickActionItem({ action, delay }: { action: OverviewQuickAction; delay: number }) {
  const Icon = action.icon;

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer"
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
        animation: `ov-card-in 0.4s ease-out ${delay}s both`,
        transition: 'all 0.2s ease',
      }}
      onClick={action.onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(147,51,234,0.08), 0 0 0 3px rgba(168,85,247,0.06)';
        e.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.01)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') action.onClick(); }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(168,85,247,0.06)' }}
      >
        <Icon className="w-5 h-5" style={{ color: '#9333ea' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{action.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{action.description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </div>
  );
}

// ============================================================================
// SECTION CARD
// ============================================================================

function SectionCard({ section, delay, grow }: { section: OverviewSection; delay: number; grow?: boolean }) {
  const Icon = section.icon;

  return (
    <div
      className={`rounded-2xl p-6${grow ? ' flex flex-col flex-1' : ''}`}
      style={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
        animation: `ov-card-in 0.4s ease-out ${delay}s both`,
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: section.iconBg }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ color: section.iconColor }} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
            <p className="text-xs text-gray-400">{section.subtitle}</p>
          </div>
        </div>
        {section.linkLabel ? (
          <button
            className="text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ color: section.linkColor, transition: 'background 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${section.linkColor}0d`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            onClick={section.onLinkClick}
          >
            {section.linkLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {section.children}
    </div>
  );
}

// ============================================================================
// QUICK LINK CARD
// ============================================================================

function QuickLinkCard({ slug, onQrClick }: { slug: string; onQrClick: () => void }) {
  const [copied, setCopied] = React.useState(false);
  const url = `aegisbeauty.app/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = `https://${url}`;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: '1px solid rgba(168,85,247,0.1)',
        animation: 'ov-card-in 0.4s ease-out 0.4s both',
      }}
    >
      <div
        className="px-5 py-4"
        style={{
          background: 'linear-gradient(145deg, #3b0764 0%, #581c87 30%, #6b21a8 60%, #7c3aed 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-white/70" />
          <p className="text-white/90 text-sm font-semibold">Il tuo link</p>
        </div>
        <p className="text-white/50 text-xs mt-0.5">Condividilo con i tuoi clienti</p>
      </div>
      <div className="p-4 bg-white space-y-3">
        {/* URL display */}
        <div
          className="px-3 py-2.5 rounded-lg text-sm font-mono truncate"
          style={{
            background: 'rgba(168,85,247,0.04)',
            border: '1px solid rgba(168,85,247,0.08)',
            color: '#6b21a8',
            fontSize: '0.8rem',
          }}
        >
          {url}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff',
              border: '1px solid transparent',
              boxShadow: '0 2px 8px rgba(5,150,105,0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {copied ? 'Copiato!' : 'Copia link'}
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'rgba(168,85,247,0.06)',
              color: '#9333ea',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
            onClick={onQrClick}
          >
            <QrCode className="w-4 h-4" />
            QR
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OverviewPage({
  greeting,
  businessName,
  dateString,
  stats,
  sections,
  quickActions,
  businessSlug,
  businessUrl,
  qrTitle,
  className = '',
}: OverviewPageProps) {
  const [qrOpen, setQrOpen] = React.useState(false);
  const fullUrl = businessUrl || (businessSlug ? `https://aegisbeauty.app/${businessSlug}` : '');

  return (
    <div className={`w-full ${className}`}>
      {/* ═══ Greeting ═══ */}
      <div
        className="mb-8"
        style={{ animation: 'ov-fade-in 0.5s ease-out both' }}
      >
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {greeting}!
        </h1>
        <p className="text-gray-500 mt-1">
          Ecco cosa succede oggi in{' '}
          <span className="font-medium text-gray-700">{businessName}</span>
          <span className="mx-2">·</span>
          <span className="text-gray-400">{dateString}</span>
        </p>
      </div>

      {/* ═══ Stats Grid ═══ */}
      <div className={`grid grid-cols-1 gap-4 mb-8 ${
        stats.length === 2 ? 'sm:grid-cols-2' :
        stats.length === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' :
        'sm:grid-cols-2 lg:grid-cols-4'
      }`}>
        {stats.map((stat, i) => (
          <GlassStat key={stat.title} stat={stat} delay={0.05 + i * 0.05} />
        ))}
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {sections.map((section, i) => (
            <SectionCard key={section.title} section={section} delay={0.25 + i * 0.1} grow={i === sections.length - 1} />
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,0,0,0.02)',
              animation: 'ov-card-in 0.4s ease-out 0.3s both',
            }}
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Azioni rapide</h3>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <QuickActionItem key={action.label} action={action} delay={0.35 + i * 0.05} />
              ))}
            </div>
          </div>

          {/* Quick link card */}
          {businessSlug && <QuickLinkCard slug={businessSlug} onQrClick={() => setQrOpen(true)} />}
        </div>
      </div>

      {/* QR Modal — at root level for proper fullscreen positioning */}
      {fullUrl && (
        <QRCodeModal
          isOpen={qrOpen}
          onClose={() => setQrOpen(false)}
          value={fullUrl}
          title={qrTitle || 'QR Code'}
          description="I clienti possono scansionarlo per prenotare"
          downloadFilename={`aegis-${businessSlug || 'qrcode'}`}
          size={220}
        />
      )}

      {/* ═══ Keyframes ═══ */}
      <style>{`
        @keyframes ov-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ov-card-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}