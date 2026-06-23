/**
 * CalendarSignalCard.tsx
 * Displays real Google Calendar data pulled live via OAuth.
 * This is the "working API integration" that Arena flagged as missing.
 *
 * Usage — drop anywhere in your app:
 *   import CalendarSignalCard from '@/components/custom/CalendarSignalCard';
 *   <CalendarSignalCard />
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wifi, WifiOff, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

function DensityBar({ score }: { score: number }) {
  const color =
    score < 35 ? '#7fd9b8'   // green — normal
    : score < 65 ? '#ff9b6a' // amber — watching
    : '#f87171';             // red — elevated

  return (
    <div className="w-full bg-cosmos-void/60 rounded-full h-2 mt-1">
      <motion.div
        className="h-2 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function CalendarSignalCard() {
  const { status, signal, error, connect, disconnect } = useGoogleCalendar();

  return (
    <div className="glass-strong rounded p-6 border border-star-bright/10 hover:border-amber-dawn/30 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-amber-dawn/10 flex items-center justify-center">
            <Calendar className="text-amber-dawn" size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-extralight uppercase tracking-wide-cosmic text-amber-dawn">
              Calendar Density
            </p>
            <p className="text-xs font-extralight text-star-faint">
              Live · Google Calendar API
            </p>
          </div>
        </div>
        {/* Connection status badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extralight
          ${status === 'connected' ? 'bg-aurora-green/10 text-aurora-green' :
            status === 'connecting' ? 'bg-amber-dawn/10 text-amber-dawn' :
            status === 'error' ? 'bg-rose-400/10 text-rose-400' :
            'bg-star-bright/5 text-star-faint'}`}
        >
          {status === 'connected' && <><CheckCircle size={10} />&nbsp;Live</>}
          {status === 'connecting' && <><Loader size={10} className="animate-spin" />&nbsp;Connecting</>}
          {status === 'error' && <><AlertCircle size={10} />&nbsp;Error</>}
          {status === 'idle' && <><WifiOff size={10} />&nbsp;Not connected</>}
        </div>
      </div>

      {/* Idle state — connect prompt */}
      {status === 'idle' && (
        <div className="text-center py-6">
          <p className="text-base font-extralight text-star-dim mb-5 leading-relaxed">
            Connect your Google Calendar to see real behavioral signal data from your actual schedule.
          </p>
          <button
            onClick={connect}
            className="inline-flex items-center gap-2 bg-amber-dawn text-cosmos-void text-sm font-extralight px-5 py-2.5 hover:bg-amber-warm transition-colors duration-300"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)', paddingRight: '24px' }}
          >
            <Wifi size={14} strokeWidth={1.5} />
            Connect Google Calendar
          </button>
          <p className="text-xs font-extralight text-star-faint mt-3">
            Read-only access · No content read · Only meeting counts and timing
          </p>
        </div>
      )}

      {/* Connecting spinner */}
      {status === 'connecting' && (
        <div className="text-center py-8">
          <Loader className="text-amber-dawn animate-spin mx-auto mb-3" size={24} strokeWidth={1.5} />
          <p className="text-sm font-extralight text-star-dim">Waiting for Google sign-in…</p>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="py-4">
          <p className="text-sm font-extralight text-rose-400 mb-4">{error}</p>
          <button
            onClick={connect}
            className="text-sm font-extralight text-amber-dawn hover:underline"
          >
            Try again →
          </button>
        </div>
      )}

      {/* Connected — show real data */}
      {status === 'connected' && signal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Density score */}
          <div className="mb-5">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-extralight uppercase tracking-wide-cosmic text-star-faint">
                Calendar Density Score
              </span>
              <span className={`text-2xl font-extralight font-display
                ${signal.calendarDensityScore < 35 ? 'text-aurora-green'
                  : signal.calendarDensityScore < 65 ? 'text-amber-dawn'
                  : 'text-rose-400'}`}>
                {signal.calendarDensityScore}
              </span>
            </div>
            <DensityBar score={signal.calendarDensityScore} />
            <p className="text-xs font-extralight text-star-faint mt-1">
              {signal.calendarDensityScore < 35 ? '● Normal — schedule looks manageable'
                : signal.calendarDensityScore < 65 ? '● Watching — density is elevated'
                : '● Elevated — high cognitive load detected'}
            </p>
          </div>

          {/* Raw metrics grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Meetings today', value: signal.meetingCountToday },
              { label: 'Meetings this week', value: signal.meetingCountThisWeek },
              { label: 'Weekend meetings', value: signal.weekendMeetings,
                warn: signal.weekendMeetings > 0 },
              { label: 'Avg duration (min)', value: signal.avgMeetingDurationMin },
              { label: 'Longest break (min)', value: signal.longestGapMin,
                warn: signal.longestGapMin < 30 },
            ].map((m, i) => (
              <div key={i} className="bg-cosmos-void/40 rounded p-3">
                <p className="text-xs font-extralight text-star-faint mb-0.5">{m.label}</p>
                <p className={`text-xl font-extralight font-display
                  ${m.warn ? 'text-amber-dawn' : 'text-star-bright'}`}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Recent events preview */}
          <div className="border-t border-star-bright/5 pt-4">
            <p className="text-xs font-extralight uppercase tracking-wide-cosmic text-star-faint mb-3">
              This week · {signal.rawEvents.length} events
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {signal.rawEvents.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between">
                  <p className="text-xs font-extralight text-star-dim truncate flex-1 pr-2">
                    {ev.summary}
                  </p>
                  <p className="text-xs font-extralight text-star-faint flex-shrink-0">
                    {ev.durationMin}m
                  </p>
                </div>
              ))}
              {signal.rawEvents.length > 5 && (
                <p className="text-xs font-extralight text-star-faint">
                  +{signal.rawEvents.length - 5} more
                </p>
              )}
            </div>
          </div>

          {/* Disconnect */}
          <button
            onClick={disconnect}
            className="text-xs font-extralight text-star-faint hover:text-amber-dawn transition-colors mt-4"
          >
            Disconnect calendar →
          </button>
        </motion.div>
      )}
    </div>
  );
}
