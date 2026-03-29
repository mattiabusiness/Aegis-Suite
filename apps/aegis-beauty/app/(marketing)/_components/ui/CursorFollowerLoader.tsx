'use client';

// Client wrapper to load CursorFollower with ssr:false
import dynamic from 'next/dynamic';

const CursorFollower = dynamic(
  () => import('./CursorFollower').then((m) => m.CursorFollower),
  { ssr: false }
);

export function CursorFollowerLoader() {
  return <CursorFollower />;
}
