import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, GraduationCap, Contact2, BookOpen, TrendingUp, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const stats = [
    { label: t('total_groups'), value: '24', icon: Users, trend: '+12%', color: 'bg-blue-500' },
    { label: t('total_students'), value: '342', icon: GraduationCap, trend: '+5%', color: 'bg-emerald-500' },
    { label: t('total_employees'), value: '18', icon: Contact2, trend: '0%', color: 'bg-amber-500' },
    { label: t('active_courses'), value: '8', icon: BookOpen, trend: '+2', color: 'bg-purple-500' },
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
            <button className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">View details</button>
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
            <button className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">View details</button>
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
    </div>
  );
}
