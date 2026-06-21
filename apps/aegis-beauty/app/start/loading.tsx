// ============================================================================
// AEGIS BEAUTY - /start loading (app entry splash)
// Mostrato istantaneamente mentre /start decide il redirect (auth + query).
// Sostituisce la schermata di caricamento "spoglia" del lancio PWA.
// ============================================================================

export default function StartLoading() {
  return (
    <div className="aegis-splash">
      <style>{`
        @keyframes aegisFade {
          0%   { opacity: 0; transform: translateY(14px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aegisPulse {
          0%, 100% { transform: scale(1);    filter: drop-shadow(0 10px 36px rgba(168,85,247,0.40)); }
          50%      { transform: scale(1.045); filter: drop-shadow(0 14px 52px rgba(168,85,247,0.62)); }
        }
        @keyframes aegisDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%           { opacity: 1;    transform: scale(1); }
        }
        .aegis-splash {
          position: fixed; inset: 0; z-index: 60;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 0;
          background:
            radial-gradient(120% 80% at 50% 28%, rgba(124,58,237,0.30), transparent 60%),
            radial-gradient(100% 60% at 50% 102%, rgba(168,85,247,0.16), transparent 72%),
            #0b0f1a;
          padding: 24px;
        }
        .aegis-splash__inner {
          display: flex; flex-direction: column; align-items: center;
          animation: aegisFade 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .aegis-splash__shield {
          width: 124px; height: auto; display: block;
          animation: aegisPulse 2.4s ease-in-out infinite;
        }
        .aegis-splash__brand {
          margin-top: 26px; font-size: 30px; line-height: 1;
          font-weight: 700; letter-spacing: 0.22em;
          color: #ffffff; text-indent: 0.22em;
        }
        .aegis-splash__sub {
          margin-top: 8px; font-size: 12px; font-weight: 500;
          letter-spacing: 0.54em; text-indent: 0.54em;
          color: rgba(216,196,247,0.82); text-transform: uppercase;
        }
        .aegis-splash__slogan {
          margin-top: 22px; font-size: 14px; font-weight: 400;
          letter-spacing: 0.01em; color: rgba(216,196,247,0.55);
        }
        .aegis-splash__dots {
          display: flex; gap: 7px; margin-top: 40px;
        }
        .aegis-splash__dots span {
          width: 7px; height: 7px; border-radius: 9999px;
          background: #a855f7; animation: aegisDot 1.4s ease-in-out infinite;
        }
        .aegis-splash__dots span:nth-child(2) { animation-delay: 0.18s; }
        .aegis-splash__dots span:nth-child(3) { animation-delay: 0.36s; }
      `}</style>

      <div className="aegis-splash__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-shield.png?v=1" alt="Aegis Beauty" className="aegis-splash__shield" />
        <div className="aegis-splash__brand">AEGIS</div>
        <div className="aegis-splash__sub">Beauty</div>
        <div className="aegis-splash__slogan">Il tuo salone, sempre con te</div>
        <div className="aegis-splash__dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
