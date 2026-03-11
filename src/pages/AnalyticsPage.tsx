import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, GraduationCap, Contact2, BookOpen, TrendingUp, DollarSign } from 'lucide-react';
import { useGroups, useStudents, useEmployees, useCourses } from '../lib/mockData.ts';
import { Modal } from '../components/Modal.tsx';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { items: groups } = useGroups();
  const { students } = useStudents();
  const { items: employees } = useEmployees();
  const { items: courses } = useCourses();

  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [revenueTab, setRevenueTab] = useState<'overview' | 'debtors'>('overview');
  const [studentTab, setStudentTab] = useState<'recent' | 'distribution'>('recent');

  const stats = [
    { label: t('total_groups'), value: groups.length.toString(), icon: Users, trend: '+12%', color: 'bg-blue-500' },
    { label: t('total_students'), value: students.length.toString(), icon: GraduationCap, trend: '+5%', color: 'bg-emerald-500' },
    { label: t('total_employees'), value: employees.length.toString(), icon: Contact2, trend: '0%', color: 'bg-amber-500' },
    { label: t('active_courses'), value: courses.length.toString(), icon: BookOpen, trend: '+2', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('analytics')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-baseline gap-2">
                {stat.value}
                <span className="text-xs font-medium text-emerald-500">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Revenue Overview</h2>
            <button 
              onClick={() => setIsRevenueModalOpen(true)}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View details
            </button>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
              <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/20 rounded-t-md relative group">
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Student Growth</h2>
            <button 
              onClick={() => setIsStudentModalOpen(true)}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              View details
            </button>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[30, 40, 35, 50, 45, 60, 75].map((height, i) => (
              <div key={i} className="w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-t-md relative group">
                <div 
                  className="absolute bottom-0 w-full bg-emerald-500 rounded-t-md transition-all duration-500 group-hover:bg-emerald-600"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>
      </div>

      {/* Revenue Details Modal */}
      <Modal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        title="Revenue Details"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800/50">
            <button
              onClick={() => setRevenueTab('overview')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                revenueTab === 'overview' 
                  ? 'text-zinc-900 dark:text-zinc-100' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              }`}
            >
              Revenue by Course
              {revenueTab === 'overview' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setRevenueTab('debtors')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                revenueTab === 'debtors' 
                  ? 'text-zinc-900 dark:text-zinc-100' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              }`}
            >
              Outstanding Balances
              {revenueTab === 'debtors' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-t-full" />
              )}
            </button>
          </div>

          {revenueTab === 'overview' && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Course Name</th>
                    <th className="px-6 py-4 font-bold">Active Students</th>
                    <th className="px-6 py-4 font-bold">Course Price</th>
                    <th className="px-6 py-4 font-bold">Est. Monthly Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                  {courses.map(course => {
                    const courseStudents = students.filter(s => s.courses.includes(course.name));
                    const priceNum = parseInt(course.price.replace(/\D/g, '')) || 0;
                    const estimatedRevenue = courseStudents.length * priceNum;
                    return (
                      <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{course.name}</td>
                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{courseStudents.length}</td>
                        <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.price}</td>
                        <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">
                          {estimatedRevenue.toLocaleString()} UZS
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 font-bold">
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100" colSpan={3}>Total Estimated Revenue</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">
                      {courses.reduce((acc, course) => {
                        const courseStudents = students.filter(s => s.courses.includes(course.name));
                        const priceNum = parseInt(course.price.replace(/\D/g, '')) || 0;
                        return acc + (courseStudents.length * priceNum);
                      }, 0).toLocaleString()} UZS
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {revenueTab === 'debtors' && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Student Name</th>
                    <th className="px-6 py-4 font-bold">Phone</th>
                    <th className="px-6 py-4 font-bold">Parent Phone</th>
                    <th className="px-6 py-4 font-bold">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                  {students.filter(s => s.balance < 0).map(student => (
                    <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{student.name}</td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.phone}</td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parentPhone}</td>
                      <td className="px-6 py-4 text-red-600 dark:text-red-400 font-medium">
                        {student.balance.toLocaleString()} UZS
                      </td>
                    </tr>
                  ))}
                  {students.filter(s => s.balance < 0).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                        No students with outstanding balances.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Student Growth Details Modal */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Student Analytics"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800/50">
            <button
              onClick={() => setStudentTab('recent')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                studentTab === 'recent' 
                  ? 'text-zinc-900 dark:text-zinc-100' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              }`}
            >
              Recent Enrollments
              {studentTab === 'recent' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setStudentTab('distribution')}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                studentTab === 'distribution' 
                  ? 'text-zinc-900 dark:text-zinc-100' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
              }`}
            >
              Course Distribution
              {studentTab === 'distribution' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-zinc-100 rounded-t-full" />
              )}
            </button>
          </div>

          {studentTab === 'recent' && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30">
                  <tr>
                    <th className="px-6 py-4 font-bold">Student Name</th>
                    <th className="px-6 py-4 font-bold">Registration Date</th>
                    <th className="px-6 py-4 font-bold">Courses</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                  {[...students].sort((a, b) => b.id - a.id).slice(0, 10).map(student => (
                    <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{student.name}</td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.registration}</td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{student.courses}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {studentTab === 'distribution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map(course => {
                const courseStudents = students.filter(s => s.courses.includes(course.name));
                const percentage = students.length > 0 ? Math.round((courseStudents.length / students.length) * 100) : 0;
                
                return (
                  <div key={course.id} className="bg-zinc-50 dark:bg-zinc-900/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{course.name}</span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{courseStudents.length} students</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-right">
                      {percentage}% of total students
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
