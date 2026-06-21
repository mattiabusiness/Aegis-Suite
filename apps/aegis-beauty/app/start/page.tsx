'use client';

// ============================================================================
// AEGIS BEAUTY - /start (PWA start_url)
// Mostra la splash brandizzata e poi reindirizza al posto giusto.
// Client-side di proposito: un redirect server-side (307) non farebbe mai
// vedere la splash al lancio della PWA.
// ============================================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppSplash } from '@/components/AppSplash';

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Risolvi la destinazione + tieni la splash visibile almeno ~1.8s
      // (così si gode l'animazione e copre lo splash statico dell'OS).
      const [url] = await Promise.all([
        fetch('/api/start', { cache: 'no-store' })
          .then((r) => r.json())
          .then((d) => (typeof d?.url === 'string' ? d.url : '/login'))
          .catch(() => '/login'),
        new Promise((res) => setTimeout(res, 1800)),
      ]);
      if (!cancelled) router.replace(url as string);
    })();
    return () => { cancelled = true; };
  }, [router]);

  return <AppSplash />;
}
