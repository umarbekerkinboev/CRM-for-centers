import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStudents, useGroups, useCourses } from '../lib/mockData.ts';

export default function AddStudentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addStudent } = useStudents();
  const { items: groups } = useGroups();
  const { items: courses } = useCourses();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    courseRegistrationDate: new Date().toISOString().split('T')[0],
    course: '',
    group: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedGroup = groups.find(g => g.name === formData.group);
    const selectedCourse = courses.find(c => c.name === (selectedGroup?.courses || formData.course));
    const coursePriceStr = selectedCourse ? selectedCourse.price : '0 UZS';
    const coursePriceValue = parseInt(coursePriceStr.replace(/[^0-9]/g, ''), 10) || 0;
    const initialBalance = selectedGroup ? -coursePriceValue : 0;

    addStudent({
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      courses: formData.course,
      group: formData.group,
      gender: formData.gender,
      parent: formData.parentName,
      parentPhone: formData.parentPhone,
      dob: formData.dob,
      address: formData.address,
      balance: 0,
      price: selectedGroup ? coursePriceStr : '',
      registration: formData.courseRegistrationDate ? formData.courseRegistrationDate.split('-').reverse().join('-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      lastChargedDate: formData.courseRegistrationDate ? formData.courseRegistrationDate.split('-').reverse().join('-') : new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    });
    navigate(-1);
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
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('add_new_student')}</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('role')}</label>
            <input 
              type="text" 
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('student')}
              defaultValue={t('student')}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course')}</label>
              <select 
                value={formData.course}
                onChange={e => setFormData({...formData, course: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
              >
                <option value="">{t('select_course')}</option>
                {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('group')}</label>
              <select 
                value={formData.group}
                onChange={e => setFormData({...formData, group: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none"
              >
                <option value="">{t('select_group')}</option>
                {groups.filter(g => !formData.course || g.courses === formData.course).map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('date_of_birth')}</label>
              <input 
                type="date" 
                max={new Date().toISOString().split('T')[0]}
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
                className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('gender')}</label>
              <select 
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
              {t('address_of_residence')}
            </label>
            <input 
              type="text" 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_address')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_registration_date')}</label>
            <input 
              type="date" 
              required
              max={new Date().toISOString().split('T')[0]}
              value={formData.courseRegistrationDate}
              onChange={e => setFormData({...formData, courseRegistrationDate: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors dark:[color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_name')}</label>
            <input 
              type="text" 
              value={formData.parentName}
              onChange={e => setFormData({...formData, parentName: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_parent_name')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('parent_phone')}</label>
            <input 
              type="tel" 
              maxLength={9}
              value={formData.parentPhone}
              onChange={e => setFormData({...formData, parentPhone: e.target.value.replace(/\D/g, '')})}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_parent_phone')}
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
