import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, MoreVertical, LayoutGrid, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatPrice, displayPrice } from '../lib/utils.ts';
import { useCourses, Course } from '../lib/mockData.ts';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';

type SortConfig = {
  key: keyof Course;
  direction: 'asc' | 'desc';
} | null;

export default function CoursesPage() {
  const { t } = useTranslation();
  const { items: courses, addItem, updateItem, deleteItem } = useCourses();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [editItem, setEditItem] = useState<Course | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', reference: '' });
  const [error, setError] = useState('');

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      if (courses.some(c => c.id !== editItem.id && c.name.toLowerCase() === formData.name.toLowerCase())) {
        setError(t('course_already_exists') || 'A course with this name already exists');
        return;
      }
      updateItem(editItem.id, {
        ...formData,
        price: formatPrice(formData.price)
      });
      setEditItem(null);
      setError('');
    }
  };

  const openEditModal = (item: Course) => {
    setFormData({ name: item.name, price: item.price, reference: item.reference });
    setEditItem(item);
    setActiveMenu(null);
    setError('');
  };

  const handleDuplicate = (course: Course) => {
    let newName = `${course.name} (Copy)`;
    let counter = 1;
    while (courses.some(c => c.name.toLowerCase() === newName.toLowerCase())) {
      counter++;
      newName = `${course.name} (Copy ${counter})`;
    }
    addItem({
      ...course,
      name: newName
    });
    setActiveMenu(null);
  };

  const columns = [
    { key: 'name', label: t('course_name') },
    { key: 'price', label: t('price') },
    { key: 'reference', label: t('course_material_reference') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('coursesVisibleColumns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignore error
      }
    }
    return columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {});
  });

  useEffect(() => {
    localStorage.setItem('coursesVisibleColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('courses')}</h1>
        <div className="flex flex-wrap items-center gap-3">
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
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-2 z-50">
                  <div className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {t('toggle_columns')}
                  </div>
                  {columns.map(col => (
                    <button
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        visibleColumns[col.key] 
                          ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900" 
                          : "border-zinc-300 dark:border-zinc-700"
                      )}>
                        {visibleColumns[col.key] && <Check className="w-3 h-3" />}
                      </div>
                      <span className="flex-1">{col.label}</span>
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

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px] pb-32">
        <table className="w-full text-sm text-left">
          <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
              {columns.map(col => visibleColumns[col.key] && (
                <th key={col.key} className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">
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
                {visibleColumns.price && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{displayPrice(course.price)}</td>}
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
                      <div className={cn("absolute right-8 w-40 bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50", index >= sortedCourses.length / 2 && sortedCourses.length > 1 ? "bottom-10" : "top-10")}>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(course); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('edit_details')}</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDuplicate(course); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100">{t('duplicate')}</button>
                        <button onClick={(e) => { e.stopPropagation(); setItemToDelete(course.id); setActiveMenu(null); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300">{t('delete')}</button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete !== null) {
            deleteItem(itemToDelete);
            setItemToDelete(null);
          }
        }}
      />

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setEditItem(null); setError(''); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit_details')}</h2>
            </div>
            <form className="space-y-6" onSubmit={handleEditSubmit}>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_name')}</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('price')}</label>
                <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_material_reference')}</label>
                <input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors">{t('save')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
