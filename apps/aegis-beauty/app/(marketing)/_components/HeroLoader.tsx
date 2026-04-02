'use client';

import dynamic from 'next/dynamic';

const Hero = dynamic(
  () => import('./Hero').then((m) => m.Hero),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F' }} />
    ),
  }
);

export function HeroLoader() {
  return <Hero />;
}
