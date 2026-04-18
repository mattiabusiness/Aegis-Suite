'use client';

// ============================================================================
// AEGIS BEAUTY - useNotifications
// Polls /api/notifications/inbox every 30s and exposes mark-as-read helpers.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { HeaderNotification } from '@aegis/ui';

// ============================================================================
// INTERNAL TYPES
// ============================================================================

interface RawNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
  data: { url?: string } | null;
}

// ============================================================================
// HELPERS
// ============================================================================

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Adesso';
  if (mins < 60) return `${mins} min fa`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'ora' : 'ore'} fa`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'giorno' : 'giorni'} fa`;
}

function toHeaderNotification(n: RawNotification): HeaderNotification & { url?: string } {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    time: timeAgo(n.created_at),
    read: n.read,
    type: (n.type as HeaderNotification['type']) ?? 'info',
    url: n.data?.url,
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useNotifications() {
  const [notifications, setNotifications] = useState<(HeaderNotification & { url?: string })[]>([]);
  const isFetching = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await fetch('/api/notifications/inbox', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as RawNotification[];
      setNotifications(data.map(toHeaderNotification));
    } catch {
      // silent fail — no connectivity or auth issue
    } finally {
      isFetching.current = false;
    }
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark specific notifications as read (optimistic update)
  const markRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    setNotifications(prev =>
      prev.map(n => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
    try {
      await fetch('/api/notifications/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } catch {
      // silent fail
    }
  }, []);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      // silent fail
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead };
}
