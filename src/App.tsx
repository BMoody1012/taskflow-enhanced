
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { MiniCalendar } from './components/MiniCalendar';
import { UpcomingSchedule } from './components/UpcomingSchedule';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { ReminderPopup } from './components/ReminderPopup';
import { useTaskStore } from './hooks/useTaskStore';
import { useI18n } from './hooks/useI18n';
import { cn } from './lib/utils';
import { Task, TaskStatus, ViewMode } from './types';
import { format, isSameDay } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Search, Calendar as CalendarIcon, X, Sun, Moon, Languages } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const { tasks, settings, addTask, updateTask, deleteTask, updateSettings, restoreBackup } = useTaskStore();
  const { t, isRtl } = useI18n(settings.language);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('todo');
  const [view, setView] = useState<ViewMode>('tasks');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeReminder, setActiveReminder] = useState<Task | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings.theme, settings.language]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const triggeringTask = tasks.find(task => {
        if (task.status === 'done' || task.reminderTriggered) return false;
        return new Date(task.dueDate) <= now;
      });
      if (triggeringTask && !activeReminder) {
        setActiveReminder(triggeringTask);
        updateTask(triggeringTask.id, { reminderTriggered: true });
        audioRef.current?.play().catch(() => {});
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [tasks, activeReminder]);

  useEffect(() => {
    if (!activeReminder && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [activeReminder]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = search.trim() === '' ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.owner.toLowerCase().includes(search.toLowerCase());
    const statusMatches = search.trim() !== '' || filter === 'all' || task.status === filter;
    const dateMatches = search.trim() !== '' || !selectedDate || isSameDay(new Date(task.dueDate), selectedDate);
    return matchesSearch && statusMatches && dateMatches;
  });

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      const statuses: { id: TaskStatus; label: string }[] = [
        { id: 'todo', label: t.createdTasks },
        { id: 'hold', label: t.onHold },
        { id: 'done', label: t.doneTasks },
        { id: 'cancelled', label: t.markCancelled }
      ];

      const fmt = (tl: Task[]) => tl.map(t => ({
        [settings.language === 'ar' ? 'العنوان' : 'Title']: t.title,
        [settings.language === 'ar' ? 'المالك' : 'Owner']: t.owner,
        [settings.language === 'ar' ? 'الموعد' : 'Due']: format(new Date(t.dueDate), 'yyyy-MM-dd HH:mm'),
        [settings.language === 'ar' ? 'الحالة' : 'Status']: t.status,
        [settings.language === 'ar' ? 'سبب التوقف' : 'Hold Reason']: t.holdReason || '',
        [settings.language === 'ar' ? 'عدد التعليقات' : 'Comments Count']: t.comments?.length || 0,
        [settings.language === 'ar' ? 'تاريخ الإنشاء' : 'Created']: format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm'),
      }));

      // Add specific sheets for each status
      statuses.forEach(s => {
        const st = tasks.filter(t => t.status === s.id);
        if (st.length) {
          // Ensure sheet name is safe (no : \ / ? * [ ] and max 31 chars)
          const safeName = s.label.replace(/[:\\/?*[\]]/g, '_').substring(0, 31);
          const ws = XLSX.utils.json_to_sheet(fmt(st));
          XLSX.utils.book_append_sheet(wb, ws, safeName);
        }
      });

      // Add "All Tasks" sheet
      const allWs = XLSX.utils.json_to_sheet(fmt(tasks));
      const allLabel = t.all.replace(/[:\\/?*[\]]/g, '_').substring(0, 31);
      XLSX.utils.book_append_sheet(wb, allWs, allLabel);

      // Write file
      XLSX.writeFile(wb, `TaskFlow_Tasks_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`, {
        bookType: 'xlsx',
        type: 'binary'
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleSnooze = (newDate: string) => {
    if (activeReminder) { updateTask(activeReminder.id, { dueDate: newDate, reminderTriggered: false }); setActiveReminder(null); }
  };
  const handleComplete = () => {
    if (activeReminder) { updateTask(activeReminder.id, { status: 'done' }); setActiveReminder(null); }
  };
  const toggleTheme = () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  const toggleLanguage = () => updateSettings({ language: settings.language === 'en' ? 'ar' : 'en' });
  const dateLocale = settings.language === 'ar' ? ar : enUS;

  const HeaderControls = () => (
    <div className="flex items-center gap-2">
      <button onClick={toggleLanguage} className="header-chip">
        <Languages size={13} />
        {settings.language === 'en' ? 'EN / عربي' : 'عربي / EN'}
      </button>
      <button onClick={toggleTheme} className="header-chip">
        {settings.theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        {settings.theme === 'dark'
          ? (settings.language === 'ar' ? 'فاتح' : 'Light')
          : (settings.language === 'ar' ? 'داكن' : 'Dark')}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <audio ref={audioRef} src={settings.reminderSound} loop />

      <Sidebar
        lang={settings.language}
        activeFilter={filter}
        activeView={view}
        onFilterChange={(f) => { setFilter(f); setView('tasks'); setSelectedDate(null); }}
        onViewChange={(v) => { setView(v); setSearch(''); }}
        onAddTask={() => setShowTaskForm(true)}
        onOpenSettings={() => setView('settings')}
        onExport={handleExport}
        tasks={tasks}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── TASKS VIEW ── */}
          {view === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-w-0 h-full">
              <header className="h-[68px] px-8 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <div className="flex flex-col">
                  <span className="text-[16px] font-bold leading-tight">{format(new Date(), 'EEEE', { locale: dateLocale })}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{format(new Date(), 'dd MMMM yyyy', { locale: dateLocale })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeaderControls />
                  <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 6px' }} />
                  <button onClick={handleExport} className="header-chip">{t.export}</button>
                  <button
                    onClick={() => setShowTaskForm(true)}
                    style={{ background: 'var(--brand)', color: '#fff', padding: '7px 20px', borderRadius: 999, fontSize: 12, fontWeight: 700, boxShadow: '0 3px 12px var(--brand-glow)' }}
                  >+ {t.addTask}</button>
                </div>
              </header>

              {/* Stats */}
              <div className="px-8 grid grid-cols-4 gap-2.5 pt-4 pb-2 shrink-0">
                {[
                  { label: settings.language === 'ar' ? 'إجمالي المهام' : 'Total Tasks', value: tasks.length, cls: 'stat-indigo', color: 'var(--brand)' },
                  { label: settings.language === 'ar' ? 'المكتملة' : 'Completed', value: tasks.filter(t => t.status === 'done').length, cls: 'stat-emerald', color: 'var(--status-done)' },
                  { label: settings.language === 'ar' ? 'معلقة' : 'Pending', value: tasks.filter(t => t.status === 'todo').length, cls: 'stat-amber', color: 'var(--status-todo)' },
                  { label: settings.language === 'ar' ? 'قيد الانتظار' : 'On Hold', value: tasks.filter(t => t.status === 'hold').length, cls: 'stat-amber', color: 'var(--status-hold)' },
                ].map(s => (
                  <div key={s.label} className={cn('glass-card rounded-xl px-4 py-3', s.cls)}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden px-8 pb-8 flex gap-6">
                <div className="hidden lg:flex w-[300px] shrink-0 flex-col gap-5 overflow-y-auto py-4 pe-3" style={{ scrollbarWidth: 'thin' }}>
                  <MiniCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} lang={settings.language} />
                  <UpcomingSchedule tasks={tasks} lang={settings.language} onUpdateTask={updateTask} onDeleteTask={deleteTask} />
                </div>

                <div className="flex-1 overflow-y-auto py-4 pe-3" style={{ scrollbarWidth: 'thin' }}>
                  {/* Filter + search */}
                  <div className="sticky top-0 z-20 pt-2 pb-4 flex items-center justify-between gap-4" style={{ background: 'var(--bg-base)' }}>
                    <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                      {[
                        { id: 'todo', label: t.createdTasks },
                        { id: 'hold', label: t.onHold },
                        { id: 'done', label: t.doneTasks },
                        { id: 'cancelled', label: t.markCancelled },
                        { id: 'all', label: t.all }
                      ].map(tab => (
                        <button key={tab.id} onClick={() => { setFilter(tab.id as any); setSearch(''); setSelectedDate(null); }}
                          className={cn('tab-pill', filter === tab.id && search === '' && !selectedDate ? 'active' : '')}>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative flex-1 max-w-xs">
                      <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: search ? 'var(--brand)' : 'var(--text-muted)' }} />
                      <input type="text" placeholder={t.searchTasks || 'Search…'} value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-8 rounded-2xl text-xs font-medium outline-none transition-all"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                      {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={11} style={{ color: 'var(--text-muted)' }} /></button>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed text-sm italic"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        <CalendarIcon size={40} className="mb-5 opacity-20" />{t.noTasks}
                      </div>
                    ) : filteredTasks.map(task => (
                      <TaskCard key={task.id} task={task} lang={settings.language} onUpdate={updateTask} onDelete={deleteTask} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CALENDAR VIEW ── */}
          {view === 'calendar' && (
            <motion.div key="calendar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 h-full flex flex-col">
              <header className="h-[68px] px-8 flex items-center justify-end gap-2 shrink-0"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <HeaderControls />
              </header>
              <div className="flex-1 overflow-hidden"><CalendarView tasks={tasks} lang={settings.language} /></div>
            </motion.div>
          )}

          {/* ── SETTINGS VIEW ── */}
          {view === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 h-full flex flex-col">
              <header className="h-[68px] px-8 flex items-center justify-between gap-2 shrink-0"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <span className="font-black text-base tracking-tight">{t.settings}</span>
                <HeaderControls />
              </header>
              <div className="flex-1 overflow-hidden">
                <SettingsView settings={settings} tasks={tasks} onUpdate={updateSettings} onRestore={restoreBackup} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showTaskForm && <TaskForm lang={settings.language} onClose={() => setShowTaskForm(false)} onSubmit={addTask} />}
        {activeReminder && <ReminderPopup task={activeReminder} lang={settings.language} onClose={() => setActiveReminder(null)} onSnooze={handleSnooze} onComplete={handleComplete} />}
      </AnimatePresence>
    </div>
  );
}
