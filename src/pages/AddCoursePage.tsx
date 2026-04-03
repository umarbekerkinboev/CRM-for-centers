import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCourses } from '../lib/mockData.ts';
import { formatPrice } from '../lib/utils.ts';

export default function AddCoursePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items: courses, addItem } = useCourses();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    reference: string;
    duration: number | '';
  }>({
    name: '',
    price: '',
    reference: '',
    duration: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (courses.some(c => c.name.toLowerCase() === formData.name.toLowerCase())) {
      setError(t('course_already_exists') || 'A course with this name already exists');
      return;
    }

    addItem({
      name: formData.name,
      price: formatPrice(formData.price),
      reference: formData.reference,
      duration: Number(formData.duration) || undefined
    });
    navigate(-1);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-lg bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t('add_new_course')}</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('course_name')}</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_course_name')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('price')}</label>
            <input 
              type="text" 
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_price')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('duration_hours') || 'Duration (hours)'} <span className="text-zinc-400 dark:text-zinc-500 font-normal">({t('optional')})</span>
            </label>
            <input 
              type="number" 
              step="0.5"
              min="0"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value === '' ? '' : parseFloat(e.target.value) })}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder="1.5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('course_material_reference')} <span className="text-zinc-400 dark:text-zinc-500 font-normal">({t('optional')})</span>
            </label>
            <input 
              type="url" 
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              placeholder={t('e_g_url')}
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
