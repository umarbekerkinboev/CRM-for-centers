import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, Plus, X, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useStudents, useCourses, useGroups, usePayments } from '../lib/mockData.ts';
import { cn, displayPrice } from '../lib/utils.ts';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

export default function StudentPaymentPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { students, updateStudent } = useStudents();
  const { items: allCourses } = useCourses();
  const { items: allGroups } = useGroups();

  // Mock data for the student
  const student = students.find(s => s.id === Number(id)) || {
    id: Number(id),
    name: "Unknown Student",
    balance: 0,
    courses: '',
    group: '',
    price: '0 UZS',
    registration: ''
  };

  const courses = student.courses ? student.courses.split(',').map((courseName, index) => {
    const courseNameTrimmed = courseName.trim();
    const course = allCourses.find(c => c.name === courseNameTrimmed);
    const groupNames = student.group ? student.group.split(',').map(g => g.trim()) : [];
    
    // Find the correct group for this course
    let groupName = 'N/A';
    let groupIndex = index;
    
    // First, check if the group at the same index matches the course
    const groupAtIndex = allGroups.find(g => g.name === groupNames[index]);
    if (groupAtIndex && groupAtIndex.courses === courseNameTrimmed) {
      groupName = groupNames[index];
    } else {
      // Otherwise, search all groups the student is in to find one that matches this course
      const matchingGroupIndex = groupNames.findIndex(gn => {
        const g = allGroups.find(group => group.name === gn);
        return g && g.courses === courseNameTrimmed;
      });
      if (matchingGroupIndex !== -1) {
        groupName = groupNames[matchingGroupIndex];
        groupIndex = matchingGroupIndex;
      } else {
        // Fallback to the index if it exists and we haven't found a match
        // But only if that group doesn't belong to another course we have!
        const fallbackGroup = allGroups.find(g => g.name === groupNames[index]);
        const studentCourses = student.courses.split(',').map(c => c.trim());
        if (fallbackGroup && studentCourses.includes(fallbackGroup.courses)) {
           // This group belongs to another course the student has, so don't use it here
           groupName = 'N/A';
        } else {
           groupName = groupNames[index] || 'N/A';
        }
      }
    }
    
    const group = allGroups.find(g => g.name === groupName);
    
    const registration = student.registration ? student.registration.split(',')[groupIndex]?.trim() || student.registration.split(',')[0]?.trim() || 'N/A' : 'N/A';

    let nextPayment = 'N/A';
    if (registration !== 'N/A') {
      const parts = registration.split('-');
      if (parts.length === 3) {
        const regDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const now = new Date();
        
        let monthsPassed = (now.getFullYear() - regDate.getFullYear()) * 12 + (now.getMonth() - regDate.getMonth());
        if (now.getDate() < regDate.getDate()) {
          monthsPassed--;
        }
        
        const chargesCount = Math.max(0, monthsPassed + 1);
        
        const nextDate = new Date(regDate);
        nextDate.setMonth(nextDate.getMonth() + chargesCount);
        nextPayment = `${nextDate.getDate().toString().padStart(2, '0')}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}-${nextDate.getFullYear()}`;
      }
    }

    return {
      id: index + 1,
      name: courseNameTrimmed,
      group: groupName,
      teacher: group ? group.teachers : 'N/A',
      price: student.price ? student.price.split(',')[groupIndex]?.trim() || student.price.split(',')[0]?.trim() || '0 UZS' : '0 UZS',
      nextPayment,
      registration,
      isActive: !!group
    };
  }) : [];

  const { items: allPayments, addItem: addPayment, updateItem: updatePayment, deleteItem: deletePayment } = usePayments();
  const payments = allPayments.filter(p => p.studentId === Number(id));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { user } = useAuth();
  const currentUserString = `${user?.name} (${user?.role})`;

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

  const [formData, setFormData] = useState({
    course: '',
    amount: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    addedBy: currentUserString
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseInt(formData.amount.replace(/,/g, ''), 10) || 0;
    
    if (editPaymentId) {
      // Handle Edit
      const oldPayment = payments.find(p => p.id === editPaymentId);
      const oldAmount = oldPayment ? parseInt(oldPayment.amount.replace(/[^0-9]/g, ''), 10) : 0;
      
      const updatedPayment = {
        course: formData.course || 'Grammar',
        amount: paymentAmount.toLocaleString() + ' UZS',
        type: formData.type || 'Cash',
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes,
        editedDate: new Date().toISOString().split('T')[0],
        editedBy: currentUserString
      };
      
      updatePayment(editPaymentId, updatedPayment);
      
      setIsEditModalOpen(false);
      setEditPaymentId(null);
    } else {
      // Handle Add
      const newPayment = {
        studentId: Number(id),
        course: formData.course || 'Grammar',
        amount: paymentAmount.toLocaleString() + ' UZS',
        type: formData.type || 'Cash',
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes,
        addedBy: currentUserString,
        editedDate: '',
        editedBy: ''
      };
      
      addPayment(newPayment);
      
      setIsAddModalOpen(false);
    }
    
    setFormData({ course: '', amount: '', type: '', date: new Date().toISOString().split('T')[0], notes: '', addedBy: currentUserString });
  };

  const handleEditPayment = (payment: any) => {
    setFormData({
      course: payment.course,
      amount: payment.amount.replace(/[^0-9]/g, ''),
      type: payment.type,
      date: payment.date,
      notes: payment.notes,
      addedBy: payment.addedBy
    });
    setEditPaymentId(payment.id);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeletePayment = (paymentId: number) => {
    setItemToDelete(paymentId);
    setActiveMenu(null);
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      deletePayment(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{t('payment')}</h1>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('student_name')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.name}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('balance')}:</span> <span className={student.balance < 0 ? "text-red-500" : "text-emerald-500"}>{student.balance.toLocaleString()} UZS</span></p>
          </div>
        </div>
        <div className="flex items-start h-full">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-2"
          >
            {t('add_payment')}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('student_courses')}</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px] pb-32">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('course_name')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('group_name')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('teachers')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('course_price')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('next_payment_date')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('course_registration_date')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tr-xl">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {courses.map((course, index) => (
                <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{course.name}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.group}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.teacher}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{displayPrice(course.price)}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.nextPayment}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.registration}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      course.isActive 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                    )}>
                      {course.isActive ? t('active') : t('passive')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('payment_history')}</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px] pb-32">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('course_name')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('amount')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('payment_type')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('payment_date')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('notes')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('payment_added_by')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('edited_date')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">{t('edited_by')}</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {payments.map((payment, index) => (
                <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{payment.course}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.amount}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.type}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.date}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.notes}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.addedBy}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.editedDate}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.editedBy}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === payment.id ? null : payment.id); }}
                      className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeMenu === payment.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                        <div className={cn("absolute right-8 w-40 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50", index >= payments.length / 2 && payments.length > 1 ? "bottom-10" : "top-10")}>
                          <button onClick={(e) => { e.stopPropagation(); handleEditPayment(payment); }} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            {t('edit_details')}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePayment(payment.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            {t('delete')}
                          </button>
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

      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditPaymentId(null);
                setFormData({ course: '', amount: '', type: '', date: new Date().toISOString().split('T')[0], notes: '', addedBy: currentUserString });
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {isEditModalOpen ? t('edit_payment') : t('add_new_student_payment')}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isEditModalOpen ? t('update_payment_details') : t('fill_new_student_payment_details')}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleAddSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course')}</label>
                <select 
                  value={formData.course}
                  onChange={e => setFormData({...formData, course: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">{t('select_course')}</option>
                  {allCourses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('amount')}</label>
                <input 
                  type="number" 
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('payment_type')}</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">{t('select_payment_type')}</option>
                  <option value="Cash">{t('cash')}</option>
                  <option value="Card">{t('card')}</option>
                  <option value="Transfer">{t('transfer')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date')}</label>
                <input 
                  type="date" 
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('added_by')}</label>
                <input 
                  type="text"
                  value={formData.addedBy}
                  disabled
                  className="w-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('notes')} ({t('optional')})</label>
                  <span className="text-xs text-zinc-500">{formData.notes.length} / 125</span>
                </div>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  maxLength={125}
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none"
                  placeholder={t('payment_notes')}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors"
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
        onConfirm={confirmDelete}
      />
    </div>
  );
}
