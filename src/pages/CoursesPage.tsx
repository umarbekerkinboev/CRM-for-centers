import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, MoreVertical, LayoutGrid, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { useCourses, Course } from '../lib/mockData.ts';

type SortConfig = {
  key: keyof Course;
  direction: 'asc' | 'desc';
} | null;

export default function CoursesPage() {
  const { t } = useTranslation();
  const { items: courses, addItem, deleteItem } = useCourses();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleDuplicate = (course: Course) => {
    addItem({
      ...course,
      name: `${course.name} (Copy)`
    });
    setActiveMenu(null);
  };

  const columns = [
    { key: 'name', label: t('course_name') },
    { key: 'price', label: t('price') },
    { key: 'reference', label: t('course_material_reference') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  const handleSort = (key: keyof Course) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCourses = useMemo(() => {
    let sortableItems = [...courses];
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
  }, [sortConfig, courses]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('courses')}</h1>
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
                    Toggle columns
                  </div>
                  {columns.map(col => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        visibleColumns[col.key] 
                          ? "bg-zinc-100 border-zinc-100 text-zinc-900" 
                          : "border-zinc-700"
                      )}>
                        {visibleColumns[col.key] && <Check className="w-3 h-3" />}
                      </div>
                      {col.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link to="/courses/add" className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors">
            {t('add_course')}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
              {columns.map(col => visibleColumns[col.key] && (
                <th key={col.key} className="px-6 py-4 font-medium bg-zinc-50 dark:bg-zinc-900/30">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => handleSort(col.key as keyof Course)}
                  >
                    {col.label}
                    <ChevronsUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-tr-xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
            {sortedCourses.map((course, index) => (
              <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                {visibleColumns.name && <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{course.name}</td>}
                {visibleColumns.price && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{course.price}</td>}
                {visibleColumns.reference && (
                  <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                    {course.reference ? (
                      <a href={course.reference} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noreferrer">
                        {course.reference}
                      </a>
                    ) : null}
                  </td>
                )}
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === course.id ? null : course.id); }}
                    className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeMenu === course.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                      <div className="absolute right-8 top-10 w-40 bg-[#141414] border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100">{t('edit_details')}</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDuplicate(course); }} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100">{t('duplicate')}</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(course.id); setActiveMenu(null); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800/50 hover:text-red-300">{t('delete')}</button>
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
  );
}
