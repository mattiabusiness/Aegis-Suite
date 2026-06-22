// ============================================================================
// AEGIS BEAUTY - SECTION DIVIDER
// File: apps/aegis-beauty/app/(marketing)/_components/ui/SectionDivider.tsx
// Soft glowing hairline between sections
// ============================================================================

import { mk } from '../theme';

export function SectionDivider() {
  return (
    <div aria-hidden="true" style={{ position: 'relative', height: 1, backgroundColor: mk.bg }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          maxWidth: 1100,
          margin: '0 auto',
          background: `linear-gradient(90deg, transparent 0%, ${mk.purpleA(0.25)} 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}
