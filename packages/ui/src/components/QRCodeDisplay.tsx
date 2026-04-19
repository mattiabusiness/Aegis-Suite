// ============================================================================
// AEGIS SUITE - QR CODE DISPLAY COMPONENT (Perfected)
// File: packages/ui/src/components/QRCodeDisplay.tsx
// Premium glass modal, centered, animated, no scroll issues.
// ============================================================================

'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Link2, Check, X } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface QRCodeDisplayProps {
  /** URL to encode in QR code */
  value: string;
  /** Size in pixels */
  size?: number;
  /** Title above QR code */
  title?: string;
  /** Description below title */
  description?: string;
  /** Show copy URL button */
  showCopyButton?: boolean;
  /** Show download button */
  showDownloadButton?: boolean;
  /** Filename for download */
  downloadFilename?: string;
  /** Logo in center of QR (optional) */
  logo?: string;
  /** Custom class name */
  className?: string;
}

export interface QRCodeModalProps extends QRCodeDisplayProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
}

// ============================================================================
// QR CODE DISPLAY COMPONENT (inline, no modal)
// ============================================================================

export function QRCodeDisplay({
  value,
  size = 200,
  title,
  description,
  showCopyButton = true,
  showDownloadButton = true,
  downloadFilename = 'qrcode',
  logo,
  className = '',
}: QRCodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const qrRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement('input');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const link = document.createElement('a');
      link.download = `${downloadFilename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">{description}</p>
      )}

      {/* QR Code */}
      <div
        ref={qrRef}
        className="p-5 bg-white rounded-2xl"
        style={{
          border: '1px solid rgba(168,85,247,0.1)',
          boxShadow: '0 4px 24px rgba(147,51,234,0.06)',
        }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin={false}
          imageSettings={logo ? {
            src: logo,
            height: size * 0.2,
            width: size * 0.2,
            excavate: true,
          } : undefined}
        />
      </div>

      {/* URL display */}
      <div
        className="mt-4 w-full max-w-xs px-3 py-2 rounded-lg truncate text-center"
        style={{
          background: 'rgba(168,85,247,0.04)',
          border: '1px solid rgba(168,85,247,0.08)',
          color: '#6b21a8',
          fontSize: '0.78rem',
          fontFamily: 'monospace',
        }}
      >
        {value}
      </div>

      {/* Actions */}
      {(showCopyButton || showDownloadButton) && (
        <div className="flex items-center gap-2.5 mt-4">
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: copied ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                border: '1px solid transparent',
                boxShadow: copied ? '0 2px 8px rgba(16,185,129,0.25)' : '0 2px 8px rgba(147,51,234,0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              {copied ? 'Copiato!' : 'Copia link'}
            </button>
          )}
          {showDownloadButton && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: 'rgba(168,85,247,0.06)',
                color: '#9333ea',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
            >
              <Download className="w-4 h-4" />
              Scarica
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// QR CODE MODAL (fullscreen centered, glass, animated, portal)
// ============================================================================

export function QRCodeModal({
  isOpen,
  onClose,
  value,
  size = 220,
  title = 'QR Code',
  description,
  showCopyButton = true,
  showDownloadButton = true,
  downloadFilename = 'qrcode',
  logo,
}: QRCodeModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setClosing(false);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setMounted(true));
      });
    } else {
      setMounted(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setMounted(false);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  if (!isOpen && !closing) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Modal card */}
      <div
        className="relative w-full max-w-sm"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: '1px solid rgba(168,85,247,0.35)',
            boxShadow: mounted
              ? '0 24px 80px rgba(0,0,0,0.12), 0 8px 32px rgba(147,51,234,0.12), 0 0 0 1px rgba(168,85,247,0.2), 0 0 40px rgba(168,85,247,0.18), 0 0 80px rgba(147,51,234,0.08)'
              : '0 8px 32px rgba(0,0,0,0.08)',
            transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 200,
            height: 100,
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.1) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 rounded-xl z-10 outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          style={{
            color: 'rgba(0,0,0,0.3)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(0,0,0,0.6)';
            e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(0,0,0,0.3)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="px-6 pt-8 pb-7">
          <QRCodeDisplay
            value={value}
            size={size}
            title={title}
            description={description}
            showCopyButton={showCopyButton}
            showDownloadButton={showDownloadButton}
            downloadFilename={downloadFilename}
            logo={logo}
          />
        </div>

        {/* Bottom gradient line */}
        <div
          className="absolute bottom-0 left-6 right-6 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent)',
            borderRadius: '0 0 24px 24px',
          }}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}