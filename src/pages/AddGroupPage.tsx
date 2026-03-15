import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Search, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useGroups, useCourses, useEmployees, useRooms } from '../lib/mockData.ts';

export default function AddGroupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items: groups, addItem: addGroup } = useGroups();
  const { items: courses } = useCourses();
  const { items: employees } = useEmployees();
  const { items: rooms } = useRooms();

  const [formData, setFormData] = useState({
    name: '',
    course: '',
    teacher: '',
    room: '',
    days: '',
    startTime: ''
  });
  const [error, setError] = useState('');
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  const calculateEndTime = (start: string) => {
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 90; // 1.5 hours
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endTime = calculateEndTime(formData.startTime);
    const newStart = parseInt(formData.startTime.replace(':', ''));
    const newEnd = parseInt(endTime.replace(':', ''));

    const hasOverlap = groups.some(group => {
      if (!group.days || !group.startTime || !group.endTime) return false;
      if (group.rooms !== formData.room) return false;
      if (!group.days.includes(formData.days)) return false;
      
      const eventStart = parseInt(group.startTime.replace(':', ''));
      const eventEnd = parseInt(group.endTime.replace(':', ''));
      
      return (newStart < eventEnd && newEnd > eventStart);
    });

    if (hasOverlap) {
      setError(t('room_time_conflict_error', 'This room is already booked for the selected time and days.'));
      return;
    }

    addGroup({
      name: formData.name,
      students: 0,
      teachers: formData.teacher,
      courses: formData.course,
      rooms: formData.room,
      days: [formData.days],
      startTime: formData.startTime,
      endTime: endTime
    });

    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-lg bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('add_new_group')}</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group_name')}</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_group_name')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('courses')}</label>
            <select required value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
              <option value="">{t('select_course')}</option>
              {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('teachers')}</label>
            <div 
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 cursor-pointer flex justify-between items-center min-h-[46px]"
              onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
            >
              <div className="flex flex-wrap gap-2">
                {formData.teacher ? formData.teacher.split(', ').map(teacher => (
                  <div key={teacher} className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800/50 px-2 py-1 rounded-md text-sm">
                    {teacher}
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setFormData(prev => ({
                          ...prev, 
                          teacher: prev.teacher.split(', ').filter(t => t !== teacher).join(', ')
                        }));
                      }} 
                      className="hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )) : (
                  <span className="text-zinc-500">{t('select_teacher')}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-zinc-500 shrink-0">
                {formData.teacher && (
                  <button 
                    type="button" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFormData({...formData, teacher: ''}); 
                    }} 
                    className="hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <ChevronsUpDown className="w-4 h-4" />
              </div>
            </div>
            
            {isTeacherDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTeacherDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="text" 
                        placeholder={t('search')} 
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                    {employees.filter(e => e.employeeType?.toLowerCase().includes('teacher')).filter(e => e.name.toLowerCase().includes(teacherSearch.toLowerCase())).map(employee => {
                      const isSelected = formData.teacher ? formData.teacher.split(', ').includes(employee.name) : false;
                      return (
                        <label key={employee.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded cursor-pointer">
                          <div className={cn(
                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                              : "border-zinc-300 dark:border-zinc-700"
                          )}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isSelected}
                            onChange={() => {
                              setFormData(prev => {
                                const currentTeachers = prev.teacher ? prev.teacher.split(', ').filter(Boolean) : [];
                                const newTeachers = isSelected 
                                  ? currentTeachers.filter(t => t !== employee.name)
                                  : [...currentTeachers, employee.name];
                                return { ...prev, teacher: newTeachers.join(', ') };
                              });
                            }}
                          />
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">{employee.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('rooms')}</label>
            <select required value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
              <option value="">{t('select_room')}</option>
              {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('days')}</label>
            <select required value={formData.days} onChange={e => setFormData({...formData, days: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
              <option value="">{t('select_days')}</option>
              <option value="odd">{t('odd')}</option>
              <option value="even">{t('even')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('start_time')}</label>
            <input 
              type="time" 
              required
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            {t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}
