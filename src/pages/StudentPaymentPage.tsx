import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, Plus, X } from 'lucide-react';

export default function StudentPaymentPage() {
  const { id } = useParams();
  const { t } = useTranslation();

  // Mock data for the student
  const student = {
    id,
    name: "Farangiz Azimova",
    balance: -2000000,
  };

  const courses = [
    { id: 1, name: 'Grammar', group: 'Grammar | E-15:30-Quvonchoy', teacher: 'Quvonchoy Razzakova', price: '400,000 UZS', nextPayment: '22-03-2026', registration: '22-09-2025' },
  ];

  const initialPayments = [
    { id: 1, course: 'Grammar', amount: '400,000 UZS', type: 'Cash', date: '11-11-2025', notes: 'Sep 22 - Oct 22', addedBy: 'Umarbek Erkinboev (Admin)', editedDate: '', editedBy: '' },
  ];

  const [payments, setPayments] = useState(initialPayments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    course: '',
    amount: '0',
    type: '',
    date: '',
    notes: ''
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment = {
      id: Math.max(0, ...payments.map(p => p.id)) + 1,
      course: formData.course || 'Grammar',
      amount: formData.amount + ' UZS',
      type: formData.type || 'Cash',
      date: formData.date || new Date().toISOString().split('T')[0],
      notes: formData.notes,
      addedBy: 'Admin',
      editedDate: '',
      editedBy: ''
    };
    setPayments([...payments, newPayment]);
    setIsAddModalOpen(false);
    setFormData({ course: '', amount: '0', type: '', date: '', notes: '' });
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
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">#</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Course name</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Group name</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Teachers</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Course price</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Next payment date</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Course registration date</th>
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
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">#</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Course name</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Amount</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Payment type</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Payment date</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Notes</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Payment added by</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Edited date</th>
                <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">Edited by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {payments.map((payment, index) => (
                <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{payment.course}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.amount}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.type}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.date}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.notes}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.addedBy}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.editedDate}</td>
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{payment.editedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Add new student payment</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Fill the form with new student payment details.</p>
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
                  {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
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
