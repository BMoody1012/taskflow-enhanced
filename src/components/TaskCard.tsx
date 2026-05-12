
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, Trash2, Clock, Pause, MoreVertical,
  Edit2, MessageSquare, X, PlusCircle, AlertCircle,
  Circle, Bell
} from 'lucide-react';
import { Task, Language, TaskStatus, RecurrenceType } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  lang: Language;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const STATUS_META = {
  todo:      { color: 'var(--status-todo)', bg: 'var(--status-todo-bg)', border: 'var(--status-todo-border)', gradient: 'var(--status-todo-glow)' },
  done:      { color: 'var(--status-done)', bg: 'var(--status-done-bg)', border: 'var(--status-done-border)', gradient: 'var(--status-done-glow)' },
  hold:      { color: 'var(--status-hold)', bg: 'var(--status-hold-bg)', border: 'var(--status-hold-border)', gradient: 'var(--status-hold-glow)' },
  cancelled: { color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)', border: 'var(--status-cancelled-border)', gradient: 'var(--status-cancelled-glow)' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, lang, onUpdate, onDelete }) => {
  const { t, isRtl } = useI18n(lang);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [holdReason, setHoldReason] = useState(task.holdReason || '');
  const [newComment, setNewComment] = useState('');
  const [editCommentIndex, setEditCommentIndex] = useState<number | null>(null);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [editTitle, setEditTitle] = useState(task.title);
  const [editOwner, setEditOwner] = useState(task.owner);
  const [editDate, setEditDate] = useState(format(new Date(task.dueDate), 'yyyy-MM-dd'));
  const [editTime, setEditTime] = useState(format(new Date(task.dueDate), 'HH:mm'));
  const [editRecurrence, setEditRecurrence] = useState<RecurrenceType>(task.recurrence || 'none');
  const [editHoldReason, setEditHoldReason] = useState(task.holdReason || '');
  const menuRef = useRef<HTMLDivElement>(null);
  const dateLocale = lang === 'ar' ? ar : enUS;
  const meta = STATUS_META[task.status];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateStatus = (status: TaskStatus) => {
    if (status === 'hold') setShowHoldModal(true);
    else onUpdate(task.id, { status, holdReason: undefined });
    setShowMenu(false);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onUpdate(task.id, {
      title: editTitle, owner: editOwner,
      dueDate: new Date(`${editDate}T${editTime}`).toISOString(),
      recurrence: editRecurrence,
      holdReason: editHoldReason || undefined,
      reminderTriggered: false
    });
    setShowEditModal(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onUpdate(task.id, { comments: [...(task.comments || []), newComment] });
    setNewComment('');
  };

  const handleUpdateComment = (index: number) => {
    if (!editCommentValue.trim()) return;
    const comments = [...(task.comments || [])];
    comments[index] = editCommentValue;
    onUpdate(task.id, { comments });
    setEditCommentIndex(null);
  };

  const handleApplyHold = () => {
    onUpdate(task.id, { status: 'hold', holdReason });
    setShowHoldModal(false);
  };

  const handleQuickReminder = (value: number, unit: 'min' | 'hour') => {
    const now = new Date();
    const newDueDate = new Date(now.getTime() + (unit === 'min' ? value * 60000 : value * 3600000));
    onUpdate(task.id, { dueDate: newDueDate.toISOString(), reminderTriggered: false });
  };

  const inputStyle = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  };

  return (
    <div className={cn("group relative", showMenu && "z-50")}>
      {/* ── Card ── */}
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative flex items-center gap-4 px-5 py-4 cursor-pointer rounded-2xl transition-all"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid var(--border)`,
          borderLeftWidth: isRtl ? 1 : 3,
          borderRightWidth: isRtl ? 3 : 1,
          borderLeftColor: isRtl ? 'var(--border)' : meta.color,
          borderRightColor: isRtl ? meta.color : 'var(--border)',
          boxShadow: `0 2px 12px rgba(0,0,0,0.08)`,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 24px ${meta.color}20, 0 2px 8px rgba(0,0,0,0.1)`; (e.currentTarget as HTMLDivElement).style.borderColor = meta.border; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.borderLeftColor = isRtl ? 'var(--border)' : meta.color; (e.currentTarget as HTMLDivElement).style.borderRightColor = isRtl ? meta.color : 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
      >
        {/* Decorative gradient glow */}
        <div className="absolute inset-0 pointer-events-none opacity-60 rounded-2xl" style={{
          background: isRtl
            ? `linear-gradient(to left, ${meta.gradient}, transparent 40%)`
            : `linear-gradient(to right, ${meta.gradient}, transparent 40%)`,
        }} />

        {/* Status dot with glow ring */}
        <div className="relative w-3 h-3 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: meta.color }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}60` }} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 relative">
          <h3 className={cn('text-sm font-semibold truncate', task.status === 'done' && 'line-through opacity-50')}
            style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </h3>
        </div>

        {/* Meta row */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {/* Owner */}
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            {task.owner}
          </span>

          {/* Time */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--brand)' }}>
            <Clock size={11} />
            {format(new Date(task.dueDate), 'HH:mm', { locale: dateLocale })}
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <MessageSquare size={11} />
            <span>{task.comments?.length || 0}</span>
          </div>

          {/* Status badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
            {task.status === 'todo' ? <Circle size={9} /> : task.status === 'done' ? <CheckCircle size={9} /> : task.status === 'hold' ? <AlertCircle size={9} /> : <X size={9} />}
            {task.status === 'todo' ? t.createdTasks : task.status === 'done' ? t.doneTasks : task.status === 'hold' ? t.onHold : t.markCancelled}
          </div>
        </div>

        {/* Menu */}
        <div className="relative shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-xl transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-surface)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <MoreVertical size={15} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className={cn('absolute top-full z-30 w-44 mt-1.5 py-1.5 rounded-2xl overflow-hidden', isRtl ? 'left-0' : 'right-0')}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}>
                {[
                  { status: 'todo', label: t.markPending, icon: Circle, color: 'var(--status-todo)' },
                  { status: 'done', label: t.markDone, icon: CheckCircle, color: 'var(--status-done)' },
                  { status: 'hold', label: t.putOnHold, icon: Pause, color: 'var(--status-hold)' },
                  { status: 'cancelled', label: t.markCancelled, icon: X, color: 'var(--status-cancelled)' },
                ].map(m => (
                  <button key={m.status} onClick={() => handleUpdateStatus(m.status as TaskStatus)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}>
                    {m.label} <m.icon size={12} style={{ color: m.color }} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Expanded Panel ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mx-3 -mt-2 pt-6 pb-5 px-6 rounded-b-2xl border-t-0"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderTop: 'none' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Comments */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t.comments}</h4>
                <div className="flex gap-2">
                  <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder={t.addComment}
                    className="flex-1 text-xs outline-none"
                    style={{ ...inputStyle, padding: '8px 12px', fontSize: 11 }}
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {task.comments?.map((comment, i) => (
                    <div key={i} className="group/c flex items-start justify-between gap-3 px-3 py-2 rounded-xl text-xs"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      {editCommentIndex === i ? (
                        <div className="flex-1 space-y-2">
                          <textarea className="w-full text-xs outline-none resize-none" style={{ ...inputStyle, padding: '6px 10px', minHeight: 56 }}
                            value={editCommentValue} onChange={e => setEditCommentValue(e.target.value)} autoFocus />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditCommentIndex(null)} className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{t.cancel}</button>
                            <button onClick={() => handleUpdateComment(i)} className="px-3 py-1 rounded-lg text-[10px] font-bold text-white" style={{ background: 'var(--brand)' }}>{t.save}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 leading-relaxed">{comment}</span>
                          <button onClick={() => { setEditCommentIndex(i); setEditCommentValue(comment); }}
                            className="opacity-0 group-hover/c:opacity-100 transition p-1 rounded" style={{ color: 'var(--brand)' }}>
                            <Edit2 size={10} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell size={13} style={{ color: 'var(--brand)' }} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t.remindIn}</h4>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t.min}</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5,15,30,60].map(m => (
                      <button key={m} onClick={e => { e.stopPropagation(); handleQuickReminder(m, 'min'); }}
                        className="py-2 rounded-xl text-[10px] font-bold transition-all"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.3)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                      >{m}</button>
                    ))}
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t.hour}</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1,2,3,5].map(h => (
                      <button key={h} onClick={e => { e.stopPropagation(); handleQuickReminder(h, 'hour'); }}
                        className="py-2 rounded-xl text-[10px] font-bold transition-all"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#10b981'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.25)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                      >{h}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{t.more}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={e => { e.stopPropagation(); setShowEditModal(true); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}>
                    <Edit2 size={13} style={{ color: 'var(--brand)' }} /> {t.edit}
                  </button>
                  <button onClick={e => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#f43f5e' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(244,63,94,0.4)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'}>
                    <Trash2 size={13} /> {t.delete}
                  </button>
                </div>
                {task.holdReason && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px]"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                    <AlertCircle size={12} /> <span className="truncate flex-1">{task.holdReason}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={e => { e.stopPropagation(); handleAddComment(); }}
                className="px-8 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: 'var(--brand)', boxShadow: '0 3px 10px var(--brand-glow)' }}>
                {t.save}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[460px]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
              {/* Left */}
              <div className="flex-1 p-8 border-b md:border-b-0 md:border-r" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>{t.editTask}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{task.id.slice(0,8)}</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="md:hidden p-2 rounded-xl" style={{ background: 'var(--bg-card)' }}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
                <form onSubmit={handleSaveEdit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{t.taskTitle}</label>
                    <input required style={inputStyle} value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{t.taskOwner}</label>
                      <input style={inputStyle} value={editOwner} onChange={e => setEditOwner(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{t.dueDate}</label>
                      <div className="flex gap-2">
                        <input type="date" style={{ ...inputStyle, padding: '8px 10px', flex: 2, colorScheme: 'dark' }} value={editDate} onChange={e => setEditDate(e.target.value)} />
                        <input type="time" style={{ ...inputStyle, padding: '8px 10px', flex: 1, colorScheme: 'dark' }} value={editTime} onChange={e => setEditTime(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{t.recurrence}</label>
                      <select style={{ ...inputStyle, appearance: 'none' }} value={editRecurrence} onChange={e => setEditRecurrence(e.target.value as RecurrenceType)}>
                        <option value="none">{t.none}</option>
                        <option value="daily">{t.daily}</option>
                        <option value="weekly">{t.weekly}</option>
                        <option value="monthly">{t.monthly}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{t.holdReason}</label>
                    <textarea style={{ ...inputStyle, minHeight: 72, resize: 'none' }} value={editHoldReason} onChange={e => setEditHoldReason(e.target.value)} placeholder={t.holdReason} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl text-sm font-bold transition" style={{ color: 'var(--text-muted)' }}>{t.cancel}</button>
                    <button type="submit" className="flex-[2] py-3 rounded-xl text-sm font-black text-white" style={{ background: 'var(--brand)', boxShadow: '0 4px 14px var(--brand-glow)' }}>{t.save}</button>
                  </div>
                </form>
              </div>
              {/* Right: Comments */}
              <div className="flex-1 p-8 flex flex-col" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} style={{ color: 'var(--brand)' }} />
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t.comments}</h3>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="hidden md:block p-2 rounded-xl" style={{ background: 'var(--bg-surface)' }}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
                </div>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={t.addComment}
                    style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                  <button onClick={handleAddComment} className="px-4 rounded-xl transition" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <PlusCircle size={16} style={{ color: 'var(--brand)' }} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2" style={{ scrollbarWidth: 'thin' }}>
                  {task.comments?.map((comment, i) => (
                    <div key={i} className="group/ec flex items-start justify-between gap-2 p-3 rounded-2xl text-xs"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      {editCommentIndex === i ? (
                        <div className="flex-1 space-y-2">
                          <textarea className="w-full text-xs outline-none resize-none" style={{ ...inputStyle, minHeight: 56 }}
                            value={editCommentValue} onChange={e => setEditCommentValue(e.target.value)} autoFocus />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditCommentIndex(null)} className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{t.cancel}</button>
                            <button onClick={() => handleUpdateComment(i)} className="px-3 py-1 rounded-lg text-[10px] font-bold text-white" style={{ background: 'var(--brand)' }}>{t.save}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="flex-1 leading-relaxed">{comment}</p>
                          <div className="flex gap-1 opacity-0 group-hover/ec:opacity-100 transition">
                            <button onClick={() => { setEditCommentIndex(i); setEditCommentValue(comment); }} className="p-1.5 rounded-lg" style={{ color: 'var(--brand)' }}><Edit2 size={11} /></button>
                            <button onClick={() => { const c = [...(task.comments||[])]; c.splice(i,1); onUpdate(task.id,{comments:c}); }} className="p-1.5 rounded-lg" style={{ color: '#f43f5e' }}><Trash2 size={11} /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {(!task.comments || task.comments.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      <MessageSquare size={28} className="mb-2 opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No comments</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Modal ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="p-8 rounded-3xl w-full max-w-sm text-center space-y-4"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(244,63,94,0.1)' }}>
                <Trash2 size={24} style={{ color: '#f43f5e' }} />
              </div>
              <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t.confirmDeleteTitle}</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.confirmDelete}</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{t.cancel}</button>
                <button onClick={() => { onDelete(task.id); setShowDeleteConfirm(false); }}
                  className="flex-1 py-3 rounded-xl text-sm font-black text-white" style={{ background: '#f43f5e', boxShadow: '0 4px 14px rgba(244,63,94,0.3)' }}>{t.delete}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Hold Modal ── */}
      {showHoldModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-3xl w-full max-w-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div className="flex items-center gap-2 mb-4" style={{ color: '#f59e0b' }}>
              <AlertCircle size={20} />
              <h4 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t.putOnHold}</h4>
            </div>
            <textarea autoFocus style={{ ...inputStyle, minHeight: 100, resize: 'none', marginBottom: 20 }}
              placeholder={t.holdReason} value={holdReason} onChange={e => setHoldReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setShowHoldModal(false)} className="flex-1 py-3 rounded-xl text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{t.cancel}</button>
              <button onClick={handleApplyHold} className="flex-1 py-3 rounded-xl text-sm font-black text-white" style={{ background: '#f59e0b', boxShadow: '0 4px 14px rgba(245,158,11,0.3)' }}>{t.save}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
