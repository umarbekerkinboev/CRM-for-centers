import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, GraduationCap, Contact2, BookOpen, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
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

  const COURSE_COLORS = [
    '#e84118', // orange/red
    '#0097e6', // teal/blue
    '#273c75', // dark blue
    '#fbc531', // yellow
    '#e1b12c', // orange/brown
    '#00a8ff', // light blue
    '#192a56', // darker blue
    '#4cd137', // green
    '#9c88ff', // purple
  ];

  const groupsByCourseData = courses.map((course, index) => {
    const count = groups.filter(g => g.courses.includes(course.name)).length;
    return {
      name: course.name,
      value: count,
      fill: COURSE_COLORS[index % COURSE_COLORS.length]
    };
  }).filter(item => item.value > 0);

  const studentsByCourseData = courses.map((course, index) => {
    const count = students.filter(s => s.courses.includes(course.name)).length;
    return {
      name: course.name,
      value: count,
      fill: COURSE_COLORS[index % COURSE_COLORS.length]
    };
  }).filter(item => item.value > 0);

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
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${stat.color} shadow-sm`}
            >
              <stat.icon className="w-6 h-6" />
            </motion.div>
            <div>
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-baseline gap-2">
                {stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('courses_by_groups')}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t('courses_by_groups_desc')}</p>
          </div>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={groupsByCourseData}
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={true}
                  label={({ value }) => value}
                  stroke="none"
                >
                  {groupsByCourseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('courses_by_students')}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{t('courses_by_students_desc')}</p>
          </div>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentsByCourseData}
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={true}
                  label={({ value }) => value}
                  stroke="none"
                >
                  {studentsByCourseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Revenue Details Modal */}
      <Modal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        title={t('revenue_details')}
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
              {t('revenue_by_course')}
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
              {t('outstanding_balances')}
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
                    <th className="px-6 py-4 font-bold">{t('course_name')}</th>
                    <th className="px-6 py-4 font-bold">{t('active_students')}</th>
                    <th className="px-6 py-4 font-bold">{t('course_price')}</th>
                    <th className="px-6 py-4 font-bold">{t('est_monthly_revenue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
                  {courses.map(course => {
                    const courseStudents = students.filter(s => s.courses.includes(course.name));
                    const priceNum = parseFloat(course.price.replace(/[^\d.]/g, '')) || 0;
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
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100" colSpan={3}>{t('total_estimated_revenue')}</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">
                      {courses.reduce((acc, course) => {
                        const courseStudents = students.filter(s => s.courses.includes(course.name));
                        const priceNum = parseFloat(course.price.replace(/[^\d.]/g, '')) || 0;
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
                    <th className="px-6 py-4 font-bold">{t('student_name')}</th>
                    <th className="px-6 py-4 font-bold">{t('phone')}</th>
                    <th className="px-6 py-4 font-bold">{t('parent_phone')}</th>
                    <th className="px-6 py-4 font-bold">{t('outstanding_balance')}</th>
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
                        {t('no_students_with_outstanding_balances')}
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
        title={t('student_analytics')}
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
              {t('recent_enrollments')}
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
              {t('course_distribution')}
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
                    <th className="px-6 py-4 font-bold">{t('student_name')}</th>
                    <th className="px-6 py-4 font-bold">{t('registration_date')}</th>
                    <th className="px-6 py-4 font-bold">{t('courses')}</th>
                    <th className="px-6 py-4 font-bold">{t('status')}</th>
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
                          {t('active')}
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
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">{courseStudents.length} {t('students').toLowerCase()}</span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2.5">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 text-right">
                      {percentage}% {t('of_total_students')}
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
