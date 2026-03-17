import { useState, useEffect } from 'react';

export type Student = {
  id: number;
  name: string;
  phone: string;
  courses: string;
  group: string;
  gender: string;
  parent: string;
  parentPhone: string;
  dob: string;
  address: string;
  balance: number;
  groupBalances?: { [groupName: string]: number };
  price: string;
  registration: string;
  lastChargedDate?: string;
};

export type Group = {
  id: number;
  name: string;
  students: number;
  teachers: string;
  courses: string;
  rooms: string;
  days: string[];
  startTime: string;
  endTime: string;
};

export type Employee = {
  id: number;
  name: string;
  phone: string;
  qualification: string;
  gender: string;
  exp: number;
  dob: string;
  joined: string;
  username?: string;
  password?: string;
  employeeType?: string;
  address?: string;
  salary?: string;
};

export type Course = {
  id: number;
  name: string;
  price: string;
  reference: string;
};

export type Room = {
  id: number;
  name: string;
  size: number;
};

export type Payment = {
  id: number;
  studentId: number;
  course: string;
  amount: string;
  type: string;
  date: string;
  notes: string;
  addedBy: string;
  editedDate: string;
  editedBy: string;
};

const initialMockStudents: Student[] = [];

const initialMockGroups: Group[] = [];

const initialMockEmployees: Employee[] = [];

const initialMockCourses: Course[] = [];

const initialMockRooms: Room[] = [];

const initialMockPayments: Payment[] = [];

// Migration to reset student details and payments
const migrationKey = 'migration_reset_students_v2';
if (!localStorage.getItem(migrationKey)) {
  const storedStudents = localStorage.getItem('mock_students');
  if (storedStudents) {
    try {
      const students = JSON.parse(storedStudents);
      const resetStudents = students.map((s: any) => ({
        ...s,
        courses: '',
        group: '',
        balance: 0,
        price: '',
        registration: '',
        lastChargedDate: ''
      }));
      localStorage.setItem('mock_students', JSON.stringify(resetStudents));
    } catch (e) {}
  }
  
  const storedGroups = localStorage.getItem('mock_groups');
  if (storedGroups) {
    try {
      const groups = JSON.parse(storedGroups);
      const resetGroups = groups.map((g: any) => ({
        ...g,
        students: 0
      }));
      localStorage.setItem('mock_groups', JSON.stringify(resetGroups));
    } catch (e) {}
  }

  localStorage.setItem('mock_payments', JSON.stringify([]));
  localStorage.setItem(migrationKey, 'true');
}

const migrationKeyV3 = 'migration_remove_commas_from_prices_v2';
if (!localStorage.getItem(migrationKeyV3)) {
  try {
    const storedCourses = localStorage.getItem('mock_courses');
    if (storedCourses) {
      const courses = JSON.parse(storedCourses);
      const updatedCourses = courses.map((c: any) => ({
        ...c,
        price: c.price ? c.price.replace(/(\d),(\d)/g, '$1$2') : c.price
      }));
      localStorage.setItem('mock_courses', JSON.stringify(updatedCourses));
    }

    const storedStudents = localStorage.getItem('mock_students');
    if (storedStudents) {
      const students = JSON.parse(storedStudents);
      const updatedStudents = students.map((s: any) => ({
        ...s,
        price: s.price ? s.price.replace(/(\d),(\d)/g, '$1$2') : s.price
      }));
      localStorage.setItem('mock_students', JSON.stringify(updatedStudents));
    }
  } catch (e) {}
  localStorage.setItem(migrationKeyV3, 'true');
}

function createUseEntityHook<T extends { id: number }>(key: string, initialData: T[]) {
  return function useEntity() {
    const [items, setItemsState] = useState<T[]>(() => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return initialData;
        }
      }
      return initialData;
    });

    useEffect(() => {
      const handleStorageChange = () => {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            setItemsState(JSON.parse(stored));
          } catch (e) {
            // ignore
          }
        }
      };

      window.addEventListener(`${key}_updated`, handleStorageChange);
      return () => window.removeEventListener(`${key}_updated`, handleStorageChange);
    }, []);

    const getItems = (): T[] => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return initialData;
        }
      }
      return initialData;
    };

    const setItems = (newItems: T[]) => {
      setItemsState(newItems);
      localStorage.setItem(key, JSON.stringify(newItems));
      window.dispatchEvent(new Event(`${key}_updated`));
    };

    const addItem = (item: Omit<T, 'id'>) => {
      const currentItems = getItems();
      const newItem = {
        ...item,
        id: Math.max(0, ...currentItems.map(i => i.id)) + 1,
      } as T;
      setItems([...currentItems, newItem]);
      return newItem;
    };

    const updateItem = (id: number, data: Partial<T>) => {
      const currentItems = getItems();
      setItems(currentItems.map(i => i.id === id ? { ...i, ...data } : i));
    };

    const deleteItem = (id: number) => {
      const currentItems = getItems();
      setItems(currentItems.filter(i => i.id !== id));
    };

    return { items, setItems, addItem, updateItem, deleteItem, getItems };
  };
}

