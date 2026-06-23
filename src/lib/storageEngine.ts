/**
 * SilentCrisis AI — Data Persistence Layer
 *
 * Stores check-in data in localStorage.
 * In production this would be encrypted + synced to a backend.
 * For the hackathon MVP, localStorage demonstrates the data flow.
 */

import type { SignalInput, RiskResult } from './riskEngine';

const STORAGE_KEYS = {
  CHECKINS: 'sc_checkins',
  RISK_HISTORY: 'sc_risk_history',
  INTERVENTIONS: 'sc_interventions',
  USER_PROFILE: 'sc_user_profile',
};

// ─── Check-In Storage ────────────────────────────────────────────

export interface StoredCheckIn extends SignalInput {
  id: string;
  timestamp: string;
  date: string;         // YYYY-MM-DD
  mood_text: string;    // raw text input (for sentiment display)
}

export function saveCheckIn(checkIn: StoredCheckIn): void {
  const existing = getCheckIns();

  // Prevent duplicate entries for the same day
  const todayIndex = existing.findIndex(c => c.date === checkIn.date);
  if (todayIndex >= 0) {
    existing[todayIndex] = checkIn; // overwrite today's entry
  } else {
    existing.push(checkIn);
  }

  // Keep last 90 days (TTL policy from the PDF)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const filtered = existing.filter(c =>
    new Date(c.timestamp) > ninetyDaysAgo
  );

  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(filtered));
}

export function getCheckIns(): StoredCheckIn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCheckInHistory(): SignalInput[] {
  return getCheckIns().map(({ sleep_hours, meetings, response_time_min, breaks, mood_score, task_switches }) => ({
    sleep_hours, meetings, response_time_min, breaks, mood_score, task_switches
  }));
}

export function getLatestCheckIn(): StoredCheckIn | null {
  const all = getCheckIns();
  return all.length > 0 ? all[all.length - 1] : null;
}

// ─── Risk History Storage ────────────────────────────────────────

export interface StoredRiskResult {
  date: string;
  risk_index: number;
  tier: string;
  convergence_count: number;
  explanation: string;
  intervention_id: string;
  timestamp: string;
}

export function saveRiskResult(date: string, result: RiskResult, interventionId: string): void {
  const existing = getRiskHistory();

  const stored: StoredRiskResult = {
    date,
    risk_index: result.risk_index,
    tier: result.tier,
    convergence_count: result.convergence_count,
    explanation: result.explanation,
    intervention_id: interventionId,
    timestamp: result.timestamp,
  };

  // Prevent duplicate for same day
  const todayIndex = existing.findIndex(r => r.date === date);
  if (todayIndex >= 0) {
    existing[todayIndex] = stored;
  } else {
    existing.push(stored);
  }

  localStorage.setItem(STORAGE_KEYS.RISK_HISTORY, JSON.stringify(existing));
}

export function getRiskHistory(): StoredRiskResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RISK_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── Intervention History ────────────────────────────────────────

export function saveInterventionUsed(interventionId: string): void {
  const existing = getInterventionHistory();
  existing.push({ id: interventionId, timestamp: new Date().toISOString() });
  // Keep last 30
  const trimmed = existing.slice(-30);
  localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(trimmed));
}

