import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, Plus, X, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useStudents, useCourses, useGroups, usePayments } from '../lib/mockData.ts';
import { cn } from '../lib/utils.ts';

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
    const course = allCourses.find(c => c.name === courseName.trim());
    const group = allGroups.find(g => g.name === student.group);
    return {
      id: index + 1,
      name: courseName.trim(),
      group: student.group || 'N/A',
      teacher: group ? group.teachers : 'N/A',
      price: student.price || '0 UZS',
      nextPayment: 'N/A',
      registration: student.registration || 'N/A'
    };
  }) : [];

  const { items: allPayments, addPayment, updatePayment, deletePayment } = usePayments();
  const payments = allPayments.filter(p => p.studentId === Number(id));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editPaymentId, setEditPaymentId] = useState<number | null>(null);

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
    amount: '0',
    type: '',
    date: '',
    notes: '',
    addedBy: 'Umarbek Erkinboev (Admin)'
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
        amount: formData.amount + ' UZS',
        type: formData.type || 'Cash',
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes,
        editedDate: new Date().toISOString().split('T')[0],
        editedBy: formData.addedBy
      };
      
      updatePayment(editPaymentId, updatedPayment);
      
      if (student.id) {
        updateStudent(student.id, {
          ...student,
          balance: student.balance - oldAmount + paymentAmount
        });
      }
      setIsEditModalOpen(false);
      setEditPaymentId(null);
    } else {
      // Handle Add
      const newPayment = {
        studentId: Number(id),
        course: formData.course || 'Grammar',
        amount: formData.amount + ' UZS',
        type: formData.type || 'Cash',
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes,
        addedBy: formData.addedBy,
        editedDate: '',
        editedBy: ''
      };
      
      addPayment(newPayment);
      
      // Update student balance
      if (student.id) {
        updateStudent(student.id, {
          ...student,
          balance: student.balance + paymentAmount
        });
      }
      
      setIsAddModalOpen(false);
    }
    
    setFormData({ course: '', amount: '0', type: '', date: '', notes: '', addedBy: 'Umarbek Erkinboev (Admin)' });
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
    const paymentToDelete = payments.find(p => p.id === paymentId);
    if (paymentToDelete && student.id) {
      const amount = parseInt(paymentToDelete.amount.replace(/[^0-9]/g, ''), 10) || 0;
      updateStudent(student.id, {
        ...student,
        balance: student.balance - amount
      });
    }
    deletePayment(paymentId);
    setActiveMenu(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Payment</h1>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-500 dark:text-zinc-400">Student name:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.name}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">Balance:</span> <span className={student.balance < 0 ? "text-red-500" : "text-emerald-500"}>{student.balance.toLocaleString()} UZS</span></p>
          </div>
        </div>
        <div className="flex items-start h-full">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center gap-2"
          >
            Add payment
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Student courses</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Course name</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Group name</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Teachers</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Course price</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Next payment date</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tr-xl">Course registration date</th>
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
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Payment history</h2>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Course name</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Amount</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Payment type</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Payment date</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Notes</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Payment added by</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Edited date</th>
                <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">Edited by</th>
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
                        <div className={cn("absolute right-8 w-40 bg-[#141414] border border-zinc-800 rounded-lg shadow-xl py-1 z-50", index >= payments.length / 2 && payments.length > 1 ? "bottom-10" : "top-10")}>
                          <button onClick={(e) => { e.stopPropagation(); handleEditPayment(payment); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Edit details
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePayment(payment.id); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800/50 hover:text-red-300 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
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
                setFormData({ course: '', amount: '0', type: '', date: '', notes: '', addedBy: 'Umarbek Erkinboev (Admin)' });
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                {isEditModalOpen ? 'Edit student payment' : 'Add new student payment'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isEditModalOpen ? 'Update the payment details.' : 'Fill the form with new student payment details.'}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleAddSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Course</label>
                <select 
                  value={formData.course}
                  onChange={e => setFormData({...formData, course: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">Select course</option>
                  {allCourses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount</label>
                <input 
                  type="number" 
                  required
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="">Select payment type</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Added by</label>
                <select 
                  value={formData.addedBy}
                  onChange={e => setFormData({...formData, addedBy: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                >
                  <option value="Umarbek Erkinboev (Admin)">Umarbek Erkinboev (Admin)</option>
                  <option value="Eldor Bohramov (Admin)">Eldor Bohramov (Admin)</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes (optional)</label>
                  <span className="text-xs text-zinc-500">{formData.notes.length} / 125</span>
                </div>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  maxLength={125}
                  rows={3}
                  className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors resize-none"
                  placeholder="Payment notes..."
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
