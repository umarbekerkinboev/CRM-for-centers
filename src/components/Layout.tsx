import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CalendarDays, 
  BarChart2, 
  Users, 
  GraduationCap, 
  Contact2, 
  BookOpen, 
  LampDesk,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun,
  Languages,
  LogOut,
  LayoutDashboard,
  Settings,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider.tsx';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  subItems?: { label: string; path: string }[];
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    groups: true,
    students: true,
    employees: true,
    courses: true,
    rooms: true
  });

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const menuItems: MenuItem[] = [
    { id: 'timetable', label: t('timetable'), icon: CalendarDays, path: '/timetable' },
    { id: 'analytics', label: t('analytics'), icon: BarChart2, path: '/analytics' },
    { 
      id: 'groups', 
      label: t('groups'), 
      icon: Users, 
      path: '/groups',
      subItems: [
        { label: t('manage_groups'), path: '/groups' },
        { label: t('add_new_group'), path: '/groups/add' }
      ]
    },
    { 
      id: 'students', 
      label: t('students'), 
      icon: GraduationCap, 
      path: '/students',
      subItems: [
        { label: t('manage_students'), path: '/students' },
        { label: t('add_new_student'), path: '/students/add' }
      ]
    },
    { 
      id: 'employees', 
      label: t('employees'), 
      icon: Contact2, 
      path: '/employees',
      subItems: [
        { label: t('manage_employees'), path: '/employees' },
        { label: t('manage_employee_types'), path: '/employees/types' },
        { label: t('add_new_employee'), path: '/employees/add' }
      ]
    },
    { 
      id: 'courses', 
      label: t('courses'), 
      icon: BookOpen, 
      path: '/courses',
      subItems: [
        { label: t('manage_courses'), path: '/courses' },
        { label: t('add_new_course'), path: '/courses/add' }
      ]
    },
    { 
      id: 'rooms', 
      label: t('rooms'), 
      icon: LampDesk, 
      path: '/rooms',
      subItems: [
        { label: t('manage_rooms'), path: '/rooms' },
        { label: t('add_new_room'), path: '/rooms/add' }
      ]
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-300 flex font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] flex flex-col shrink-0 transition-all duration-300 relative z-20",
        isSidebarOpen ? "w-[260px]" : "w-[68px]"
      )}>
        <div className={cn("h-16 flex items-center border-b border-transparent shrink-0", isSidebarOpen ? "px-6" : "justify-center")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && <span className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{t('admin_dashboard')}</span>}
          </div>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-thin">
          <nav className={cn("space-y-0.5", isSidebarOpen ? "px-3" : "px-2")}>
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);

              return (
                <div key={item.id} className="relative group">
                  {item.subItems && isSidebarOpen ? (
                    <div>
                      <button
                        onClick={(e) => toggleMenu(item.id, e)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", expandedMenus[item.id] ? "rotate-180" : "")} />
                      </button>
                      {expandedMenus[item.id] && (
                        <div className="mt-1 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 space-y-1">
                          {item.subItems.map((subItem, idx) => {
                            const isSubActive = location.pathname === subItem.path;
                            return (
                              <Link
                                key={idx}
                                to={subItem.path}
                                className={cn(
                                  "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                  isSubActive ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/50" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                                )}
                              >
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isSidebarOpen ? "" : "justify-center",
                        isActive ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                    </Link>
                  )}

                  {!isSidebarOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1.5 bg-zinc-800 text-zinc-100 text-xs font-medium rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50 relative shrink-0">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-[#1a1a1a] cursor-pointer transition-colors",
              isSidebarOpen ? "justify-between px-2 py-2" : "justify-center py-2"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-zinc-200 dark:bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
                UE
              </div>
              {isSidebarOpen && (
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">Umarbek Erkinboev</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{t('admin')}</div>
                </div>
              )}
            </div>
          </div>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className={cn(
                "absolute bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-2 z-50",
                isSidebarOpen ? "bottom-full left-4 right-4 mb-2" : "left-full bottom-0 ml-2 w-48"
              )}>
                <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800/50 flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    UE
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Umarbek Erkinboev</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{t('admin')}</div>
                  </div>
                </div>
                
                <button onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  {t('account')}
                </button>
                <button onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                  <Bell className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  {t('notifications')}
                </button>
                
                <div className="h-px bg-zinc-200 dark:bg-zinc-800/50 my-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  {t('logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-200">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center"
              >
                <Languages className="w-5 h-5" />
              </button>
              
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute left-0 mt-2 w-32 bg-[#141414] border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                    <button 
                      onClick={() => changeLanguage('en')}
                      className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                    >
                      English
                    </button>
                    <button 
                      onClick={() => changeLanguage('ru')}
                      className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                    >
                      Русский
                    </button>
                    <button 
                      onClick={() => changeLanguage('uz')}
                      className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100"
                    >
                      O'zbek
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
