
import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, CheckCircle2, PauseCircle, XCircle,
  Settings as SettingsIcon, Plus, FileSpreadsheet,
  Calendar as CalendarIcon, RotateCcw, ListTodo
} from 'lucide-react';
import { Language, TaskStatus, Task, ViewMode } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { isSameDay } from 'date-fns';

interface SidebarProps {
  lang: Language;
  activeFilter: TaskStatus | 'all';
  activeView: ViewMode;
  onFilterChange: (filter: TaskStatus | 'all') => void;
  onViewChange: (view: ViewMode) => void;
  onAddTask: () => void;
  onOpenSettings: () => void;
  onExport: () => void;
  tasks: Task[];
}

export function Sidebar({ lang, activeFilter, activeView, onFilterChange, onViewChange, onAddTask, onOpenSettings, onExport, tasks }: SidebarProps) {
  const { t, isRtl } = useI18n(lang);

  const navItems = [
    { id: 'tasks' as ViewMode, label: t.all, icon: LayoutDashboard },
    { id: 'calendar' as ViewMode, label: t.calendar, icon: CalendarIcon },
    { id: 'settings' as ViewMode, label: t.settings, icon: SettingsIcon },
  ];

  const filterItems = [
    { id: 'todo' as TaskStatus, label: t.createdTasks, icon: ListTodo, color: 'var(--status-todo)' },
    { id: 'hold' as TaskStatus, label: t.onHold, icon: PauseCircle, color: 'var(--status-hold)' },
    { id: 'done' as TaskStatus, label: t.doneTasks, icon: CheckCircle2, color: 'var(--status-done)' },
    { id: 'cancelled' as TaskStatus, label: t.markCancelled, icon: XCircle, color: 'var(--status-cancelled)' },
  ];

  return (
    <aside
      className={cn('w-[240px] shrink-0 flex flex-col h-full overflow-hidden', isRtl && 'border-r-0 border-l')}
      style={{ background: 'var(--sidebar-bg)', borderRight: isRtl ? 'none' : '1px solid var(--sidebar-border)', borderLeft: isRtl ? '1px solid var(--sidebar-border)' : 'none', position: 'relative', zIndex: 10 }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', fontStyle: 'italic', boxShadow: '0 4px 12px var(--brand-glow)' }}>T.</div>
        <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--sidebar-text)', letterSpacing: '-0.02em' }}>{t.appName}.</span>
      </div>

      {/* Add task button */}
      <div className="px-4 pb-4">
        <button
          onClick={onAddTask}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
          style={{ background: 'var(--sidebar-btn-bg)', border: '1px solid var(--sidebar-btn-border)', color: 'var(--sidebar-btn-text)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--sidebar-btn-hover-bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--sidebar-btn-bg)'; }}
        >
          <Plus size={14} /> {t.addTask}
        </button>
      </div>

      {/* Nav */}
      <div className="px-3 mb-2">
        <p className="px-3 mb-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--sidebar-text-dim)' }}>Navigation</p>
        <nav className="space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: activeView === item.id ? 'var(--sidebar-active-bg)' : 'transparent',
                color: activeView === item.id ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-sub)',
              }}
              onMouseEnter={e => { if (activeView !== item.id) e.currentTarget.style.color = 'var(--sidebar-hover-text)'; e.currentTarget.style.background = activeView !== item.id ? 'var(--sidebar-hover-bg)' : ''; }}
              onMouseLeave={e => { e.currentTarget.style.color = activeView === item.id ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-sub)'; e.currentTarget.style.background = activeView === item.id ? 'var(--sidebar-active-bg)' : 'transparent'; }}
            >
              <item.icon size={15} />
              {item.label}
              {activeView === item.id && (
                <motion.div layoutId="nav-pill"
                  className={cn('absolute w-1 h-4 rounded-full', isRtl ? 'left-1' : 'right-1')}
                  style={{ background: 'var(--brand)' }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters (only when on tasks view) */}
      {activeView === 'tasks' && (
        <div className="px-3 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <p className="px-3 mb-2 mt-2 text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--sidebar-text-dim)' }}>Filters</p>
          <nav className="space-y-0.5">
            {filterItems.map(item => (
              <button
                key={item.id}
                onClick={() => onFilterChange(item.id)}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: activeFilter === item.id ? `${item.color}18` : 'transparent',
                  color: activeFilter === item.id ? item.color : 'var(--sidebar-text-sub)',
                }}
                onMouseEnter={e => { if (activeFilter !== item.id) { e.currentTarget.style.color = 'var(--sidebar-hover-text)'; e.currentTarget.style.background = 'var(--sidebar-hover-bg)'; }}}
                onMouseLeave={e => { e.currentTarget.style.color = activeFilter === item.id ? item.color : 'var(--sidebar-text-sub)'; e.currentTarget.style.background = activeFilter === item.id ? `${item.color}18` : 'transparent'; }}
              >
                <item.icon size={14} />
                {item.label}
                {activeFilter === item.id && (
                  <motion.div layoutId="filter-pill"
                    className={cn('absolute w-1 h-3 rounded-full', isRtl ? 'left-1' : 'right-1')}
                    style={{ background: item.color }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Task counts */}
          <div className="mt-4 space-y-1.5">
            {filterItems.map(item => {
              const count = tasks.filter(t => t.status === item.id).length;
              return (
                <div key={item.id} className="flex items-center justify-between px-3 py-1">
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--sidebar-text-dim)' }}>{item.label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${item.color}20`, color: item.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom: Export */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--sidebar-divider)' }}>
        <button
          onClick={onExport}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          style={{ color: 'var(--sidebar-text-sub)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--sidebar-hover-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--sidebar-text-sub)'}
        >
          <RotateCcw size={13} /> {t.export}
        </button>
      </div>
    </aside>
  );
}
