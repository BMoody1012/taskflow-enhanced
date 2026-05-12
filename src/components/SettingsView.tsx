
import React, { useRef } from 'react';
import { Globe, Moon, Sun, Volume2, Upload, Download, Database, CheckCircle, Music, RefreshCw, Layers } from 'lucide-react';
import { Settings, Task } from '../types';
import { useI18n } from '../hooks/useI18n';
import { cn } from '../lib/utils';

interface SettingsViewProps {
  settings: Settings;
  tasks: Task[];
  onUpdate: (updates: Partial<Settings>) => void;
  onRestore: (tasks: Task[], settings: Settings) => void;
}

export function SettingsView({ settings, tasks, onUpdate, onRestore }: SettingsViewProps) {
  const { t, isRtl } = useI18n(settings.language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) onUpdate({ reminderSound: event.target.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify({ version: '1.0', timestamp: new Date().toISOString(), tasks, settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks && data.settings) { onRestore(data.tasks, data.settings); alert(t.importSuccess); }
        else throw new Error('Invalid format');
      } catch { alert(t.importError); }
    };
    reader.readAsText(file);
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: 24,
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 10,
    fontWeight: 900,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    marginBottom: 12,
    color: 'var(--text-muted)',
  };

  const optionBtn = (active: boolean, color?: string) => ({
    flex: 1,
    padding: '10px 14px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.18s',
    border: 'none',
    background: active ? (color || 'var(--brand)') : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    boxShadow: active ? `0 3px 10px ${color ? color + '44' : 'var(--brand-glow)'}` : 'none',
  });

  const statsData = [
    { label: settings.language === 'ar' ? 'إجمالي' : 'Total', value: tasks.length, color: 'var(--brand)' },
    { label: settings.language === 'ar' ? 'مكتمل' : 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#10b981' },
    { label: settings.language === 'ar' ? 'معلق' : 'Hold', value: tasks.filter(t => t.status === 'hold').length, color: '#f59e0b' },
    { label: settings.language === 'ar' ? 'ملغى' : 'Cancelled', value: tasks.filter(t => t.status === 'cancelled').length, color: '#f43f5e' },
  ];

  return (
    <div className={cn('flex h-full w-full overflow-hidden', isRtl && 'font-arabic')}
      style={{ background: 'var(--bg-base)' }}>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* ── Stats overview ── */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {statsData.map(s => (
              <div key={s.label} style={{ ...cardStyle, textAlign: 'center', padding: 18 }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── Left Column ── */}
            <div className="space-y-5">

              {/* Language */}
              <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={16} style={{ color: 'var(--brand)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{t.language}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Interface Language</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, padding: 5, background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
                  <button style={optionBtn(settings.language === 'en')} onClick={() => onUpdate({ language: 'en' })}>
                    🇬🇧 English
                  </button>
                  <button style={optionBtn(settings.language === 'ar')} onClick={() => onUpdate({ language: 'ar' })}>
                    🇸🇦 العربية
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {settings.theme === 'dark' ? <Moon size={16} style={{ color: '#f59e0b' }} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{t.theme}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Visual Appearance</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, padding: 5, background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
                  <button style={optionBtn(settings.theme === 'light', '#f59e0b')} onClick={() => onUpdate({ theme: 'light' })}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Sun size={13} /> {settings.language === 'ar' ? 'فاتح' : 'Light'}
                    </span>
                  </button>
                  <button style={optionBtn(settings.theme === 'dark', '#6366f1')} onClick={() => onUpdate({ theme: 'dark' })}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Moon size={13} /> {settings.language === 'ar' ? 'داكن' : 'Dark'}
                    </span>
                  </button>
                </div>

                {/* Live preview strip */}
                <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
                  {['#181824','#252538','#6366f1','#10b981','#f59e0b','#f43f5e'].map(c => (
                    <div key={c} style={{ flex: 1, height: 6, borderRadius: 9999, background: c }} />
                  ))}
                </div>
                <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6, fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>App Color Palette</p>
              </div>

              {/* Sound */}
              <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Volume2 size={16} style={{ color: 'var(--brand)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{t.sound}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Reminder Alert Sound</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleSoundUpload} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Upload size={13} />{t.selectSound}</span>
                    <Music size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <button onClick={() => onUpdate({ reminderSound: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' })}
                    style={{ padding: '10px 16px', borderRadius: 12, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onMouseEnter={e => { (e.currentTarget.style.color = 'var(--text-primary)'); (e.currentTarget.style.borderColor = 'var(--border-hover)'); }}
                    onMouseLeave={e => { (e.currentTarget.style.color = 'var(--text-muted)'); (e.currentTarget.style.borderColor = 'var(--border)'); }}>
                    <RefreshCw size={11} /> {t.reset}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="space-y-5">

              {/* Backup & Restore */}
              <div style={cardStyle}>
                <div className="flex items-center gap-3 mb-5">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Database size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{t.backup}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Export & Import Data</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={handleExportBackup}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => { (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'); (e.currentTarget.style.background = 'rgba(99,102,241,0.05)'); }}
                    onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.background = 'var(--bg-surface)'); }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Download size={18} style={{ color: 'var(--brand)' }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>{t.exportBackup}</span>
                  </button>
                  <button onClick={() => backupInputRef.current?.click()}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => { (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'); (e.currentTarget.style.background = 'rgba(16,185,129,0.05)'); }}
                    onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.background = 'var(--bg-surface)'); }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={18} style={{ color: '#10b981' }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>{t.importBackup}</span>
                  </button>
                </div>
                <input ref={backupInputRef} type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
              </div>

              {/* About / App info */}
              <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, var(--bg-card) 60%)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', fontStyle: 'italic' }}>T.</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{t.appName}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Task Management Suite</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: Layers, label: settings.language === 'ar' ? 'الإصدار' : 'Version', value: '4.0' },
                    { icon: Globe, label: settings.language === 'ar' ? 'اللغة' : 'Language', value: settings.language === 'ar' ? 'العربية' : 'English' },
                    { icon: settings.theme === 'dark' ? Moon : Sun, label: settings.language === 'ar' ? 'المظهر' : 'Theme', value: settings.theme === 'dark' ? (settings.language === 'ar' ? 'داكن' : 'Dark') : (settings.language === 'ar' ? 'فاتح' : 'Light') },
                    { icon: CheckCircle, label: settings.language === 'ar' ? 'المهام المكتملة' : 'Tasks Done', value: `${tasks.filter(t => t.status === 'done').length} / ${tasks.length}` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <row.icon size={13} style={{ color: 'var(--brand)' }} />{row.label}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
