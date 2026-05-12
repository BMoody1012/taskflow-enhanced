
import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, CheckCircle2, Circle, Clock, Ban, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Task, Language, TaskStatus } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface UpcomingScheduleProps {
  tasks: Task[];
  lang: Language;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function UpcomingSchedule({ tasks, lang, onUpdateTask, onDeleteTask }: UpcomingScheduleProps) {
  const { t, isRtl } = useI18n(lang);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showActions) {
        setShowActions(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActions]);
  
  const upcomingTasks = tasks
    .filter(t => t.status !== 'cancelled')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'var(--status-todo)';
      case 'done': return 'var(--status-done)';
      case 'hold': return 'var(--status-hold)';
      default: return 'var(--status-cancelled)';
    }
  };

  return (
    <div
      className={cn("rounded-[32px] p-6 shadow-sm flex flex-col gap-5", isRtl ? "font-arabic" : "")}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>
          {t.upcomingSchedule}
        </h3>
        <button className="transition-colors" style={{ color: 'var(--text-muted)' }}>
          <Clock className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {upcomingTasks.length === 0 ? (
          <div className="py-8 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {t.noUpcomingTasks}
          </div>
        ) : (
          upcomingTasks.map((task) => {
            const taskDate = new Date(task.dueDate);
            const dateStr = format(taskDate, 'EEE, dd MMM', { locale: lang === 'ar' ? ar : undefined });
            const timeStr = format(taskDate, 'hh:mm a', { locale: lang === 'ar' ? ar : undefined });
            const isExpanded = expandedId === task.id;

            return (
              <div 
                key={task.id}
                className={cn("relative flex flex-col rounded-xl transition-all", showActions === task.id && "z-50")}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderColor: isExpanded ? 'var(--border-hover)' : undefined,
                }}
              >
                {/* Status Color Bar */}
                <div
                  className={cn(
                    "absolute top-2 bottom-2 w-1 rounded-full",
                    isRtl ? "right-1" : "left-1"
                  )}
                  style={{ background: getStatusColor(task.status) }}
                />
                
                <div 
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer",
                    isRtl ? "flex-row-reverse" : "flex-row"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : task.id)}
                >
                  <div className={cn("flex-1 min-w-0", isRtl ? "text-right" : "text-left")}>
                    <div className="flex items-center gap-2 mb-0.5 justify-inherit">
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {dateStr} • {timeStr}
                      </span>
                    </div>
                    <h4 className={cn(
                      "text-xs font-bold truncate",
                      isRtl ? "pl-6" : "pr-6",
                      task.status === 'done' && "opacity-40"
                    )} style={{ color: 'var(--text-primary)' }}>
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      className="p-1.5 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(showActions === task.id ? null : task.id);
                      }}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded
                      ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    }
                  </div>
                </div>

                {/* Actions Menu Popup */}
                <AnimatePresence>
                  {showActions === task.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "absolute top-2 z-50 rounded-xl shadow-2xl p-1 flex flex-col min-w-[120px]",
                        isRtl ? "left-8" : "right-8"
                      )}
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-hover)' }}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
                          setShowActions(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {task.status === 'done' ? <Circle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" style={{ color: '#5cb88a' }} />}
                        {task.status === 'done' ? t.activeTasks : t.markDone}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateTask(task.id, { status: 'hold' });
                          setShowActions(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Clock className="w-3 h-3" style={{ color: '#e0a14a' }} /> {t.putOnHold}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateTask(task.id, { status: 'cancelled' });
                          setShowActions(null);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold rounded-lg transition-colors"
                        style={{ color: '#d45555' }}
                      >
                        <Ban className="w-3 h-3" /> {t.markCancelled}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expandable Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-3 pb-3 pt-1"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <div className="space-y-2">
                        {task.comments && task.comments.length > 0 ? (
                          <div className="space-y-1">
                            {task.comments.map((comment, idx) => (
                              <p key={idx} className={cn(
                                "text-[11px] leading-relaxed italic p-2 rounded-lg",
                                isRtl ? "text-right" : "text-left"
                              )} style={{ color: 'var(--text-secondary)', background: 'var(--bg-base)' }}>
                                "{comment}"
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className={cn("text-[10px] italic", isRtl ? "text-right" : "text-left")} style={{ color: 'var(--text-muted)' }}>
                            {isRtl ? 'لا توجد تفاصيل إضافية' : 'No additional details'}
                          </p>
                        )}
                        <div className={cn("flex pt-1", isRtl ? "justify-start" : "justify-end")}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            className="p-1.5 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
