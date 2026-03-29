// ============================================================================
// AEGIS BEAUTY - VIDEO SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/VideoSection.tsx
// ============================================================================

import { Play } from 'lucide-react';

const videoId = process.env.NEXT_PUBLIC_VIDEO_ID;

export function VideoSection() {
  return (
    <section style={{ backgroundColor: '#0F0F18', padding: '80px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(124,58,237,0.25)',
            boxShadow: '0 0 60px rgba(124,58,237,0.12)',
          }}
        >
          {videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="Aegis Beauty — Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                background: 'linear-gradient(135deg, #0D0D18 0%, #13101F 100%)',
              }}
            >
              {/* Play button */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(124,58,237,0.15)',
                  border: '2px solid rgba(168,85,247,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(124,58,237,0.2)',
                }}
              >
                <Play size={28} color="#a855f7" fill="rgba(168,85,247,0.3)" style={{ marginLeft: 4 }} />
              </div>
              <p style={{ color: '#64748B', fontSize: 15, margin: 0, textAlign: 'center' }}>
                Video in arrivo — Scopri Aegis Beauty in azione
              </p>
            </div>
          )}

          {/* Shimmer border animation */}
          {!videoId && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: -1,
                borderRadius: 20,
                background: 'transparent',
                border: '1px solid transparent',
                backgroundClip: 'padding-box',
                animation: 'shimmerBorder 3s linear infinite',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmerBorder {
          0% { box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.05); }
          50% { box-shadow: 0 0 0 1px rgba(168,85,247,0.4), 0 0 40px rgba(124,58,237,0.15); }
          100% { box-shadow: 0 0 0 1px rgba(124,58,237,0.15), 0 0 20px rgba(124,58,237,0.05); }
        }
      `}</style>
    </section>
  );
}
