import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, LayoutGrid, Check, Plus, X, Search } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useStudents, Student, useGroups, useCourses, useEmployees, useRooms } from '../lib/mockData.ts';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { items: groups, updateItem: updateGroup, deleteItem: deleteGroup } = useGroups();
  const { students: allStudents, addStudent, updateStudent } = useStudents();

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

  const groupStudents = allStudents.filter(s => s.group === group.name);
  const groupBalance = groupStudents.reduce((sum, s) => sum + s.balance, 0);

  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState<'existing' | 'new'>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({ name: '', lastName: '', phone: '', parentName: '', parentPhone: '', dob: '', gender: 'Male', address: '', courseName: '', courseRegistrationDate: '', coursePrice: '' });
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddModalOpen, isEditModalOpen]);

  const [editFormData, setEditFormData] = useState({ name: group.name, teacher: group.teachers, course: group.courses, room: group.rooms });

  const handleEditGroup = (e: React.FormEvent) => {
    e.preventDefault();
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
    if (addTab === 'new') {
      addStudent({
        name: `${formData.name} ${formData.lastName}`,
        balance: -parseInt((formData.coursePrice || '350,000 UZS').replace(/[^0-9]/g, ''), 10),
        price: formData.coursePrice || '350,000 UZS',
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
        const updates: any = {
          ...s, 
          group: group.name,
          registration: formData.courseRegistrationDate ? formData.courseRegistrationDate.split('-').reverse().join('-') : s.registration,
          lastChargedDate: formData.courseRegistrationDate ? formData.courseRegistrationDate.split('-').reverse().join('-') : s.lastChargedDate
        };
        if (formData.coursePrice) {
          updates.price = formData.coursePrice;
          updates.balance = s.balance - parseInt(formData.coursePrice.replace(/[^0-9]/g, ''), 10);
        }
        updateStudent(s.id, updates);
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

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

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
              <div className="absolute right-0 top-12 w-48 bg-[#141414] border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                <button 
                  onClick={() => { setIsActionsMenuOpen(false); setIsEditModalOpen(true); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 flex items-center gap-2"
                >
                  {t('edit_details')}
                </button>
                <button 
                  onClick={() => { setIsActionsMenuOpen(false); setIsDeleteModalOpen(true); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800/50 hover:text-red-300 flex items-center gap-2"
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
                  <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-zinc-800 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {t('toggle_columns')}
                    </div>
                    {columns.map(col => (
                      <button
                        key={col.key}
                        onClick={() => toggleColumn(col.key)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                          visibleColumns[col.key] 
                            ? "bg-zinc-100 border-zinc-100 text-zinc-900" 
                            : "border-zinc-700"
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

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {groupStudents.map((student, index) => (
                <tr 
                  key={student.id} 
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                  {visibleColumns.name && <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{student.name}</td>}
                  {visibleColumns.balance && <td className={`px-6 py-4 ${student.balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{student.balance === 0 ? '0' : student.balance.toLocaleString()} UZS</td>}
                  {visibleColumns.price && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.price}</td>}
                  {visibleColumns.registration && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.registration}</td>}
                  {visibleColumns.phone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.phone}</td>}
                  {visibleColumns.gender && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.gender}</td>}
                  {visibleColumns.parentName && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parent}</td>}
                  {visibleColumns.parentPhone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parentPhone}</td>}
                  {visibleColumns.dob && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.dob}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
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
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
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
                      value={formData.parentPhone}
                      onChange={e => setFormData({...formData, parentPhone: e.target.value})}
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
          <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 shadow-xl relative">
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
            <form className="space-y-4" onSubmit={handleEditGroup}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group_name')}</label>
                <input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('employees')}</label>
                <div className="relative">
                  <select required value={editFormData.teacher} onChange={e => setEditFormData({...editFormData, teacher: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none opacity-0 absolute inset-0 z-10 cursor-pointer">
                    <option value="">{t('select_teacher')}</option>
                    {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                  </select>
                  <div className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 flex items-center justify-between min-h-[46px]">
                    {editFormData.teacher ? (
                      <div className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800/50 px-2 py-1 rounded-md text-sm">
                        {editFormData.teacher}
                        <button type="button" onClick={(e) => { e.stopPropagation(); setEditFormData({...editFormData, teacher: ''}); }} className="hover:text-zinc-600 dark:hover:text-zinc-300">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500">{t('select_teacher')}</span>
                    )}
                    <div className="flex items-center gap-2 text-zinc-500">
                      {editFormData.teacher && <button type="button" onClick={(e) => { e.stopPropagation(); setEditFormData({...editFormData, teacher: ''}); }} className="hover:text-zinc-600 dark:hover:text-zinc-300"><X className="w-4 h-4" /></button>}
                      <ChevronsUpDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course')}</label>
                <div className="relative">
                  <select disabled value={editFormData.course} onChange={e => setEditFormData({...editFormData, course: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 focus:outline-none transition-colors appearance-none cursor-not-allowed">
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

    </div>
  );
}
