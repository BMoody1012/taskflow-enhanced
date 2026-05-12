
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Clock } from 'lucide-react';
import { Task, Language } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';
import { addMinutes, addHours } from 'date-fns';

interface ReminderPopupProps {
  task: Task;
  lang: Language;
  onClose: () => void;
  onSnooze: (newDate: string) => void;
  onComplete: () => void;
}

export function ReminderPopup({ task, lang, onClose, onSnooze, onComplete }: ReminderPopupProps) {
  const { t, isRtl } = useI18n(lang);
  const [snoozeMode, setSnoozeMode] = useState<'min' | 'hour'>('min');

  const minuteOptions = [5, 15, 30, 60];
  const hourOptions = [1, 2, 4, 5];

  const handleSnooze = (val: number) => {
    const now = new Date();
    const newDate = snoozeMode === 'min' ? addMinutes(now, val) : addHours(now, val);
    onSnooze(newDate.toISOString());
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        className={cn(
          "w-full max-w-[340px] rounded-[2.5rem] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative overflow-hidden",
          isRtl && "text-right font-arabic"
        )}
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--brand)',
        }}
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, var(--brand), transparent)' }} />
        
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-1">
            <h3 className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {t.reminder}
            </h3>
            <p className="text-xs font-medium opacity-70" style={{ color: 'var(--brand)' }}>
              {task.title}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-glow)' }}>
            <Bell className="w-5 h-5 animate-bounce" style={{ color: 'var(--brand)' }} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3 h-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {t.snooze}
              </span>
            </div>
            
            <div className="p-1 rounded-2xl flex gap-1 mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setSnoozeMode('min')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all",
                  snoozeMode === 'min' 
                    ? "text-white shadow-md" 
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                style={{ background: snoozeMode === 'min' ? 'var(--brand)' : 'transparent' }}
              >
                {t.minutes}
              </button>
              <button
                onClick={() => setSnoozeMode('hour')}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all",
                  snoozeMode === 'hour' 
                    ? "text-white shadow-md" 
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                style={{ background: snoozeMode === 'hour' ? 'var(--brand)' : 'transparent' }}
              >
                {t.hours}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(snoozeMode === 'min' ? minuteOptions : hourOptions).map(val => (
                <button
                  key={val}
                  onClick={() => handleSnooze(val)}
                  className="py-3 rounded-xl text-xs font-bold transition-all active:scale-90"
                  style={{ 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              {t.cancel}
            </button>
            <button
              onClick={onComplete}
              className="flex-[2] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white rounded-2xl transition-all shadow-xl active:scale-95 hover:-translate-y-0.5"
              style={{ 
                background: 'var(--brand)',
                boxShadow: '0 8px 20px var(--brand-glow)'
              }}
            >
              {t.markDone}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
