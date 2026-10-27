'use client';

import { useState, useEffect } from 'react';

export interface ActiveSessionData {
  sessionName: string;
  sessionId: string;
  term: 'first' | 'second' | 'third';
  termNumber: 1 | 2 | 3;
  termName: string;
  resultsReleased: boolean;
  allSessions: string[];
  loading: boolean;
  error?: string;
}

const DEFAULT_SESSION: ActiveSessionData = {
  sessionName: '2025/2026',
  sessionId: 'default',
  term: 'first',
  termNumber: 1,
  termName: 'First Term',
  resultsReleased: false,
  allSessions: ['2025/2026', '2024/2025'],
  loading: true,
};

export function useActiveSession(): ActiveSessionData {
  const [data, setData] = useState<ActiveSessionData>(DEFAULT_SESSION);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/sessions/active')
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;
        if (res.success) {
          setData({
            sessionName: res.sessionName || '2025/2026',
            sessionId: res.sessionId || 'default',
            term: res.term || 'first',
            termNumber: res.termNumber || 1,
            termName: res.termName || 'First Term',
            resultsReleased: !!res.resultsReleased,
            allSessions: res.allSessions && res.allSessions.length > 0 ? res.allSessions : ['2025/2026'],
            loading: false,
          });
        } else {
          setData((prev) => ({ ...prev, loading: false, error: res.error }));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setData((prev) => ({ ...prev, loading: false, error: err.message }));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
