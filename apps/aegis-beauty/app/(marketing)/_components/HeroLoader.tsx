'use client';

import dynamic from 'next/dynamic';

const Hero = dynamic(
  () => import('./Hero').then((m) => m.Hero),
  { ssr: false }
);

export function HeroLoader() {
  return <Hero />;
}
