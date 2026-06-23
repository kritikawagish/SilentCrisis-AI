/**
 * useGoogleCalendar.ts
 * Real Google Calendar API integration via OAuth 2.0 implicit flow.
 * No backend required — runs entirely in the browser.
 *
 * SETUP (one-time, 5 minutes):
 * 1. Go to https://console.cloud.google.com
 * 2. Create a project → Enable "Google Calendar API"
 * 3. Credentials → Create OAuth 2.0 Client ID → Web application
 * 4. Add http://localhost:5173 and https://silentcrisis-ai.vercel.app to Authorized JS origins
 * 5. Copy the Client ID into VITE_GOOGLE_CLIENT_ID in your .env file
 */

import { useState, useCallback } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export interface CalendarSignal {
  meetingCountToday: number;
  meetingCountThisWeek: number;
  weekendMeetings: number;
  avgMeetingDurationMin: number;
  longestGapMin: number;         // longest break between meetings today
  calendarDensityScore: number;  // 0-100, computed from above
  rawEvents: CalendarEvent[];
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  durationMin: number;
}

export type CalendarStatus = 'idle' | 'connecting' | 'connected' | 'error';

export function useGoogleCalendar() {
  const [status, setStatus] = useState<CalendarStatus>('idle');
  const [signal, setSignal] = useState<CalendarSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!CLIENT_ID) {
      setError('VITE_GOOGLE_CLIENT_ID not set. See setup instructions in useGoogleCalendar.ts');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setError(null);

    // OAuth 2.0 implicit grant — opens Google sign-in popup
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: 'token',
      scope: SCOPES,
      prompt: 'select_account',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    const popup = window.open(authUrl, 'google-auth', 'width=500,height=600,left=200,top=100');

    // Listen for the redirect with the access token
    const interval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(interval);
          setStatus('idle');
          return;
        }
        const url = popup.location.href;
        if (url.includes('access_token=')) {
          const hash = new URL(url).hash.replace('#', '');
          const tokenParams = new URLSearchParams(hash);
          const token = tokenParams.get('access_token');
          popup.close();
          clearInterval(interval);
          if (token) {
            setAccessToken(token);
            fetchCalendarData(token);
          }
        }
      } catch {
        // Cross-origin errors until redirect completes — ignore
      }
    }, 300);
  }, []);

  const fetchCalendarData = useCallback(async (token: string) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        new URLSearchParams({
          timeMin: startOfWeek.toISOString(),
          timeMax: endOfWeek.toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250',
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);
      const data = await res.json();

      const events: CalendarEvent[] = (data.items || [])
        .filter((e: any) => e.start?.dateTime) // only timed events, not all-day
        .map((e: any) => {
          const start = new Date(e.start.dateTime);
          const end = new Date(e.end.dateTime);
          const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);
          return {
            id: e.id,
            summary: e.summary || 'Untitled',
            start: e.start.dateTime,
            end: e.end.dateTime,
            durationMin,
          };
        });

      // Today's events
      const todayEvents = events.filter(e => {
        const d = new Date(e.start);
        return d >= startOfDay && d <= endOfDay;
      });

      // Weekend events this week
      const weekendEvents = events.filter(e => {
        const day = new Date(e.start).getDay();
        return day === 0 || day === 6;
      });

      // Average duration
      const totalMins = events.reduce((s, e) => s + e.durationMin, 0);
      const avgDurationMin = events.length ? Math.round(totalMins / events.length) : 0;

      // Longest gap between meetings today (proxy for breaks)
      let longestGapMin = 480; // default 8h if no meetings
      if (todayEvents.length >= 2) {
        const sorted = [...todayEvents].sort((a, b) =>
          new Date(a.start).getTime() - new Date(b.start).getTime()
        );
        longestGapMin = 0;
        for (let i = 1; i < sorted.length; i++) {
          const gapMs = new Date(sorted[i].start).getTime() - new Date(sorted[i - 1].end).getTime();
          longestGapMin = Math.max(longestGapMin, Math.round(gapMs / 60000));
        }
      }

      // Calendar density score (0-100)
      // High meetings + weekend work + short gaps = high score = high risk
      const densityScore = Math.min(100, Math.round(
        (events.length * 3) +
        (weekendEvents.length * 10) +
        (todayEvents.length * 5) +
        (avgDurationMin > 60 ? 15 : 0) +
        (longestGapMin < 30 ? 20 : 0)
      ));

      setSignal({
        meetingCountToday: todayEvents.length,
        meetingCountThisWeek: events.length,
        weekendMeetings: weekendEvents.length,
        avgMeetingDurationMin: avgDurationMin,
        longestGapMin,
        calendarDensityScore: densityScore,
        rawEvents: events,
      });
      setStatus('connected');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calendar data');
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus('idle');
    setSignal(null);
    setAccessToken(null);
    setError(null);
  }, []);

  return { status, signal, error, connect, disconnect };
}
