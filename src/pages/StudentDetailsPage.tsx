import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, X, DollarSign, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useStudents, useCourses, useGroups, usePayments } from '../lib/mockData.ts';
import { cn } from '../lib/utils.ts';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { students, updateStudent, deleteStudent } = useStudents();
  const { items: allCourses } = useCourses();
  const { items: allGroups } = useGroups();

  const student = students.find(s => s.id === Number(id)) || {
    id: Number(id),
    name: "Unknown Student",
    phone: '',
    parentName: '',
    parentPhone: '',
    gender: '',
    dob: '',
    address: '',
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
    const lastChargedDateStr = student.lastChargedDate ? student.lastChargedDate.split(',')[groupIndex]?.trim() || student.lastChargedDate.split(',')[0]?.trim() || registration : registration;

    let nextPayment = 'N/A';
    if (lastChargedDateStr !== 'N/A') {
      const parts = lastChargedDateStr.split('-');
      if (parts.length === 3) {
        const lastCharged = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const nextDate = new Date(lastCharged);
        nextDate.setMonth(nextDate.getMonth() + 1);
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
      registration
    };
  }).filter(c => c.group !== 'N/A' || student.courses.split(',').length === 1) : [];

  const { items: allPayments, addItem: addPayment, updateItem: updatePayment, deleteItem: deletePayment } = usePayments();
  const payments = allPayments.filter(p => p.studentId === Number(id));
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [editPaymentData, setEditPaymentData] = useState({
    course: '',
    amount: '0',
    type: '',
    date: '',
    notes: '',
    addedBy: 'Umarbek Erkinboev (Admin)'
  });

  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);

  useEffect(() => {
    if (isEditModalOpen || isEditPaymentModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditModalOpen, isEditPaymentModalOpen]);

  const handleEditPayment = (payment: any) => {
    setEditPaymentData({
      course: payment.course,
      amount: payment.amount.replace(/[^0-9]/g, ''),
      type: payment.type,
      date: payment.date,
      notes: payment.notes,
      addedBy: payment.addedBy
    });
    setEditPaymentId(payment.id);
    setIsEditPaymentModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeletePayment = (paymentId: number) => {
    setItemToDelete(paymentId);
    setActiveMenu(null);
  };

  const confirmDeletePayment = () => {
    if (itemToDelete !== null) {
      const paymentToDelete = payments.find(p => p.id === itemToDelete);
      if (paymentToDelete && student.id) {
        const amount = parseInt(paymentToDelete.amount.replace(/[^0-9]/g, ''), 10) || 0;
        updateStudent(student.id, {
          ...student,
          balance: student.balance - amount
        });
      }
      deletePayment(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleEditPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseInt(editPaymentData.amount.replace(/,/g, ''), 10) || 0;
    
    if (editPaymentId) {
      const oldPayment = payments.find(p => p.id === editPaymentId);
      const oldAmount = oldPayment ? parseInt(oldPayment.amount.replace(/[^0-9]/g, ''), 10) : 0;
      
      const updatedPayment = {
        course: editPaymentData.course || 'Grammar',
        amount: editPaymentData.amount + ' UZS',
        type: editPaymentData.type || 'Cash',
        date: editPaymentData.date || new Date().toISOString().split('T')[0],
        notes: editPaymentData.notes,
        editedDate: new Date().toISOString().split('T')[0],
        editedBy: editPaymentData.addedBy
      };
      
      updatePayment(editPaymentId, updatedPayment);
      
      if (student.id) {
        updateStudent(student.id, {
          ...student,
          balance: student.balance - oldAmount + paymentAmount
        });
      }
      setIsEditPaymentModalOpen(false);
      setEditPaymentId(null);
    }
  };

  const [editFormData, setEditFormData] = useState({ 
    firstName: student.name.split(' ')[0] || '', 
    lastName: student.name.split(' ').slice(1).join(' ') || '', 
    phone: student.phone, 
    parentName: student.parent, 
    parentPhone: student.parentPhone, 
    gender: student.gender, 
    dob: student.dob, 
    address: student.address,
    courseName: student.courses ? student.courses.split(',')[0].trim() : '',
    courseRegistrationDate: student.registration ? student.registration.split(',')[0].trim().split('-').reverse().join('-') : '',
    coursePrice: student.price ? student.price.split(',')[0].trim().replace(/[^0-9]/g, '') : ''
  });

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentCourses = student.courses ? student.courses.split(',').map(c => c.trim()) : [];
    const currentPrices = student.price ? student.price.split(',').map(p => p.trim()) : [];
    const currentRegistrations = student.registration ? student.registration.split(',').map(r => r.trim()) : [];
    
    if (currentCourses.length > 0) {
      currentCourses[0] = editFormData.courseName;
      currentPrices[0] = editFormData.coursePrice ? `${parseInt(editFormData.coursePrice).toLocaleString()} UZS` : '0 UZS';
      currentRegistrations[0] = editFormData.courseRegistrationDate ? editFormData.courseRegistrationDate.split('-').reverse().join('-') : '';
    } else if (editFormData.courseName) {
      currentCourses.push(editFormData.courseName);
      currentPrices.push(editFormData.coursePrice ? `${parseInt(editFormData.coursePrice).toLocaleString()} UZS` : '0 UZS');
      currentRegistrations.push(editFormData.courseRegistrationDate ? editFormData.courseRegistrationDate.split('-').reverse().join('-') : '');
    }

    updateStudent(Number(id), {
      ...student,
      name: `${editFormData.firstName} ${editFormData.lastName}`.trim(),
      phone: editFormData.phone,
      parent: editFormData.parentName,
      parentPhone: editFormData.parentPhone,
      gender: editFormData.gender,
      dob: editFormData.dob,
      address: editFormData.address,
      courses: currentCourses.join(', '),
      registration: currentRegistrations.join(', '),
      price: currentPrices.join(', ')
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteStudent = () => {
    setIsDeleteStudentModalOpen(true);
    setIsActionsMenuOpen(false);
  };

  const confirmDeleteStudent = () => {
    deleteStudent(Number(id));
    navigate('/students');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{student.name}</h1>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('phone')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.phone}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('parent_name')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.parent}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('parent_phone')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.parentPhone}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('gender')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.gender}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('date_of_birth')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.dob}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('address_of_residence')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.address}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('course_registration_date')}:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.registration || 'N/A'}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">{t('balance')}:</span> <span className={student.balance < 0 ? "text-red-500" : "text-emerald-500"}>{student.balance.toLocaleString()} UZS</span></p>
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
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                <Link 
                  to={`/students/${student.id}/payment`}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  {t('payment')}
                </Link>
                <button 
                  onClick={() => { setIsActionsMenuOpen(false); setIsEditModalOpen(true); }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {t('edit_details')}
                </button>
                <button 
                  onClick={() => { setIsActionsMenuOpen(false); handleDeleteStudent(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('delete')}
                </button>
              </div>
            </>
          )}
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
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tr-xl">{t('course_registration_date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {courses.map((course, index) => (
                <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{course.name}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.group}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.teacher}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.price}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.nextPayment}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.registration}</td>
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
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 shadow-xl relative my-auto">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit_student')}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('fill_student_details')}</p>
            </div>
            <form className="space-y-4" onSubmit={handleEditStudent}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('first_name')}</label>
                <input required value={editFormData.firstName} onChange={e => setEditFormData({...editFormData, firstName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('last_name')}</label>
                <input required value={editFormData.lastName} onChange={e => setEditFormData({...editFormData, lastName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('role')}</label>
                <input type="text" value={t('student')} disabled className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 focus:outline-none transition-colors cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date_of_birth')}</label>
                  <input type="date" value={editFormData.dob} onChange={e => setEditFormData({...editFormData, dob: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('gender')}</label>
                  <select value={editFormData.gender} onChange={e => setEditFormData({...editFormData, gender: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('phone')}</label>
                <input required maxLength={9} value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value.replace(/\D/g, '')})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('address_of_residence')}</label>
                <input value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_name')}</label>
                <input value={editFormData.parentName} onChange={e => setEditFormData({...editFormData, parentName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_phone')}</label>
                <input maxLength={9} value={editFormData.parentPhone} onChange={e => setEditFormData({...editFormData, parentPhone: e.target.value.replace(/\D/g, '')})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_name')}</label>
                <input value={editFormData.courseName} onChange={e => setEditFormData({...editFormData, courseName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_registration_date')}</label>
                <input type="date" value={editFormData.courseRegistrationDate} onChange={e => setEditFormData({...editFormData, courseRegistrationDate: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_price')}</label>
                <input type="number" value={editFormData.coursePrice} onChange={e => setEditFormData({...editFormData, coursePrice: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-6">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      {isEditPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsEditPaymentModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit_payment')}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('update_payment_details')}</p>
            </div>
            <form className="space-y-4" onSubmit={handleEditPaymentSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course')}</label>
                <select 
                  value={editPaymentData.course}
                  onChange={e => setEditPaymentData({...editPaymentData, course: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
                >
                  <option value="">{t('select_course')}</option>
                  {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('amount')}</label>
                <input 
                  type="number" 
                  required
                  value={editPaymentData.amount}
                  onChange={e => setEditPaymentData({...editPaymentData, amount: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('payment_type')}</label>
                  <select 
                    value={editPaymentData.type}
                    onChange={e => setEditPaymentData({...editPaymentData, type: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
                  >
                    <option value="Cash">{t('cash')}</option>
                    <option value="Card">{t('card')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date')}</label>
                  <input 
                    type="date" 
                    required
                    value={editPaymentData.date}
                    onChange={e => setEditPaymentData({...editPaymentData, date: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('notes')} ({t('optional')})</label>
                <input 
                  type="text" 
                  value={editPaymentData.notes}
                  onChange={e => setEditPaymentData({...editPaymentData, notes: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                  placeholder={t('payment_notes')}
                />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-6">{t('save_changes')}</button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDeletePayment}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteStudentModalOpen}
        onClose={() => setIsDeleteStudentModalOpen(false)}
        onConfirm={confirmDeleteStudent}
      />
    </div>
  );
}
