// ============================================================================
// AEGIS BEAUTY - SECTION DIVIDER
// File: apps/aegis-beauty/app/(marketing)/_components/ui/SectionDivider.tsx
// Soft glowing hairline between sections
// ============================================================================

export function SectionDivider() {
  return (
    <div aria-hidden="true" style={{ position: 'relative', height: 1, backgroundColor: '#0A0A0F' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          maxWidth: 1100,
          margin: '0 auto',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.35) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}
