import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, GraduationCap, CalendarDays, BarChart2, Contact2, LayoutDashboard } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const features = [
  {
    id: 'timetable',
    icon: CalendarDays,
    color: 'indigo',
    title: { ru: 'Расписание', uz: 'Dars jadvali', en: 'Timetable' },
    desc: {
      ru: 'Просматривайте и управляйте расписанием занятий. Вы можете видеть, какие группы занимаются в какое время и в каких кабинетах.',
      uz: "Dars jadvallarini ko'rish va boshqarish. Qaysi guruhlar qaysi vaqtda va qaysi xonalarda o'qishini ko'rishingiz mumkin.",
      en: 'View and manage class schedules. You can see which groups are studying at what time and in which rooms.'
    }
  },
  {
    id: 'analytics',
    icon: BarChart2,
    color: 'emerald',
    title: { ru: 'Аналитика', uz: 'Analitika', en: 'Analytics' },
    desc: {
      ru: 'Отслеживайте ключевые показатели: количество студентов, доходы, популярные курсы и эффективность преподавателей.',
      uz: "Asosiy ko'rsatkichlarni kuzatib boring: talabalar soni, daromadlar, mashhur kurslar va o'qituvchilar samaradorligi.",
      en: 'Track key metrics: number of students, revenue, popular courses, and teacher performance.'
    }
  },
  {
    id: 'groups',
    icon: Users,
    color: 'blue',
    title: { ru: 'Группы', uz: 'Guruhlar', en: 'Groups' },
    desc: {
      ru: 'Создавайте учебные группы, назначайте преподавателей и курсы, управляйте составом студентов в каждой группе.',
      uz: "O'quv guruhlarini yarating, o'qituvchilar va kurslarni tayinlang, har bir guruhdagi talabalar tarkibini boshqaring.",
      en: 'Create study groups, assign teachers and courses, and manage the student roster in each group.'
    }
  },
  {
    id: 'students',
    icon: GraduationCap,
    color: 'purple',
    title: { ru: 'Студенты', uz: 'Talabalar', en: 'Students' },
    desc: {
      ru: 'Ведите базу данных студентов, отслеживайте их успеваемость, посещаемость и историю платежей.',
      uz: "Talabalar ma'lumotlar bazasini yuriting, ularning o'zlashtirishi, davomati va to'lovlar tarixini kuzatib boring.",
      en: 'Maintain a student database, track their academic progress, attendance, and payment history.'
    }
  },
  {
    id: 'employees',
    icon: Contact2,
    color: 'orange',
    title: { ru: 'Сотрудники', uz: 'Xodimlar', en: 'Employees' },
    desc: {
      ru: 'Управляйте профилями преподавателей и административного персонала, их ролями и контактной информацией.',
      uz: "O'qituvchilar va ma'muriy xodimlarning profillarini, ularning rollari va aloqa ma'lumotlarini boshqaring.",
      en: 'Manage profiles of teachers and administrative staff, their roles, and contact information.'
    }
  },
  {
    id: 'courses',
    icon: BookOpen,
    color: 'rose',
    title: { ru: 'Курсы', uz: 'Kurslar', en: 'Courses' },
    desc: {
      ru: 'Создавайте и редактируйте учебные программы, устанавливайте стоимость обучения и продолжительность курсов.',
      uz: "O'quv dasturlarini yarating va tahrirlang, o'qish narxini va kurslar davomiyligini belgilang.",
      en: 'Create and edit educational programs, set tuition fees, and course durations.'
    }
  }
];

const colorMap: Record<string, { bg: string, text: string }> = {
  indigo: { bg: 'bg-indigo-50/80 dark:bg-indigo-500/10', text: 'text-indigo-500' },
  emerald: { bg: 'bg-emerald-50/80 dark:bg-emerald-500/10', text: 'text-emerald-500' },
  blue: { bg: 'bg-blue-50/80 dark:bg-blue-500/10', text: 'text-blue-500' },
  purple: { bg: 'bg-purple-50/80 dark:bg-purple-500/10', text: 'text-purple-500' },
  orange: { bg: 'bg-orange-50/80 dark:bg-orange-500/10', text: 'text-orange-500' },
  rose: { bg: 'bg-rose-50/80 dark:bg-rose-500/10', text: 'text-rose-500' },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function TutorialPage() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en') as 'ru' | 'uz' | 'en';

  const welcomeTitle = {
    ru: 'Добро пожаловать в систему управления',
    uz: 'Boshqaruv tizimiga xush kelibsiz',
    en: 'Welcome to the Management System'
  };

  const welcomeDesc = {
    ru: 'Это руководство поможет вам понять основные функции приложения.',
    uz: "Ushbu qo'llanma ilovaning asosiy xususiyatlarini tushunishga yordam beradi.",
    en: 'This tutorial will help you understand the core features of the application.'
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-16 text-center"
      >
        <div className="inline-flex items-center justify-center p-4 bg-blue-50/80 dark:bg-blue-500/10 rounded-full mb-6 shadow-sm">
          <LayoutDashboard className="w-8 h-8 text-blue-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight mb-4">
          {welcomeTitle[lang] || welcomeTitle.en}
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {welcomeDesc[lang] || welcomeDesc.en}
        </p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          const colors = colorMap[feature.color];
          
          return (
            <motion.div 
              key={feature.id}
              variants={itemVariants}
              className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-zinc-100/50 dark:border-zinc-800/50 overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 tracking-tight">
                  {feature.title[lang] || feature.title.en}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-lg">
                  {feature.desc[lang] || feature.desc.en}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
