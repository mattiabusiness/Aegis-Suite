'use client';

import dynamic from 'next/dynamic';
import { mk } from './theme';

const Hero = dynamic(
  () => import('./Hero').then((m) => m.Hero),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '100vh', backgroundColor: mk.bg }} />
    ),
  }
);

export function HeroLoader() {
  return <Hero />;
}
