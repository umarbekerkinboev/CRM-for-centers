import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, MoreVertical, LayoutGrid, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { useStudents, Student, useCourses, useGroups } from '../lib/mockData.ts';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';

type SortConfig = {
  key: keyof Student;
  direction: 'asc' | 'desc';
} | null;

export default function StudentsPage() {
  const { t } = useTranslation();
  const { students, updateStudent, deleteStudent } = useStudents();
  const { items: allCourses } = useCourses();
  const { items: allGroups } = useGroups();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [editItem, setEditItem] = useState<Student | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (editItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editItem]);

  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    parentName: '', 
    parentPhone: '', 
    gender: '', 
    dob: '', 
    address: '',
    course: '',
    group: '',
    courseRegistrationDate: new Date().toISOString().split('T')[0]
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      const currentCourses = editItem.courses ? editItem.courses.split(',').map(c => c.trim()) : [];
      const currentGroups = editItem.group ? editItem.group.split(',').map(g => g.trim()) : [];
      const currentPrices = editItem.price ? editItem.price.split(',').map(p => p.trim()) : [];
      const currentRegistrations = editItem.registration ? editItem.registration.split(',').map(r => r.trim()) : [];
      
      const selectedGroup = allGroups.find(g => g.name === formData.group);
      const selectedCourse = allCourses.find(c => c.name === (selectedGroup?.courses || formData.course));
      const coursePriceStr = selectedCourse ? selectedCourse.price : '0 UZS';

      const oldGroup = currentGroups[0] || '';
      const newGroup = formData.group;
      let balanceChange = 0;

      if (oldGroup !== newGroup) {
        if (oldGroup) {
          const oldGroupObj = allGroups.find(g => g.name === oldGroup);
          const oldCourseObj = allCourses.find(c => c.name === oldGroupObj?.courses);
          const oldPrice = oldCourseObj ? parseInt(oldCourseObj.price.replace(/[^0-9]/g, ''), 10) : 0;
          balanceChange += oldPrice;
        }
        if (newGroup) {
          const newPrice = selectedCourse ? parseInt(selectedCourse.price.replace(/[^0-9]/g, ''), 10) : 0;
          balanceChange -= newPrice;
        }
      }

      if (currentCourses.length > 0) {
        if (currentCourses[0] !== formData.course || currentGroups[0] !== formData.group) {
          currentCourses[0] = formData.course;
          currentGroups[0] = formData.group;
          currentPrices[0] = coursePriceStr;
        }
        currentRegistrations[0] = formData.courseRegistrationDate ? formData.courseRegistrationDate.split('-').reverse().join('-') : currentRegistrations[0];
      } else if (formData.course) {
        currentCourses.push(formData.course);
        currentGroups.push(formData.group);
        currentPrices.push(coursePriceStr);
        currentRegistrations.push(formData.courseRegistrationDate ? formData.courseRegistrationDate.split('-').reverse().join('-') : '');
      }

      updateStudent(editItem.id, {
        ...editItem,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        parent: formData.parentName,
        parentPhone: formData.parentPhone,
        gender: formData.gender,
        dob: formData.dob,
        address: formData.address,
        courses: currentCourses.join(', '),
        group: currentGroups.join(', '),
        price: currentPrices.join(', '),
        registration: currentRegistrations.join(', '),
        balance: editItem.balance + balanceChange
      });
      setEditItem(null);
    }
  };

  const openEditModal = (item: Student) => {
    let formattedDate = '';
    if (item.registration) {
      const firstRegistration = item.registration.split(',')[0].trim();
      const parts = firstRegistration.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 2) {
          formattedDate = parts.reverse().join('-');
        } else {
          formattedDate = firstRegistration;
        }
      }
    }

    setFormData({ 
      firstName: item.name.split(' ')[0] || '', 
      lastName: item.name.split(' ').slice(1).join(' ') || '', 
      phone: item.phone, 
      parentName: item.parent || '', 
      parentPhone: item.parentPhone || '', 
      gender: item.gender || 'Male', 
      dob: item.dob || '', 
      address: item.address || '',
      course: item.courses ? item.courses.split(',')[0].trim() : '',
      group: item.group ? item.group.split(',')[0].trim() : '',
      courseRegistrationDate: formattedDate || new Date().toISOString().split('T')[0]
    });
    setEditItem(item);
    setActiveMenu(null);
  };
  
  const columns = [
    { key: 'name', label: t('full_name') },
    { key: 'phone', label: t('phone') },
    { key: 'courses', label: t('courses') },
    { key: 'gender', label: t('gender') },
    { key: 'parent', label: t('parent_name') },
    { key: 'parentPhone', label: t('parent_phone') },
    { key: 'dob', label: t('date_of_birth') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('students_visible_columns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      name: true,
      phone: true,
      courses: true,
      gender: false,
      parent: false,
      parentPhone: false,
      dob: false,
    };
  });

  const handleSort = (key: keyof Student) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    let sortableItems = [...students];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig, students]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('students_visible_columns', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('students')}</h1>
        <div className="flex flex-wrap items-center gap-3">
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
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-2 z-50">
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
          <Link to="/students/add" className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors">
            {t('add_student')}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px] pb-32">
        <table className="w-full text-sm text-left">
          <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
              {columns.map(col => visibleColumns[col.key] && (
                <th key={col.key} className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => handleSort(col.key as keyof Student)}
                  >
                    {col.label}
                    <ChevronsUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-tr-xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
            {sortedStudents.map((student, index) => (
              <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                {visibleColumns.name && <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{student.name}</td>}
                {visibleColumns.phone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.phone}</td>}
                {visibleColumns.courses && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{student.courses}</td>}
                {visibleColumns.gender && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 capitalize">{student.gender}</td>}
                {visibleColumns.parent && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parent}</td>}
                {visibleColumns.parentPhone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parentPhone}</td>}
                {visibleColumns.dob && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.dob}</td>}
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === student.id ? null : student.id); }}
                    className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeMenu === student.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                      <div className={cn("absolute right-8 w-40 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50", index >= sortedStudents.length / 2 && sortedStudents.length > 1 ? "bottom-10" : "top-10")}>
                        <Link to={`/students/${student.id}`} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('details')}</Link>
                        <Link to={`/students/${student.id}/payment`} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('payment')}</Link>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(student); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('edit_details')}</button>
                        <button onClick={(e) => { e.stopPropagation(); setItemToDelete(student.id); setActiveMenu(null); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300">{t('delete')}</button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete !== null) {
            deleteStudent(itemToDelete);
            setItemToDelete(null);
          }
        }}
      />

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit_student_details')}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('fill_edit_student_details')}</p>
            </div>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('first_name')}</label>
                <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('last_name')}</label>
                <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('role')}</label>
                <input type="text" value="Student" disabled className="w-full bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 focus:outline-none transition-colors cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date_of_birth')}</label>
                  <input type="date" max={new Date().toISOString().split('T')[0]} value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('gender')}</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('phone')}</label>
                <input required maxLength={9} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('address_of_residence')}</label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_name')}</label>
                <input value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_phone')}</label>
                <input maxLength={9} value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value.replace(/\D/g, '')})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course')}</label>
                <select 
                  value={formData.course}
                  onChange={e => setFormData({...formData, course: e.target.value, group: ''})}
                  className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
                >
                  <option value="">{t('select_course')}</option>
                  {allCourses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group')}</label>
                <select 
                  value={formData.group}
                  onChange={e => setFormData({...formData, group: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
                  disabled={!formData.course}
                >
                  <option value="">{t('select_group')}</option>
                  {allGroups
                    .filter(g => g.courses === formData.course)
                    .map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_registration_date')}</label>
                <input type="date" max={new Date().toISOString().split('T')[0]} value={formData.courseRegistrationDate} onChange={e => setFormData({...formData, courseRegistrationDate: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-6">{t('save')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
