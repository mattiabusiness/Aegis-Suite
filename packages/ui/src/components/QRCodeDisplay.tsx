// ============================================================================
// AEGIS SUITE - QR CODE DISPLAY COMPONENT
// File: packages/ui/src/components/QRCodeDisplay.tsx
// Reusable QR code component for staff invites, customer booking links, etc.
// ============================================================================

'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, X } from 'lucide-react';
import { Button } from './ui/button';

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
// QR CODE DISPLAY COMPONENT
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create canvas from SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0);
      
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
        <p className="text-sm text-gray-500 mb-4 text-center">{description}</p>
      )}
      
      {/* QR Code */}
      <div 
        ref={qrRef}
        className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
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
      <div className="mt-4 w-full max-w-xs">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 truncate flex-1">{value}</span>
        </div>
      </div>

      {/* Actions */}
      {(showCopyButton || showDownloadButton) && (
        <div className="flex items-center gap-2 mt-3">
          {showCopyButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  Copiato!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copia link
                </>
              )}
            </Button>
          )}
          {showDownloadButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Scarica
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// QR CODE MODAL COMPONENT
// ============================================================================

export function QRCodeModal({
  isOpen,
  onClose,
  value,
  size = 250,
  title = 'QR Code',
  description,
  showCopyButton = true,
  showDownloadButton = true,
  downloadFilename = 'qrcode',
  logo,
}: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="px-6 py-8">
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
        </div>
      </div>
    </div>
  );
}