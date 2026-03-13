import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, MoreVertical, LayoutGrid, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.ts';
import { useGroups, Group, useStudents } from '../lib/mockData.ts';

type SortConfig = {
  key: keyof Group;
  direction: 'asc' | 'desc';
} | null;

export default function GroupsPage() {
  const { t } = useTranslation();
  const { items: groups, addItem, updateItem, deleteItem } = useGroups();
  const { students: allStudents } = useStudents();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [editItem, setEditItem] = useState<Group | null>(null);

  useEffect(() => {
    if (editItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editItem]);

  const [formData, setFormData] = useState({ name: '', students: 0, teachers: '' });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateItem(editItem.id, formData);
      setEditItem(null);
    }
  };

  const getGroupStats = (groupName: string) => {
    const groupStudents = allStudents.filter(s => s.group === groupName);
    const balance = groupStudents.reduce((sum, s) => sum + s.balance, 0);
    return { count: groupStudents.length, balance };
  };

  const handleDuplicate = (group: Group) => {
    addItem({
      ...group,
      name: `${group.name} (Copy)`
    });
    setActiveMenu(null);
  };

  const openEditModal = (item: Group) => {
    setFormData({ name: item.name, students: item.students, teachers: item.teachers });
    setEditItem(item);
    setActiveMenu(null);
  };

  const columns = [
    { key: 'name', label: t('group_name') },
    { key: 'students', label: t('number_of_students') },
    { key: 'balance', label: 'Group balance' },
    { key: 'teachers', label: t('teachers') },
    { key: 'courses', label: t('courses') },
    { key: 'rooms', label: t('rooms') },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    students: true,
    balance: true,
    teachers: true,
    courses: false,
    rooms: false,
  });

  const handleSort = (key: keyof Group) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedGroups = useMemo(() => {
    let sortableItems = [...groups];
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
  }, [sortConfig, groups]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('groups')}</h1>
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
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        visibleColumns[col.key] 
                          ? "bg-zinc-100 border-zinc-100 text-zinc-900" 
                          : "border-zinc-700"
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
          <Link to="/groups/add" className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors">
            {t('add_group')}
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-x-auto scrollbar-thin min-h-[300px]">
        <table className="w-full text-sm text-left">
          <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
            <tr>
              <th className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30 rounded-tl-xl">#</th>
              {columns.map(col => visibleColumns[col.key] && (
                <th key={col.key} className="px-6 py-4 font-bold bg-zinc-50 dark:bg-zinc-900/30">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => handleSort(col.key as keyof Group)}
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
            {sortedGroups.map((group, index) => {
              const stats = getGroupStats(group.name);
              return (
              <tr key={group.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                {visibleColumns.name && <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{group.name}</td>}
                {visibleColumns.students && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{stats.count}</td>}
                {visibleColumns.balance && <td className={cn("px-6 py-4 font-medium", stats.balance < 0 ? "text-red-500" : "text-emerald-500")}>{stats.balance.toLocaleString()} UZS</td>}
                {visibleColumns.teachers && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{group.teachers}</td>}
                {visibleColumns.courses && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{group.courses}</td>}
                {visibleColumns.rooms && <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{group.rooms}</td>}
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === group.id ? null : group.id); }}
                    className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeMenu === group.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenu(null); }} />
                      <div className={cn("absolute right-8 w-40 bg-[#141414] border border-zinc-800 rounded-lg shadow-xl py-1 z-50", index >= sortedGroups.length / 2 && sortedGroups.length > 1 ? "bottom-10" : "top-10")}>
                        <Link to={`/groups/${group.id}`} className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100">{t('details')}</Link>
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(group); }} className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100">{t('edit_details')}</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteItem(group.id); setActiveMenu(null); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800/50 hover:text-red-300">{t('delete')}</button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('edit_details')}</h2>
            </div>
            <form className="space-y-6" onSubmit={handleEditSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group_name')}</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('number_of_students')}</label>
                <input required value={formData.students} onChange={e => setFormData({...formData, students: parseInt(e.target.value) || 0})} type="number" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('teachers')}</label>
                <input required value={formData.teachers} onChange={e => setFormData({...formData, teachers: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors">{t('save')}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
