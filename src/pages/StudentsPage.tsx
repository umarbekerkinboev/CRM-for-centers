import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, MoreVertical, LayoutGrid, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';

const mockStudents = [
  { id: 1, name: 'Behruz Ibodullayev', phone: '505043093', courses: 'General English', gender: 'Male', parent: 'Dilfuza Xudoyberganova', parentPhone: '94...' },
  { id: 2, name: 'Jasmina To\'rayeva', phone: '949848177', courses: 'Matematika\nCEFR', gender: 'Female', parent: 'Raximova Gulasal', parentPhone: '95...' },
  { id: 3, name: 'Shaxnoza Matsapoyeva', phone: '886000421', courses: 'Pre-IELTS', gender: 'Female', parent: 'Murod Xolmurodov', parentPhone: '97...' },
  { id: 4, name: 'Marjona Taganova', phone: '956566131', courses: 'Pre-IELTS', gender: 'Female', parent: 'Marjona Taganova', parentPhone: '95...' },
];

type SortConfig = {
  key: keyof typeof mockStudents[0];
  direction: 'asc' | 'desc';
} | null;

export default function StudentsPage() {
  const { t } = useTranslation();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  const columns = [
    { key: 'name', label: t('full_name') },
    { key: 'phone', label: t('phone') },
    { key: 'courses', label: t('courses') },
    { key: 'gender', label: t('gender') },
    { key: 'parent', label: t('parent_name') },
    { key: 'parentPhone', label: t('parent_phone') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  const handleSort = (key: keyof typeof mockStudents[0]) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = useMemo(() => {
    let sortableItems = [...mockStudents];
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
  }, [sortConfig]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('students')}</h1>
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
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Toggle columns
                </div>
                {columns.map(col => (
                  <button
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                      visibleColumns[col.key] 
                        ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-zinc-900" 
                        : "border-zinc-300 dark:border-zinc-700"
                    )}>
                      {visibleColumns[col.key] && <Check className="w-3 h-3" />}
                    </div>
                    {col.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Link to="/students/add" className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors">
            {t('add_student')}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-medium">#</th>
              {columns.map(col => visibleColumns[col.key] && (
                <th key={col.key} className="px-6 py-4 font-medium">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => handleSort(col.key as keyof typeof mockStudents[0])}
                  >
                    {col.label}
                    <ChevronsUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
            {sortedStudents.map((student, index) => (
              <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                {visibleColumns.name && <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{student.name}</td>}
                {visibleColumns.phone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.phone}</td>}
                {visibleColumns.courses && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{student.courses}</td>}
                {visibleColumns.gender && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.gender}</td>}
                {visibleColumns.parent && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parent}</td>}
                {visibleColumns.parentPhone && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{student.parentPhone}</td>}
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)}
                    className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeMenu === student.id && (
                    <div className="absolute right-8 top-10 w-40 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-10">
                      <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">{t('details')}</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">{t('edit_details')}</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">{t('delete')}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
