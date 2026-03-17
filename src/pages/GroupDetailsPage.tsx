import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, LayoutGrid, Check, Plus, X, Search, MoreVertical } from 'lucide-react';
import { cn, displayPrice, calculateGroupBalance, getGroupPrice, getGroupRegistrationDate } from '../lib/utils.ts';
import { useStudents, Student, useGroups, useCourses, useEmployees, useRooms } from '../lib/mockData.ts';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { items: groups, updateItem: updateGroup, deleteItem: deleteGroup } = useGroups();
  const { students: allStudents, addStudent, updateStudent, deleteStudent } = useStudents();

  const { items: courses } = useCourses();
  const { items: employees } = useEmployees();
  const { items: rooms } = useRooms();

  const group = groups.find(g => g.id === Number(id)) || {
    id: Number(id),
    name: 'Unknown Group',
    teachers: '',
    courses: '',
    rooms: '',
    students: 0,
  };

  const groupStudents = allStudents.filter(s => s.group && s.group.split(', ').includes(group.name));
  const groupBalance = groupStudents.reduce((sum, s) => sum + calculateGroupBalance(s, group.name), 0);

  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({ name: '', lastName: '', phone: '', parentName: '', parentPhone: '', dob: '', gender: 'Male', address: '', courseName: '', courseRegistrationDate: '', coursePrice: '' });
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  const [activeStudentMenu, setActiveStudentMenu] = useState<number | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [editStudentFormData, setEditStudentFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    parentName: '', 
    parentPhone: '', 
    gender: '', 
    dob: '', 
    address: '',
    courseName: '',
    courseRegistrationDate: ''
  });

  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen || studentToEdit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddModalOpen, isEditModalOpen, studentToEdit]);

  const [editFormData, setEditFormData] = useState({ name: group.name, teacher: group.teachers, course: group.courses, room: group.rooms });

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentToEdit) {
      updateStudent(studentToEdit.id, {
        ...studentToEdit,
        name: `${editStudentFormData.firstName} ${editStudentFormData.lastName}`.trim(),
        phone: editStudentFormData.phone,
        parent: editStudentFormData.parentName,
        parentPhone: editStudentFormData.parentPhone,
        gender: editStudentFormData.gender,
        dob: editStudentFormData.dob,
        address: editStudentFormData.address,
        courses: editStudentFormData.courseName,
        registration: editStudentFormData.courseRegistrationDate ? editStudentFormData.courseRegistrationDate.split('-').reverse().join('-') : ''
      });
      setStudentToEdit(null);
    }
  };

  const openEditStudentModal = (item: Student) => {
    setEditStudentFormData({ 
      firstName: item.name.split(' ')[0] || '', 
      lastName: item.name.split(' ').slice(1).join(' ') || '', 
      phone: item.phone, 
      parentName: item.parent || '', 
      parentPhone: item.parentPhone || '', 
      gender: item.gender || 'Male', 
      dob: item.dob || '', 
      address: item.address || '',
      courseName: item.courses ? item.courses.split(',')[0].trim() : '',
      courseRegistrationDate: item.registration ? item.registration.split('-').reverse().join('-') : ''
    });
    setStudentToEdit(item);
    setActiveStudentMenu(null);
  };

  const [groupEditError, setGroupEditError] = useState('');

  const handleEditGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setGroupEditError('');

    if (group.days && group.startTime && group.endTime) {
      const newStart = parseInt(group.startTime.replace(':', ''));
      const newEnd = parseInt(group.endTime.replace(':', ''));

      const hasOverlap = groups.some(g => {
        if (g.id === group.id) return false;
        if (!g.days || !g.startTime || !g.endTime) return false;
        if (g.rooms !== editFormData.room) return false;
        
        const hasCommonDay = g.days.some(d => group.days!.includes(d));
        if (!hasCommonDay) return false;
        
        const eventStart = parseInt(g.startTime.replace(':', ''));
        const eventEnd = parseInt(g.endTime.replace(':', ''));
        
        return (newStart < eventEnd && newEnd > eventStart);
      });

      if (hasOverlap) {
        setGroupEditError(t('room_time_conflict_error', 'This room is already booked for the selected time and days.'));
        return;
      }
    }

    updateGroup(Number(id), {
      name: editFormData.name,
      teachers: editFormData.teacher,
      courses: editFormData.course,
      rooms: editFormData.room,
      students: group.students
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteGroup = () => {
    deleteGroup(Number(id));
    navigate('/groups');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const groupCourse = courses.find(c => c.name === group.courses);
    const groupCoursePrice = groupCourse ? groupCourse.price : '350000 UZS';
    let coursePriceToUse = groupCoursePrice;
    if (formData.coursePrice) {
      const num = parseInt(formData.coursePrice.replace(/[^0-9]/g, ''), 10) || 0;
      coursePriceToUse = `${num} UZS`;
    }
    const initialBalance = -parseInt(coursePriceToUse.replace(/[^0-9]/g, ''), 10) || 0;

    if (addTab === 'new') {
      addStudent({
        name: `${formData.name} ${formData.lastName}`,
        balance: initialBalance,
        price: coursePriceToUse,
        registration: formData.courseRegistrationDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        lastChargedDate: formData.courseRegistrationDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        phone: formData.phone,
        gender: formData.gender,
        parent: formData.parentName,
        parentPhone: formData.parentPhone,
        dob: formData.dob,
        address: formData.address,
        courses: formData.courseName || group.courses,
        group: group.name
      });
    } else {
      const selectedStudents = allStudents.filter(s => selectedStudentIds.includes(s.id));
      selectedStudents.forEach(s => {
        const currentGroups = s.group ? s.group.split(',').map(g => g.trim()) : [];
        const currentCourses = s.courses ? s.courses.split(',').map(c => c.trim()) : [];
        const currentPrices = s.price ? s.price.split(',').map(p => p.trim()) : [];
        const currentRegistrations = s.registration ? s.registration.split(',').map(r => r.trim()) : [];
        const currentLastCharged = s.lastChargedDate ? s.lastChargedDate.split(',').map(d => d.trim()) : [];

        // Pad arrays to match currentCourses length to maintain parallel structure
        while (currentGroups.length < currentCourses.length) currentGroups.push('');
        while (currentPrices.length < currentCourses.length) currentPrices.push('0 UZS');
        while (currentRegistrations.length < currentCourses.length) currentRegistrations.push(currentRegistrations[0] || '');
        while (currentLastCharged.length < currentCourses.length) currentLastCharged.push(currentLastCharged[0] || '');

        const newCourse = formData.courseName || group.courses;
        const courseIndex = currentCourses.indexOf(newCourse);
        
        // Only proceed if student is not already in this specific group
        if (!currentGroups.includes(group.name)) {
          let actualInitialBalance = initialBalance;
          if (courseIndex !== -1 && (!currentGroups[courseIndex] || currentGroups[courseIndex] === '')) {
            // Course exists but has no group, update it
            currentGroups[courseIndex] = group.name;
            
            // Use existing price if no new price is provided
            if (!formData.coursePrice && currentPrices[courseIndex] && currentPrices[courseIndex] !== '0 UZS') {
              const existingPrice = parseInt(currentPrices[courseIndex].replace(/[^0-9]/g, ''), 10) || 0;
              actualInitialBalance = -existingPrice;
            } else {
              currentPrices[courseIndex] = coursePriceToUse;
            }
            
            if (formData.courseRegistrationDate) {
              const formattedDate = formData.courseRegistrationDate.split('-').reverse().join('-');
              currentRegistrations[courseIndex] = formattedDate;
              currentLastCharged[courseIndex] = formattedDate;
            }
          } else {
            // Add new course and group entry
            currentCourses.push(newCourse);
            currentGroups.push(group.name);
            currentPrices.push(coursePriceToUse);
            const dateToUse = formData.courseRegistrationDate ? formData.courseRegistrationDate.split('-').reverse().join('-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
            currentRegistrations.push(dateToUse);
            currentLastCharged.push(dateToUse);
          }

          updateStudent(s.id, {
            ...s,
            group: currentGroups.join(', '),
            courses: currentCourses.join(', '),
            balance: s.balance + actualInitialBalance,
            price: currentPrices.join(', '),
            registration: currentRegistrations.join(', '),
            lastChargedDate: currentLastCharged.join(', ')
          });
        }
      });
    }
    
    setIsAddModalOpen(false);
    setFormData({ name: '', lastName: '', phone: '', parentName: '', parentPhone: '', dob: '', gender: 'Male', address: '', courseName: '', courseRegistrationDate: '', coursePrice: '' });
    setSelectedStudentIds([]);
    setSearchQuery('');
  };

  const filteredExistingStudents = useMemo(() => {
    return allStudents.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !groupStudents.find(gs => gs.id === s.id)
    );
  }, [allStudents, groupStudents, searchQuery]);

  const columns = [
    { key: 'name', label: t('full_name') },
    { key: 'balance', label: t('balance') },
    { key: 'price', label: t('course_price') },
    { key: 'registration', label: t('course_registration_date') },
    { key: 'phone', label: t('phone') },
    { key: 'gender', label: t('gender') },
    { key: 'parentName', label: t('parent_name') },
    { key: 'parentPhone', label: t('parent_phone') },
    { key: 'dob', label: t('date_of_birth') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('groupDetailsVisibleColumns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore error
      }
    }
    return columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
  });

  useEffect(() => {
    localStorage.setItem('groupDetailsVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{group.name}</h1>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('teacher')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{group.teachers}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('course')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{group.courses}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('room')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{group.rooms}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('group_balance')}:</span> <span className={groupBalance < 0 ? "text-red-500" : "text-emerald-500"}>{groupBalance.toLocaleString()} UZS</span></p>
          </div>
        </div>
        <div className="flex items-start h-full relative">
          <button 
            onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
          >
            {t('actions')}
            <ChevronsUpDown className="w-4 h-4" />
          </button>
          
          {isActionsMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsActionsMenuOpen(false)} />
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                <button 
                  onClick={() => { setIsActionsMenuOpen(false); setIsEditModalOpen(true); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2"
                >
                  {t('edit_details')}
                </button>
                <button 
                  onClick={() => { setIsActionsMenuOpen(false); setIsDeleteModalOpen(true); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2"
                >
                  {t('delete')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGroup}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('students')}</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                {t('view')}
              </button>
              
              {isViewMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsViewMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {t('toggle_columns')}
                    </div>
                    {columns.map(col => (
                      <button
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                          visibleColumns[col.key] 
                            ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900" 
                            : "border-zinc-300 dark:border-zinc-700"
                        )}>
                          {visibleColumns[col.key] && <Check className="w-3 h-3" />}
                        </div>
                        <span className="flex-1">{col.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-2"
            >
              {t('add_student')}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px] pb-32">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">#</th>
                {columns.map(col => visibleColumns[col.key] && (
                  <th key={col.key} className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-300">
                      {col.label}
                      <ChevronsUpDown className="w-3 h-3" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {groupStudents.map((student, index) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group"
                >
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                  {visibleColumns.name && <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{student.name}</td>}
                  {visibleColumns.balance && (
                    <td className={`px-6 py-4 ${calculateGroupBalance(student, group.name) < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {calculateGroupBalance(student, group.name) === 0 ? '0' : calculateGroupBalance(student, group.name).toLocaleString()} UZS
                    </td>
                  )}
                  {visibleColumns.price && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{displayPrice(getGroupPrice(student.group, student.price, group.name))}</td>}
                  {visibleColumns.registration && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{getGroupRegistrationDate(student.group, student.registration, group.name)}</td>}
                  {visibleColumns.phone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.phone}</td>}
                  {visibleColumns.gender && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 capitalize">{student.gender}</td>}
                  {visibleColumns.parentName && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parent}</td>}
                  {visibleColumns.parentPhone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parentPhone}</td>}
                  {visibleColumns.dob && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.dob}</td>}
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveStudentMenu(activeStudentMenu === student.id ? null : student.id); }}
                      className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeStudentMenu === student.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveStudentMenu(null); }} />
                        <div className={cn("absolute right-8 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50", index >= groupStudents.length / 2 && groupStudents.length > 1 ? "bottom-10" : "top-10")}>
                          <Link to={`/students/${student.id}`} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('details')}</Link>
                          <Link to={`/students/${student.id}/payment`} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('payment')}</Link>
                          <button onClick={(e) => { e.stopPropagation(); openEditStudentModal(student); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('edit_details')}</button>
                          <button onClick={(e) => { e.stopPropagation(); setStudentToDelete(student.id); setActiveStudentMenu(null); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300">{t('delete')}</button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setAddTab('existing')}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                    addTab === 'existing' 
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  {t('existing')}
                </button>
                <button
                  onClick={() => setAddTab('new')}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                    addTab === 'new' 
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  {t('new')}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {addTab === 'existing' ? t('list_of_students') : t('add_new_student')}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {addTab === 'existing' ? t('select_and_add_students') : t('fill_student_details')}
              </p>
            </div>

            {addTab === 'existing' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_registration_date')}</label>
                    <input 
                      type="date" 
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.courseRegistrationDate}
                      onChange={e => setFormData({...formData, courseRegistrationDate: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_price')} ({t('optional')})</label>
                    <input 
                      type="text" 
                      value={formData.coursePrice}
                      onChange={e => setFormData({...formData, coursePrice: e.target.value})}
                      placeholder={t('e_g_price')}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder={t('search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      <tr>
                        <th className="px-4 py-3 font-bold w-12">#</th>
                        <th className="px-4 py-3 font-bold">{t('full_name')}</th>
                        <th className="px-4 py-3 font-bold">{t('course_registration_date')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-60 overflow-y-auto block w-full" style={{ display: 'table-row-group' }}>
                      {filteredExistingStudents.map((student, index) => (
                        <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="px-4 py-3">
                            <input 
                              type="checkbox" 
                              checked={selectedStudentIds.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudentIds([...selectedStudentIds, student.id]);
                                } else {
                                  setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                                }
                              }}
                              className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:ring-0"
                            />
                          </td>
                          <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{student.name}</td>
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{student.registration}</td>
                        </tr>
                      ))}
                      {filteredExistingStudents.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                            {t('no_students_found')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={handleAddSubmit}
                  disabled={selectedStudentIds.length === 0}
                  className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('save')}
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('first_name')}</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('last_name')}</label>
                    <input 
                      type="text" 
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date_of_birth')}</label>
                    <input 
                      type="date" 
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('gender')}</label>
                    <select 
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    >
                      <option value="Male">{t('male')}</option>
                      <option value="Female">{t('female')}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('phone')}</label>
                  <input 
                    type="text" 
                    required
                    maxLength={9}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('address_of_residence')}</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_name')}</label>
                    <input 
                      type="text" 
                      value={formData.parentName}
                      onChange={e => setFormData({...formData, parentName: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_phone')}</label>
                    <input 
                      type="text" 
                      maxLength={9}
                      value={formData.parentPhone}
                      onChange={e => setFormData({...formData, parentPhone: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_name')}</label>
                  <input 
                    type="text" 
                    value={formData.courseName}
                    onChange={e => setFormData({...formData, courseName: e.target.value})}
                    placeholder={group.courses}
                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_registration_date')}</label>
                    <input 
                      type="date" 
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.courseRegistrationDate}
                      onChange={e => setFormData({...formData, courseRegistrationDate: e.target.value})}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_price')}</label>
                    <input 
                      type="text" 
                      value={formData.coursePrice}
                      onChange={e => setFormData({...formData, coursePrice: e.target.value})}
                      placeholder={t('e_g_price')}
                      className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors"
                >
                  {t('save')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit_group')}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('fill_group_details')}</p>
            </div>
            {groupEditError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {groupEditError}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleEditGroup}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group_name')}</label>
                <input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2 relative">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('employees')}</label>
                <div 
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 cursor-pointer flex justify-between items-center min-h-[46px]"
                  onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                >
                  <div className="flex flex-wrap gap-2">
                    {editFormData.teacher ? editFormData.teacher.split(', ').map(teacher => (
                      <div key={teacher} className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800/50 px-2 py-1 rounded-md text-sm">
                        {teacher}
                        <button 
                          type="button" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditFormData(prev => ({
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
                    {editFormData.teacher && (
                      <button 
                        type="button" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditFormData({...editFormData, teacher: ''}); 
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
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                        {employees.filter(e => e.employeeType?.toLowerCase().includes('teacher')).filter(e => e.name.toLowerCase().includes(teacherSearch.toLowerCase())).map(employee => {
                          const isSelected = editFormData.teacher ? editFormData.teacher.split(', ').includes(employee.name) : false;
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
                                  setEditFormData(prev => {
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
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course')}</label>
                <div className="relative">
                  <select disabled value={editFormData.course} onChange={e => setEditFormData({...editFormData, course: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 focus:outline-none transition-colors appearance-none cursor-not-allowed">
                    <option value="">{t('select_course')}</option>
                    {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronsUpDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{t('cannot_change_course')}</p>
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-6">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={studentToDelete !== null}
        onClose={() => setStudentToDelete(null)}
        title={t('remove_from_group', 'Remove from Group')}
        message={t('are_you_sure_remove_student', 'Are you sure you want to remove this student from the group? The student will not be deleted from the database.')}
        onConfirm={() => {
          if (studentToDelete !== null) {
            const student = allStudents.find(s => s.id === studentToDelete);
            if (student && student.group) {
              const currentGroups = student.group.split(',').map(g => g.trim());
              const currentCourses = student.courses ? student.courses.split(',').map(c => c.trim()) : [];
              const currentPrices = student.price ? student.price.split(',').map(p => p.trim()) : [];
              const currentRegistrations = student.registration ? student.registration.split(',').map(r => r.trim()) : [];
              const currentLastCharged = student.lastChargedDate ? student.lastChargedDate.split(',').map(d => d.trim()) : [];

              const indexToRemove = currentGroups.indexOf(group.name);
              
              if (indexToRemove !== -1) {
                // Get the price to refund before removing it
                const removedPriceStr = currentPrices.length > indexToRemove ? currentPrices[indexToRemove] : '0 UZS';
                const removedPrice = parseInt(removedPriceStr.replace(/[^0-9]/g, ''), 10) || 0;

                // Remove the group but keep the course, price, etc. so they can be reused
                currentGroups[indexToRemove] = '';

                updateStudent(studentToDelete, { 
                  ...student,
                  group: currentGroups.join(', '),
                  courses: currentCourses.join(', '),
                  price: currentPrices.join(', '),
                  registration: currentRegistrations.join(', '),
                  lastChargedDate: currentLastCharged.join(', '),
                  balance: student.balance + removedPrice
                });
              }
            }
            setStudentToDelete(null);
          }
        }}
      />

      {studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setStudentToEdit(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit_student_details')}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('fill_edit_student_details')}</p>
            </div>
            <form className="space-y-4" onSubmit={handleEditStudentSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('first_name')}</label>
                <input required value={editStudentFormData.firstName} onChange={e => setEditStudentFormData({...editStudentFormData, firstName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('last_name')}</label>
                <input required value={editStudentFormData.lastName} onChange={e => setEditStudentFormData({...editStudentFormData, lastName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('role')}</label>
                <input type="text" value="Student" disabled className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 focus:outline-none transition-colors cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date_of_birth')}</label>
                  <input type="date" max={new Date().toISOString().split('T')[0]} value={editStudentFormData.dob} onChange={e => setEditStudentFormData({...editStudentFormData, dob: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('gender')}</label>
                  <select value={editStudentFormData.gender} onChange={e => setEditStudentFormData({...editStudentFormData, gender: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('phone')}</label>
                <input required maxLength={9} value={editStudentFormData.phone} onChange={e => setEditStudentFormData({...editStudentFormData, phone: e.target.value.replace(/\D/g, '')})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('address_of_residence')}</label>
                <input value={editStudentFormData.address} onChange={e => setEditStudentFormData({...editStudentFormData, address: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_name')}</label>
                <input value={editStudentFormData.parentName} onChange={e => setEditStudentFormData({...editStudentFormData, parentName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_phone')}</label>
                <input maxLength={9} value={editStudentFormData.parentPhone} onChange={e => setEditStudentFormData({...editStudentFormData, parentPhone: e.target.value.replace(/\D/g, '')})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_name')}</label>
                <input value={editStudentFormData.courseName} onChange={e => setEditStudentFormData({...editStudentFormData, courseName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_registration_date')}</label>
                <input type="date" max={new Date().toISOString().split('T')[0]} value={editStudentFormData.courseRegistrationDate} onChange={e => setEditStudentFormData({...editStudentFormData, courseRegistrationDate: e.target.value})} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-6">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
