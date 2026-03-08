import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown } from 'lucide-react';
import { useStudents } from '../lib/mockData.ts';

export default function StudentDetailsPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { students } = useStudents();

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
  };

  const courses = [
    { id: 1, name: 'CEFR', group: 'CEFR | O-15:30-Suhrob', teacher: 'Suhrob Shuhratov', price: '400,000 UZS', nextPayment: '14-03-2026', registration: '14-11-2025' },
    { id: 2, name: 'Matematika', group: 'Matematika | O-14:00-Aziza', teacher: "Aziza Ro'zmatova", price: '400,000 UZS', nextPayment: '15-03-2026', registration: '15-09-2025' },
  ];

  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: student.name, phone: student.phone, parentName: student.parent || student.parentName, parentPhone: student.parentPhone, gender: student.gender, dob: student.dob, address: student.address });

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, update the student here
    setIsEditModalOpen(false);
  };

  const handleDeleteStudent = () => {
    // In a real app, delete the student here
    // navigate('/students');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{student.name}</h1>
          <div className="space-y-1 text-sm">
            <p><span className="text-zinc-500 dark:text-zinc-400">Phone:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.phone}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">Parent name:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.parent || student.parentName}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">Parent phone:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.parentPhone}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">Gender:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.gender}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">Date of birth:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.dob}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">Address of residence:</span> <span className="text-zinc-900 dark:text-zinc-100">{student.address}</span></p>
            <p><span className="text-zinc-500 dark:text-zinc-400">Balance:</span> <span className="text-emerald-500">{student.balance} UZS</span></p>
          </div>
        </div>
        <div className="flex items-start h-full relative">
          <button 
            onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
          >
            Actions
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
                  Edit details
                </button>
                <button 
                  onClick={() => { setIsActionsMenuOpen(false); handleDeleteStudent(); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800/50 hover:text-red-300 flex items-center gap-2"
                >
                  Delete
                </button>
              </div>
            </>
          )}
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
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Edit student details</h2>
            </div>
            <form className="space-y-4" onSubmit={handleEditStudent}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full name</label>
                <input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
                <input required value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors">Save</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
