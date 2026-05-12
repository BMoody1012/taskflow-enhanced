
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Clock, User, Type, PlusCircle } from 'lucide-react';
import { Language, RecurrenceType } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskFormProps {
  lang: Language;
  onClose?: () => void;
  onSubmit: (task: { title: string; owner: string; dueDate: string; recurrence: RecurrenceType; status: 'todo' }) => void;
  isInline?: boolean;
}

export function TaskForm({ lang, onClose, onSubmit, isInline = false }: TaskFormProps) {
  const { t, isRtl } = useI18n(lang);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !owner) return;

    const dueDate = new Date(`${date}T${time}`).toISOString();
    onSubmit({ title, owner, dueDate, recurrence, status: 'todo' });
    setTitle('');
    setOwner('');
    setRecurrence('none');
    if (onClose) onClose();
  };

  /* ── shared input style using design tokens ── */
  const inputCls = [
    "w-full px-3 py-2 rounded-xl text-sm font-medium outline-none transition-all",
    "border focus:border-[var(--brand)]",
    "bg-[var(--bg-base)] border-[var(--border)]",
    "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
    "[color-scheme:dark]",
  ].join(' ');

  const labelCls =
    "text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5 mb-1 text-[var(--text-muted)]";

  const formContent = (
    <div
      className={cn(
        "flex flex-col md:flex-row overflow-hidden",
        "border border-[var(--border)]",
        "bg-[var(--bg-surface)]",
        isInline
          ? "rounded-[1.5rem] w-full"
          : "w-full max-w-3xl rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      )}
    >
      {/* ── Left Side: Form ── */}
      <div
        className={cn(
          "flex-[1.5] p-5 md:p-6",
          "border-b md:border-b-0 md:border-r border-[var(--border)]",
          "bg-[var(--bg-surface)]",
          isInline && "flex-none w-full border-r-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black tracking-tight text-[var(--text-primary)]">
            {t.addTask}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full transition-colors hover:bg-[var(--bg-base)]"
            >
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Task Title */}
          <div>
            <label className={labelCls}>
              <Type className="w-3 h-3 opacity-60" /> {t.taskTitle}
            </label>
            <input
              required
              className={inputCls}
              placeholder={t.taskTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Task Owner */}
          <div>
            <label className={labelCls}>
              <User className="w-3 h-3 opacity-60" /> {t.taskOwner}
            </label>
            <input
              className={inputCls}
              placeholder={t.taskOwner}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          {/* Due Date & Time – side by side */}
          <div>
            <label className={labelCls}>
              <Calendar className="w-3 h-3 opacity-60" /> {t.dueTime}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                required
                className={cn(inputCls, "flex-1")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="time"
                required
                className={cn(inputCls, "flex-1")}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className={labelCls}>
              <Clock className="w-3 h-3 opacity-60" /> {t.recurrence}
            </label>
            <select
              className={cn(inputCls, "cursor-pointer appearance-none")}
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
            >
              <option value="none">{t.none}</option>
              <option value="daily">{t.daily}</option>
              <option value="weekly">{t.weekly}</option>
              <option value="monthly">{t.monthly}</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]"
              >
                {t.cancel}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 hover:-translate-y-0.5"
              style={{
                background: 'var(--brand)',
                color: '#fff',
                boxShadow: '0 8px 24px var(--brand-glow)',
              }}
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>

      {/* ── Right Side: Decorative ── */}
      {!isInline && (
        <div
          className="hidden md:flex flex-1 p-8 flex-col items-center justify-center text-center relative overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, var(--brand-glow), transparent)' }}
          />
          <div className="z-10 space-y-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto rotate-12 shadow-xl"
              style={{
                background: 'var(--brand-glow)',
                border: '1px solid var(--border-hover)',
              }}
            >
              <PlusCircle className="w-7 h-7 -rotate-12" style={{ color: 'var(--brand)' }} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">{t.newTask}</h3>
              <p className="text-[11px] max-w-[150px] leading-relaxed mx-auto text-[var(--text-secondary)]">
                {t.newTaskSubtitle}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full transition-colors hover:bg-[var(--bg-surface)]"
            >
              <X className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (isInline) return formContent;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-3xl"
      >
        {formContent}
      </motion.div>
    </div>
  );
}
