import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import GroupsPage from './pages/GroupsPage.tsx';
import GroupDetailsPage from './pages/GroupDetailsPage.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import StudentDetailsPage from './pages/StudentDetailsPage.tsx';
import StudentPaymentPage from './pages/StudentPaymentPage.tsx';
import EmployeesPage from './pages/EmployeesPage.tsx';
import EmployeeDetailsPage from './pages/EmployeeDetailsPage.tsx';
import EmployeeTypesPage from './pages/EmployeeTypesPage.tsx';
import CoursesPage from './pages/CoursesPage.tsx';
import RoomsPage from './pages/RoomsPage.tsx';
import TimetablePage from './pages/TimetablePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AnalyticsPage from './pages/AnalyticsPage.tsx';
import AddEmployeePage from './pages/AddEmployeePage.tsx';
import AddStudentPage from './pages/AddStudentPage.tsx';
import AddGroupPage from './pages/AddGroupPage.tsx';
import AddCoursePage from './pages/AddCoursePage.tsx';
import AddRoomPage from './pages/AddRoomPage.tsx';
import { ThemeProvider } from './components/ThemeProvider.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';

function AppRoutes() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/groups" replace />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/add" element={<AddGroupPage />} />
        <Route path="/groups/:id" element={<GroupDetailsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/add" element={<AddStudentPage />} />
        <Route path="/students/:id" element={<StudentDetailsPage />} />
        <Route path="/students/:id/payment" element={<StudentPaymentPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
        <Route path="/employees/types" element={<EmployeeTypesPage />} />
        <Route path="/employees/add" element={<AddEmployeePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/add" element={<AddCoursePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/rooms/add" element={<AddRoomPage />} />
        <Route path="*" element={<div className="text-zinc-400 dark:text-zinc-500">Page not found</div>} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
