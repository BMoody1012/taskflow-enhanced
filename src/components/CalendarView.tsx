
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Task, Language, TaskStatus } from '../types';
import { useI18n } from '../hooks/useI18n';
import { format, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';
import { Clock, User, Circle } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  lang: Language;
}

export function CalendarView({ tasks, lang }: CalendarViewProps) {
  const { t, isRtl } = useI18n(lang);
  const [value, setValue] = React.useState(new Date());

  const tasksForSelectedDay = tasks.filter(task => 
    isSameDay(new Date(task.dueDate), value)
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'var(--status-todo)';
      case 'done': return 'var(--status-done)';
      case 'hold': return 'var(--status-hold)';
      default: return 'var(--status-cancelled)';
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayTasks = tasks.filter(task => isSameDay(new Date(task.dueDate), date));
      if (dayTasks.length > 0) {
        return (
          <div className="day-tasks-dots">
            {dayTasks.slice(0, 4).map((task) => (
              <div 
                key={task.id}
                className={cn(
                  "task-dot shadow-sm",
                  task.status === 'todo' ? "bg-blue-500" :
                  task.status === 'done' ? "bg-emerald-500" :
                  task.status === 'hold' ? "bg-amber-500" : "bg-rose-500"
                )}
              />
            ))}
          </div>
        );
      }
    }
    return <div className="h-1 mt-1" />; // Placeholder to keep height consistent
  };

  return (
    <div className={cn(
      "flex h-full gap-8 p-8 overflow-hidden",
      isRtl ? "font-arabic" : ""
    )}>
      {/* ── Calendar Area ── */}
      <div
        className="flex-[2.5] rounded-[32px] p-10 flex flex-col shadow-2xl relative overflow-hidden group"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" style={{ background: 'var(--brand-glow)' }} />
        
        <div className="flex items-center justify-between mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 rounded-full" style={{ background: 'var(--brand)' }} />
            <h2 className="text-3xl font-black tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>
              {t.calendar}
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-1" style={{ color: 'var(--text-muted)' }}>Viewing</span>
            <div
              className="text-sm font-bold px-5 py-2.5 rounded-2xl shadow-inner"
              style={{ color: 'var(--text-primary)', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              {format(value, 'MMMM yyyy')}
            </div>
          </div>
        </div>

        <div className="flex-1 full-page-calendar-wrapper relative z-10 px-2 pb-2 overflow-y-auto custom-scrollbar">
          <Calendar
            onChange={(val) => setValue(val as Date)}
            value={value}
            locale={lang === 'ar' ? 'ar-SA' : 'en-US'}
            tileContent={tileContent}
            className="w-full !max-w-none"
          />
        </div>
      </div>

      {/* ── Selected Day Tasks Panel ── */}
      <div
        className="flex-[1.5] rounded-[32px] overflow-hidden flex flex-col shadow-2xl min-w-[380px] max-w-[420px]"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Date Header Block */}
        <div className="p-8 pb-5" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-full"
              style={{ background: 'var(--brand-glow)', color: 'var(--brand)', border: '1px solid var(--brand-glow)' }}
            >
              {format(value, 'EEEE')}
            </span>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand)' }} />
            </div>
          </div>
          <h3 className="text-4xl font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
            {format(value, 'do')}
          </h3>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--text-muted)' }}>
            {format(value, 'MMMM yyyy')}
          </p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-3.5">
          {tasksForSelectedDay.length > 0 ? (
            tasksForSelectedDay.map(task => (
              <div 
                key={task.id}
                className="p-3.5 rounded-[20px] transition-all group relative overflow-hidden flex flex-col gap-2.5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                {/* Status indicator bar - Curved pill shape */}
                <div 
                  className={cn(
                    "absolute top-2.5 bottom-2.5 w-1 rounded-full",
                    isRtl ? "right-1.5" : "left-1.5"
                  )} 
                  style={{ background: getStatusColor(task.status) }} 
                />

                <div className={cn("flex items-center justify-between", isRtl ? "pr-3" : "pl-3")}>
                   <div className={cn(
                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                    task.status === 'todo' ? "text-blue-400 bg-blue-400/5" :
                    task.status === 'done' ? "text-emerald-400 bg-emerald-400/5" :
                    task.status === 'hold' ? "text-amber-400 bg-amber-400/5" :
                    "text-rose-400 bg-rose-400/5"
                  )}>
                    {task.status === 'todo' ? t.createdTasks :
                     task.status === 'done' ? t.doneTasks :
                     task.status === 'hold' ? t.onHold : t.markCancelled}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: 'var(--brand)', background: 'var(--brand-glow)' }}>
                    <Clock className="w-3 h-3 opacity-70" />
                    {format(new Date(task.dueDate), 'HH:mm')}
                  </div>
                </div>

                <div className={cn(isRtl ? "pr-3" : "pl-3")}>
                  <h4 className="text-sm font-bold mb-2 leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {task.title}
                  </h4>
                  <div
                    className="flex items-center gap-2 text-[10px] font-medium w-fit px-2 py-1 rounded-lg"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-base)' }}
                  >
                    <User className="w-3 h-3" />
                    {task.owner}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
               <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                 <Circle className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
               </div>
               <p className="text-base font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>No tasks for today</p>
               <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Enjoy your free time!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
