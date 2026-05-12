
import React from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language } from '../types';

interface MiniCalendarProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  lang: Language;
}

export function MiniCalendar({ selectedDate, onDateChange, lang }: MiniCalendarProps) {
  return (
    <div className="mini-calendar-wrapper">
      <Calendar
        onChange={(val) => onDateChange(val as Date)}
        value={selectedDate || new Date()}
        locale={lang === 'ar' ? 'ar-SA' : 'en-US'}
        prevLabel={<ChevronLeft className="w-4 h-4" />}
        nextLabel={<ChevronRight className="w-4 h-4" />}
        prev2Label={null}
        next2Label={null}
        formatShortWeekday={(locale, date) => {
          const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
          return days[date.getDay()];
        }}
      />
    </div>
  );
}
