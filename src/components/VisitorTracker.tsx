'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function VisitorTracker() {
  const pathname = usePathname();
  const { token } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid re-tracking identical path on immediate re-renders
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    // Retrieve or initialize unique anonymous session identifier
    let sessionId = '';
    try {
      if (typeof window !== 'undefined') {
        sessionId = localStorage.getItem('onwear_visitor_session') || '';
        if (!sessionId) {
          sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
          localStorage.setItem('onwear_visitor_session', sessionId);
        }
      }
    } catch {
      sessionId = 'sess_temp_' + Date.now();
    }

    // Fire non-blocking beacon / fetch to log visit
    const track = async () => {
      try {
        await fetch(`${API_URL}/analytics/track-visit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({
            sessionId,
            path: pathname || '/'
          })
        });
      } catch {
        // Silently ignore tracking failures to ensure zero UX impact
      }
    };

    track();
  }, [pathname, token]);

  return null;
}