export function getInterventionHistory(): { id: string; timestamp: string }[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVENTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ─── User Profile ────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  startDate: string;
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Clear All Data ──────────────────────────────────────────────

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// ─── Seed Demo Data ──────────────────────────────────────────────
// Pre-populate with 17 days of realistic data showing decline → intervention → recovery

export function seedDemoData(): void {
  if (getCheckIns().length > 0) return; // don't overwrite existing data

  const demoData: Omit<StoredCheckIn, 'id'>[] = [
    // Days 1-5: Healthy baseline
    { date: '2026-06-05', timestamp: '2026-06-05T22:00:00Z', sleep_hours: 7.5, meetings: 3, response_time_min: 12, breaks: 4, mood_score: 78, task_switches: 10, mood_text: 'Good day, feeling balanced and productive' },
    { date: '2026-06-06', timestamp: '2026-06-06T22:00:00Z', sleep_hours: 7.2, meetings: 4, response_time_min: 14, breaks: 3, mood_score: 75, task_switches: 11, mood_text: 'Pretty good day overall, had some nice moments' },
    { date: '2026-06-07', timestamp: '2026-06-07T22:00:00Z', sleep_hours: 7.8, meetings: 3, response_time_min: 10, breaks: 4, mood_score: 80, task_switches: 9, mood_text: 'Great sleep last night, feeling refreshed and clear' },
    { date: '2026-06-08', timestamp: '2026-06-08T22:00:00Z', sleep_hours: 7.0, meetings: 5, response_time_min: 15, breaks: 3, mood_score: 72, task_switches: 12, mood_text: 'Busy but manageable, looking forward to the weekend' },
    { date: '2026-06-09', timestamp: '2026-06-09T22:00:00Z', sleep_hours: 7.4, meetings: 2, response_time_min: 11, breaks: 4, mood_score: 76, task_switches: 8, mood_text: 'Relaxed day, caught up on things' },

    // Days 6-9: Gradual decline begins
    { date: '2026-06-10', timestamp: '2026-06-10T22:00:00Z', sleep_hours: 6.8, meetings: 5, response_time_min: 18, breaks: 3, mood_score: 68, task_switches: 14, mood_text: 'Tired today, lots of meetings draining my energy' },
    { date: '2026-06-11', timestamp: '2026-06-11T22:00:00Z', sleep_hours: 6.5, meetings: 6, response_time_min: 22, breaks: 2, mood_score: 62, task_switches: 16, mood_text: 'Struggling to keep up, feeling behind on everything' },
    { date: '2026-06-12', timestamp: '2026-06-12T22:00:00Z', sleep_hours: 6.0, meetings: 7, response_time_min: 28, breaks: 2, mood_score: 55, task_switches: 18, mood_text: 'Exhausted and overwhelmed, cant focus on anything properly' },
    { date: '2026-06-13', timestamp: '2026-06-13T22:00:00Z', sleep_hours: 5.5, meetings: 8, response_time_min: 35, breaks: 1, mood_score: 48, task_switches: 20, mood_text: 'Really bad day. Everything feels like too much. Drained and hopeless.' },

    // Day 10: Intervention delivered (lowest point)
    { date: '2026-06-14', timestamp: '2026-06-14T22:00:00Z', sleep_hours: 5.2, meetings: 7, response_time_min: 40, breaks: 1, mood_score: 42, task_switches: 22, mood_text: 'Miserable. Barely sleeping. Calendar is a nightmare. Intervention helped a bit.' },

    // Days 11-13: Gradual recovery
    { date: '2026-06-15', timestamp: '2026-06-15T22:00:00Z', sleep_hours: 5.8, meetings: 5, response_time_min: 32, breaks: 2, mood_score: 50, task_switches: 18, mood_text: 'Used the breathing exercise. Slightly better. Protected some calendar time.' },
    { date: '2026-06-16', timestamp: '2026-06-16T22:00:00Z', sleep_hours: 6.2, meetings: 4, response_time_min: 25, breaks: 3, mood_score: 58, task_switches: 15, mood_text: 'Better sleep. Declined two meetings. Starting to feel lighter.' },
    { date: '2026-06-17', timestamp: '2026-06-17T22:00:00Z', sleep_hours: 6.8, meetings: 3, response_time_min: 20, breaks: 3, mood_score: 65, task_switches: 13, mood_text: 'Good progress. Connected with a friend. Feeling more hopeful.' },

    // Days 14-17: Recovery continues
    { date: '2026-06-18', timestamp: '2026-06-18T22:00:00Z', sleep_hours: 7.0, meetings: 3, response_time_min: 16, breaks: 4, mood_score: 70, task_switches: 11, mood_text: 'Productive and calm day. Sleep is getting back to normal.' },
    { date: '2026-06-19', timestamp: '2026-06-19T22:00:00Z', sleep_hours: 7.3, meetings: 4, response_time_min: 14, breaks: 3, mood_score: 74, task_switches: 10, mood_text: 'Feeling much better. Grateful for the early warning.' },
    { date: '2026-06-20', timestamp: '2026-06-20T22:00:00Z', sleep_hours: 7.5, meetings: 3, response_time_min: 12, breaks: 4, mood_score: 78, task_switches: 9, mood_text: 'Great day. Energy is back. The pattern caught it early.' },
    { date: '2026-06-21', timestamp: '2026-06-21T22:00:00Z', sleep_hours: 7.4, meetings: 3, response_time_min: 13, breaks: 4, mood_score: 76, task_switches: 10, mood_text: 'Stable, balanced, and aware. The quiet watch works.' },
  ];

  const checkIns: StoredCheckIn[] = demoData.map((d, i) => ({
    ...d,
    id: `demo-${i}`,
  }));

  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns));

  // Save a user profile for the demo
  saveUserProfile({ name: 'Demo User', startDate: '2026-06-05' });
}
