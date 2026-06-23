/**
 * LiveRiskDisplay — A compact real-time risk indicator
 * Used in the Nav or Hero to show "engine is live"
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getLatestCheckIn, getCheckInHistory } from '@/lib/storageEngine';
import { computeRisk } from '@/lib/riskEngine';
import { computeBaseline } from '@/lib/baselineEngine';

export default function LiveRiskDisplay() {
  const latest = getLatestCheckIn();
  const history = getCheckInHistory();
  const baseline = useMemo(() => computeBaseline(history), [history]);

  const risk = useMemo(() => {
    if (!latest) return null;
    return computeRisk({
      sleep_hours: latest.sleep_hours,
      meetings: latest.meetings,
      response_time_min: latest.response_time_min,
      breaks: latest.breaks,
      mood_score: latest.mood_score,
      task_switches: latest.task_switches,
    }, baseline);
  }, [latest, baseline]);

  if (!risk) return null;

  const tierColors = {
    WATCHING: '#7fd9b8',
    ELEVATED: '#ff9b6a',
    CRITICAL: '#ff6b8a',
  };

  const color = tierColors[risk.tier];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1 rounded-full"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ background: color }}
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs font-mono" style={{ color }}>
        {Math.round(risk.risk_index)}
      </span>
      <span className="text-[10px] text-star-faint">
        {risk.tier}
      </span>
    </motion.div>
  );
}
