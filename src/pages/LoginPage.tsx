import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../lib/mockData.ts';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { items: employees } = useEmployees();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Global admin check
    if (username === 'admin' && password === 'admin') {
      onLogin();
      navigate('/groups');
      return;
    }

    // Employee check
    const employee = employees.find(emp => emp.username === username && emp.password === password);
    if (employee) {
      onLogin();
      navigate('/groups');
      return;
    }

    setError(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative font-sans">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8V4H8V0H12V4H28V0H32V4H36V8H40V24C40 36 32 44 20 48C8 44 0 36 0 24V8H4ZM36 12H4V24C4 33.5 10.5 40 20 43.5C29.5 40 36 33.5 36 24V12Z" fill="white"/>
            <path d="M12 16H16V32H12V16Z" fill="white"/>
            <path d="M16 24L26 16H31L21 24L31 32H26L16 24Z" fill="white"/>
          </svg>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white leading-none tracking-wide">KINGSTON</span>
            <span className="text-sm text-white font-light tracking-wide mt-1">learning center</span>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="text-zinc-400 hover:text-zinc-100 transition-colors flex items-center"
          >
            <Languages className="w-5 h-5" />
          </button>
          
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
              <button onClick={() => changeLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">{t('english')}</button>
              <button onClick={() => changeLanguage('ru')} className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">{t('russian')}</button>
              <button onClick={() => changeLanguage('uz')} className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">{t('uzbek')}</button>
            </div>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-6 right-6 bg-red-950/50 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-red-900/50 flex items-center justify-center text-xs font-bold">!</div>
          <div>
            <div className="font-medium text-sm">{t('login_error_title')}</div>
            <div className="text-xs opacity-80">{t('login_error_desc')}</div>
          </div>
          <button onClick={() => setError(false)} className="ml-4 text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {/* Login Card */}
      <div className="w-full max-w-[400px] bg-[#141414] border border-zinc-800/50 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold text-zinc-100 text-center mb-8">{t('login_to_account')}</h1>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{t('username')}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="admin"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{t('password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="admin"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-200 hover:bg-white text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-2"
          >
            {t('login_button')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          {t('forgot_password_msg')}
        </div>
      </div>
    </div>
  );
}
