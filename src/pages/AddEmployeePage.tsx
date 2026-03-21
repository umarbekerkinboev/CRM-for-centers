import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useEmployees, useEmployeeTypes } from '../lib/mockData.ts';

export default function AddEmployeePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items: employees, addItem } = useEmployees();
  const { items: employeeTypes } = useEmployeeTypes();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: 'Employee',
    employeeType: '',
    dob: '',
    gender: '',
    phone: '',
    address: '',
    qualification: '',
    exp: '',
    joined: '',
    salary: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = formData.username.trim();
    if (trimmedUsername) {
      if (trimmedUsername.toLowerCase() === 'admin') {
        setError(t('global_admin_username_error', 'You cannot use the global admin username.'));
        return;
      }
      
      const isDuplicateUsername = employees.some(
        emp => emp.username?.toLowerCase() === trimmedUsername.toLowerCase()
      );
      if (isDuplicateUsername) {
        setError(t('duplicate_username_error', 'An employee with this username already exists.'));
        return;
      }
    }

    addItem({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone.replace(/\s/g, ''),
      qualification: formData.qualification,
      gender: formData.gender,
      exp: parseInt(formData.exp) || 0,
      dob: formData.dob,
      joined: formData.joined,
      username: trimmedUsername,
      password: formData.password,
      employeeType: formData.employeeType,
      address: formData.address,
      salary: formData.salary
    });
    navigate('/employees');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('add_new_employee')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('fill_employee_details')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('first_name')}</label>
              <input 
                type="text" 
                required
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder={t('e_g_first_name')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('last_name')}</label>
              <input 
                type="text" 
                required
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder={t('e_g_last_name')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('role')}</label>
            <input 
              type="text" 
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('employee')}
              defaultValue={t('employee')}
              disabled
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('employee_type')}</label>
            <select 
              value={formData.employeeType}
              onChange={e => setFormData({...formData, employeeType: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
            >
              <option value="">{t('select_employee_type')}</option>
              {employeeTypes.map(type => (
                <option key={type.id} value={type.type}>{type.type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('username')}</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder={t('e_g_username')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('password')}</label>
              <input 
                type="text" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder={t('e_g_password')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date_of_birth')}</label>
              <input 
                type="date" 
                required
                max={new Date().toISOString().split('T')[0]}
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('gender')}</label>
              <select 
                required
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
              >
                <option value="">{t('select_gender')}</option>
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('phone')}</label>
            <input 
              type="tel" 
              required
              maxLength={9}
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_phone')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('address_of_residence')} <span className="text-zinc-400 dark:text-zinc-500 font-normal">({t('optional')})</span>
            </label>
            <input 
              type="text" 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_address')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('qualification')}</label>
              <input 
                type="text" 
                required
                value={formData.qualification}
                onChange={e => setFormData({...formData, qualification: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder={t('e_g_degree')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('years_of_experience')}</label>
              <input 
                type="number" 
                required
                value={formData.exp}
                onChange={e => setFormData({...formData, exp: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                placeholder={t('e_g_salary')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('joined_date')}</label>
            <input 
              type="date" 
              required
              max={new Date().toISOString().split('T')[0]}
              value={formData.joined}
              onChange={e => setFormData({...formData, joined: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('salary')} <span className="text-zinc-400 dark:text-zinc-500 font-normal">({t('optional')})</span>
            </label>
            <input 
              type="number" 
              value={formData.salary}
              onChange={e => setFormData({...formData, salary: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_salary')}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            {t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}
