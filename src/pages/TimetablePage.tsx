import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, MoreVertical, Plus, X, Filter, Search, Check } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useGroups, useEmployees, useRooms, Group } from '../lib/mockData.ts';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

const getEventStyle = (start: string, end: string, track: number) => {
  if (!start || !end) return {};
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  const startTotal = startH + startM / 60;
  const endTotal = endH + endM / 60;
  
  const left = ((startTotal - 9) / 11.5) * 100;
  const width = ((endTotal - startTotal) / 11.5) * 100;
  
  return {
    left: `${left}%`,
    width: `${width}%`,
    top: `${track * 120 + 16}px`,
    height: '104px'
  };
};

export default function TimetablePage() {
  const { t } = useTranslation();
  const { items: groups, updateItem } = useGroups();
  const { items: employees } = useEmployees();
  const { items: rooms } = useRooms();
  const [filter, setFilter] = useState<'all' | 'odd' | 'even'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [expandedFilter, setExpandedFilter] = useState<'teachers' | 'rooms' | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailsEventId, setDetailsEventId] = useState<number | null>(null);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [isDaysDropdownOpen, setIsDaysDropdownOpen] = useState(false);
  const [daysSearch, setDaysSearch] = useState('');

  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    teacher: '',
    room: '',
    start: '',
    end: '',
    days: [] as string[]
  });

  const checkOverlap = (excludeId?: number) => {
    const newStart = parseInt(formData.start.replace(':', ''));
    const newEnd = parseInt(formData.end.replace(':', ''));

    return groups.some(group => {
      if (!group.days || !group.startTime || !group.endTime) return false;
      if (excludeId && group.id === excludeId) return false;
      if (group.rooms !== formData.room) return false;
      
      const hasCommonDay = group.days.some(d => formData.days.includes(d));
      if (!hasCommonDay) return false;
      
      const eventStart = parseInt(group.startTime.replace(':', ''));
      const eventEnd = parseInt(group.endTime.replace(':', ''));
      
      return (newStart < eventEnd && newEnd > eventStart);
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (checkOverlap()) {
      setError(t('room_time_conflict_error', 'This room is already booked for the selected time and days.'));
      return;
    }
    
    const group = groups.find(g => g.name === formData.title);
    if (group) {
      updateItem(group.id, {
        teachers: formData.teacher,
        rooms: formData.room,
        startTime: formData.start,
        endTime: formData.end,
        days: formData.days
      });
    }
    setIsAddModalOpen(false);
    setFormData({ title: '', teacher: '', room: '', start: '', end: '', days: [] });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (editEventId !== null) {
      if (checkOverlap(editEventId)) {
        setError(t('room_time_conflict_error', 'This room is already booked for the selected time and days.'));
        return;
      }
      updateItem(editEventId, {
        name: formData.title,
        teachers: formData.teacher,
        rooms: formData.room,
        startTime: formData.start,
        endTime: formData.end,
        days: formData.days
      });
      setEditEventId(null);
    }
  };

  const openEditModal = (group: Group) => {
    setFormData({
      title: group.name,
      teacher: group.teachers,
      room: group.rooms,
      start: group.startTime || '',
      end: group.endTime || '',
      days: group.days || []
    });
    setEditEventId(group.id);
  };

  const filteredEvents = useMemo(() => {
    return groups.filter(g => {
      if (!g.days || g.days.length === 0 || !g.startTime || !g.endTime) return false;
      if (selectedTeachers.length > 0 && !selectedTeachers.includes(g.teachers)) return false;
      if (selectedRooms.length > 0 && !selectedRooms.includes(g.rooms)) return false;
      return true;
    });
  }, [groups, selectedTeachers, selectedRooms]);

  const weekDays = ['odd', 'even'];

  const calculateTracksForDay = (dayEvents: Group[]) => {
    const sorted = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const tracks: Group[][] = [];
    const eventTracks: Record<number, number> = {};
    
    sorted.forEach(event => {
      let placed = false;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const lastEvent = track[track.length - 1];
        if (lastEvent.endTime <= event.startTime) {
          track.push(event);
          eventTracks[event.id] = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        tracks.push([event]);
        eventTracks[event.id] = tracks.length - 1;
      }
    });
    
    return { maxTrack: tracks.length > 0 ? tracks.length - 1 : 0, eventTracks };
  };

  const visibleDays = useMemo(() => {
    if (filter === 'odd') return ['odd'];
    if (filter === 'even') return ['even'];
    return weekDays;
  }, [filter]);

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setActiveMenu(null);
  };

  const renderEvent = (event: Group, day: string, track: number) => (
    <div 
      key={`${day}-${event.id}`}
      className={cn(
        "absolute bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center text-center group transition-colors hover:border-zinc-300 dark:hover:border-zinc-700",
        activeMenu === event.id ? "z-50" : "z-10"
      )}
      style={getEventStyle(event.startTime, event.endTime, track)}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === event.id ? null : event.id); }}
        className="absolute top-2 right-2 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-zinc-900 dark:hover:text-zinc-300"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {activeMenu === event.id && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
          <div className="absolute top-8 right-2 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50">
            <button 
              onClick={(e) => { e.stopPropagation(); setDetailsEventId(event.id); setActiveMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {t('details')}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); openEditModal(event); setActiveMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {t('edit')}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            >
              {t('delete')}
            </button>
          </div>
        </>
      )}

      <div className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{event.name}</div>
      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{event.teachers}</div>
      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{event.rooms}</div>
      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{event.startTime}-{event.endTime}</div>
    </div>
  );

  const detailsEvent = groups.find(e => e.id === detailsEventId);
  const editEvent = groups.find(e => e.id === editEventId);

  const toggleTeacher = (teacherName: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherName) ? prev.filter(t => t !== teacherName) : [...prev, teacherName]
    );
  };

  const toggleRoom = (roomName: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomName) ? prev.filter(r => r !== roomName) : [...prev, roomName]
    );
  };

  const filteredTeachersList = employees.filter(e => e.employeeType?.toLowerCase().includes('teacher')).filter(e => e.name.toLowerCase().includes(teacherSearch.toLowerCase()));
  const filteredRoomsList = rooms.filter(r => r.name.toLowerCase().includes(roomSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('timetable')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                (selectedTeachers.length > 0 || selectedRooms.length > 0)
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
            {isFilterMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-2 z-50 max-h-[80vh] overflow-y-auto">
                  
                  {/* Teachers Filter */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800/50 last:border-0">
                    <button 
                      onClick={() => setExpandedFilter(expandedFilter === 'teachers' ? null : 'teachers')}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      {t('filter_by_teachers')}
                      {expandedFilter === 'teachers' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {expandedFilter === 'teachers' && (
                      <div className="px-4 pb-3 space-y-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input 
                            type="text" 
                            placeholder={t('search')} 
                            value={teacherSearch}
                            onChange={(e) => setTeacherSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                          />
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {filteredTeachersList.map(teacher => (
                            <label key={teacher.id} className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleTeacher(teacher.name); }}>
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                selectedTeachers.includes(teacher.name)
                                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                                  : "border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600"
                              )}>
                                {selectedTeachers.includes(teacher.name) && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                                {teacher.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rooms Filter */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800/50 last:border-0">
                    <button 
                      onClick={() => setExpandedFilter(expandedFilter === 'rooms' ? null : 'rooms')}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      {t('filter_by_rooms')}
                      {expandedFilter === 'rooms' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {expandedFilter === 'rooms' && (
                      <div className="px-4 pb-3 space-y-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input 
                            type="text" 
                            placeholder={t('search')} 
                            value={roomSearch}
                            onChange={(e) => setRoomSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                          />
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {filteredRoomsList.map(room => (
                            <label key={room.id} className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleRoom(room.name); }}>
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                selectedRooms.includes(room.name)
                                  ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                                  : "border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-600"
                              )}>
                                {selectedRooms.includes(room.name) && <Check className="w-3 h-3" />}
                              </div>
                              <span className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                                {room.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {filter === 'all' ? t('odd_even_days') : filter === 'odd' ? t('odd_days') : t('even_days')}
              <ChevronDown className="w-4 h-4" />
            </button>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                  <button onClick={() => { setFilter('all'); setIsFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('odd_even_days')}</button>
                  <button onClick={() => { setFilter('odd'); setIsFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('odd_days')}</button>
                  <button onClick={() => { setFilter('even'); setIsFilterOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('even_days')}</button>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px]">
        <div className="min-w-[1400px] relative pb-32">
          {/* Background grid lines */}
          <div className="absolute top-0 bottom-0 left-24 right-0 flex pointer-events-none border-l border-zinc-200 dark:border-zinc-800/50">
            {timeSlots.map(time => (
              <div key={time} className="flex-1 border-r border-zinc-200 dark:border-zinc-800/50 last:border-0"></div>
            ))}
          </div>

          {/* Header */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800/50 relative z-10 bg-white dark:bg-[#0a0a0a]">
            <div className="w-24 shrink-0 border-r border-zinc-200 dark:border-zinc-800/50"></div>
            <div className="flex-1 flex">
              {timeSlots.map(time => (
                <div key={time} className="flex-1 py-4 text-center text-[11px] font-bold text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-800/50 last:border-0">
                  {time}
                </div>
              ))}
            </div>
          </div>

          {/* Days */}
          <div className="relative z-10">
            {visibleDays.map((day, index) => {
              const dayEvents = filteredEvents.filter(e => e.days.includes(day));
              if (dayEvents.length === 0 && filter !== 'all' && filter !== 'odd' && filter !== 'even') return null;
              
              const { maxTrack, eventTracks } = calculateTracksForDay(dayEvents);
              const height = (maxTrack + 1) * 120 + 32;

              return (
                <div key={day} className={cn("flex", index !== visibleDays.length - 1 && "border-b border-zinc-200 dark:border-zinc-800/50")} style={{ height }}>
                  <div className="w-24 shrink-0 border-r border-zinc-200 dark:border-zinc-800/50 flex items-center justify-center font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-[#0a0a0a]">
                    {t(day.toLowerCase())}
                  </div>
                  <div className="flex-1 relative">
                    {dayEvents.map(event => renderEvent(event, day, eventTracks[event.id] || 0))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => { setIsAddModalOpen(false); setError(''); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('add_new_lesson_timetable_entry')}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('fill_the_form_with_new_lesson_timetable_entry_details')}</p>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group')}</label>
                <select 
                  required 
                  value={formData.title} 
                  onChange={e => {
                    const group = groups.find(g => g.name === e.target.value);
                    if (group) {
                      setFormData({...formData, title: group.name, teacher: group.teachers});
                    } else {
                      setFormData({...formData, title: '', teacher: ''});
                    }
                  }} 
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">{t('select_group')}</option>
                  {groups.filter(g => !g.days || g.days.length === 0).map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('start_time')}</label>
                  <select 
                    required 
                    value={formData.start} 
                    onChange={e => setFormData({...formData, start: e.target.value})} 
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  >
                    <option value="">{t('select_start_time')}</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('end_time')}</label>
                  <select 
                    required 
                    value={formData.end} 
                    onChange={e => setFormData({...formData, end: e.target.value})} 
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  >
                    <option value="">{t('select_end_time')}</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('lesson_days')}</label>
                <div 
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 cursor-pointer flex justify-between items-center"
                  onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)}
                >
                  <span className={formData.days.length === 0 ? "text-zinc-500" : ""}>
                    {formData.days.length > 0 ? formData.days.map(d => t(d.toLowerCase())).join(', ') : t('select_lesson_days')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </div>
                
                {isDaysDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDaysDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input 
                            type="text" 
                            placeholder={t('search')} 
                            value={daysSearch}
                            onChange={(e) => setDaysSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                        {weekDays.filter(d => t(d.toLowerCase()).toLowerCase().includes(daysSearch.toLowerCase())).map(day => (
                          <label key={day} className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded cursor-pointer">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              formData.days.includes(day)
                                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                                : "border-zinc-300 dark:border-zinc-700"
                            )}>
                              {formData.days.includes(day) && <Check className="w-3 h-3" />}
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={formData.days.includes(day)}
                              onChange={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  days: prev.days.includes(day) 
                                    ? prev.days.filter(d => d !== day)
                                    : [...prev.days, day]
                                }));
                              }}
                            />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{t(day.toLowerCase())}</span>
                          </label>
                        ))}
                      </div>
                      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
                        <button 
                          type="button"
                          onClick={() => setIsDaysDropdownOpen(false)}
                          className="w-full py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded"
                        >
                          {t('close')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('room')}</label>
                <select 
                  required 
                  value={formData.room} 
                  onChange={e => setFormData({...formData, room: e.target.value})} 
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">{t('select_room')}</option>
                  {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-4"
              >
                {t('save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => setDetailsEventId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('details')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('title')}</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{detailsEvent.name}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('teacher')}</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{detailsEvent.teachers}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('room')}</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{detailsEvent.rooms}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('time')}</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{detailsEvent.startTime} - {detailsEvent.endTime}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{t('lesson_days')}</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">{detailsEvent.days?.map(d => t(d.toLowerCase())).join(', ') || ''}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => { setEditEventId(null); setError(''); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit')}</h2>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group')}</label>
                <select 
                  required 
                  value={formData.title} 
                  onChange={e => {
                    const group = groups.find(g => g.name === e.target.value);
                    if (group) {
                      setFormData({...formData, title: group.name, teacher: group.teachers});
                    } else {
                      setFormData({...formData, title: '', teacher: ''});
                    }
                  }} 
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">{t('select_group')}</option>
                  {groups.filter(g => (!g.days || g.days.length === 0) || g.id === editEventId).map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('start_time')}</label>
                  <select 
                    required 
                    value={formData.start} 
                    onChange={e => setFormData({...formData, start: e.target.value})} 
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  >
                    <option value="">{t('select_start_time')}</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('end_time')}</label>
                  <select 
                    required 
                    value={formData.end} 
                    onChange={e => setFormData({...formData, end: e.target.value})} 
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  >
                    <option value="">{t('select_end_time')}</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('lesson_days')}</label>
                <div 
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 cursor-pointer flex justify-between items-center"
                  onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)}
                >
                  <span className={formData.days.length === 0 ? "text-zinc-500" : ""}>
                    {formData.days.length > 0 ? formData.days.map(d => t(d.toLowerCase())).join(', ') : t('select_lesson_days')}
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </div>
                
                {isDaysDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDaysDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                      <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input 
                            type="text" 
                            placeholder={t('search')} 
                            value={daysSearch}
                            onChange={(e) => setDaysSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                        {weekDays.filter(d => t(d.toLowerCase()).toLowerCase().includes(daysSearch.toLowerCase())).map(day => (
                          <label key={day} className="flex items-center gap-3 px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded cursor-pointer">
                            <div className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                              formData.days.includes(day)
                                ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900"
                                : "border-zinc-300 dark:border-zinc-700"
                            )}>
                              {formData.days.includes(day) && <Check className="w-3 h-3" />}
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={formData.days.includes(day)}
                              onChange={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  days: prev.days.includes(day) 
                                    ? prev.days.filter(d => d !== day)
                                    : [...prev.days, day]
                                }));
                              }}
                            />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{t(day.toLowerCase())}</span>
                          </label>
                        ))}
                      </div>
                      <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
                        <button 
                          type="button"
                          onClick={() => setIsDaysDropdownOpen(false)}
                          className="w-full py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded"
                        >
                          {t('close')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('room')}</label>
                <select 
                  required 
                  value={formData.room} 
                  onChange={e => setFormData({...formData, room: e.target.value})} 
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">{t('select_room')}</option>
                  {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-4"
              >
                {t('save')}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        title={t('remove_from_timetable', 'Remove from Timetable')}
        message={t('are_you_sure_remove_timetable', 'Are you sure you want to remove this group from the timetable? The group will not be deleted.')}
        onConfirm={() => {
          if (itemToDelete !== null) {
            updateItem(itemToDelete, { days: [], startTime: '', endTime: '' });
            setItemToDelete(null);
          }
        }}
      />
    </div>
  );
}