const useGroupsBase = createUseEntityHook<Group>('mock_groups', initialMockGroups);

export function useGroups() {
  const { items, setItems, addItem, updateItem: baseUpdateItem, deleteItem } = useGroupsBase();
  const { items: students, setItems: setStudents, getItems: getStudents } = useStudentsBase();

  const updateItem = (id: number, data: Partial<Group>) => {
    const oldGroup = items.find(g => g.id === id);
    baseUpdateItem(id, data);

    if (oldGroup && data.name && oldGroup.name !== data.name) {
      // Update students' group name
      const currentStudents = getStudents();
      const newStudents = currentStudents.map(s => {
        if (!s.group) return s;
        const currentGroups = s.group.split(', ');
        if (currentGroups.includes(oldGroup.name)) {
          const newGroups = currentGroups.map(g => g === oldGroup.name ? data.name! : g).join(', ');
          return { ...s, group: newGroups };
        }
        return s;
      });
      setStudents(newStudents);
    }
  };

  return { items, setItems, addItem, updateItem, deleteItem };
}
export const useEmployees = createUseEntityHook<Employee>('mock_employees', initialMockEmployees);
export const useCourses = createUseEntityHook<Course>('mock_courses', initialMockCourses);
export const useRooms = createUseEntityHook<Room>('mock_rooms', initialMockRooms);
export const usePayments = createUseEntityHook<Payment>('mock_payments', initialMockPayments);

export type EmployeeType = {
  id: number;
  type: string;
  count: number;
};

const initialMockEmployeeTypes: EmployeeType[] = [
  { id: 1, type: 'English Teacher', count: 8 },
  { id: 2, type: 'Math Teacher', count: 1 },
  { id: 3, type: 'Support Teacher', count: 0 },
  { id: 4, type: 'Sales Manager', count: 1 },
];

export const useEmployeeTypes = createUseEntityHook<EmployeeType>('mock_employee_types', initialMockEmployeeTypes);

const useStudentsBase = createUseEntityHook<Student>('mock_students', initialMockStudents);
export function useStudents() {
  const { items, setItems, addItem, updateItem, deleteItem } = useStudentsBase();
  const { items: payments } = usePayments();
  
  const computedStudents = items.map(student => {
    const studentPayments = payments.filter(p => p.studentId === student.id);
    const totalPayments = studentPayments.reduce((sum, p) => sum + (parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0), 0);

    let totalCharges = 0;
    const registrationDates = student.registration ? student.registration.split(',').map(d => d.trim()) : [];
    const prices = student.price ? student.price.split(',').map(p => p.trim()) : [];
    const courses = student.courses ? student.courses.split(',').map(c => c.trim()) : [];
    const groups = student.group ? student.group.split(',').map(g => g.trim()) : [];
    const groupBalances: { [groupName: string]: number } = {};

    courses.forEach((course, index) => {
      if (!course) return;
      const groupName = groups[index];
      const regStr = registrationDates[index] || registrationDates[0];
      const priceStr = prices[index] || prices[0] || '0';
      const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
      
      let courseCharges = 0;
      if (regStr) {
        const parts = regStr.split('-');
        if (parts.length === 3) {
          const regDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          const now = new Date();
          
          let monthsPassed = (now.getFullYear() - regDate.getFullYear()) * 12 + (now.getMonth() - regDate.getMonth());
          if (now.getDate() < regDate.getDate()) {
            monthsPassed--;
          }
          
          const chargesCount = Math.max(0, monthsPassed + 1);
          courseCharges = chargesCount * price;
          totalCharges += courseCharges;
        }
      }

      if (groupName) {
        const coursePayments = studentPayments
          .filter(p => p.course === course)
          .reduce((sum, p) => sum + (parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0), 0);
        
        groupBalances[groupName] = coursePayments - courseCharges;
      }
    });

    return {
      ...student,
      balance: totalPayments - totalCharges,
      groupBalances
    };
  });

  return {
    students: computedStudents,
    setStudents: setItems,
    addStudent: addItem,
    updateStudent: updateItem,
    deleteStudent: deleteItem
  };
}
