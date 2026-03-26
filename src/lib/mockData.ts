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
  globalRegistrationDate?: string;
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

const initialMockStudents: Student[] = [
  { id: 1, name: 'Alice Brown', phone: '+998911112233', courses: 'General English', group: 'GE-101', gender: 'Female', parent: 'Mr. Brown', parentPhone: '+998911112244', dob: '2005-04-12', address: 'Tashkent', balance: 0, price: '300000', registration: '10-01-2024' },
  { id: 2, name: 'Bob White', phone: '+998912223344', courses: 'General English', group: 'GE-101', gender: 'Male', parent: 'Mrs. White', parentPhone: '+998912223355', dob: '2006-08-22', address: 'Tashkent', balance: 0, price: '300000', registration: '15-01-2024' },
  { id: 3, name: 'Charlie Green', phone: '+998913334455', courses: 'IELTS Foundation', group: 'IELTS-201', gender: 'Male', parent: 'Mr. Green', parentPhone: '+998913334466', dob: '2004-11-05', address: 'Tashkent', balance: 0, price: '400000', registration: '01-02-2024' },
  { id: 4, name: 'David Black', phone: '+998914445566', courses: 'Math in English', group: 'MATH-101', gender: 'Male', parent: 'Mrs. Black', parentPhone: '+998914445577', dob: '2007-02-18', address: 'Tashkent', balance: 0, price: '350000', registration: '10-02-2024' },
  { id: 5, name: 'Eva Gray', phone: '+998915556677', courses: 'IELTS Foundation', group: 'IELTS-201', gender: 'Female', parent: 'Mr. Gray', parentPhone: '+998915556688', dob: '2005-09-30', address: 'Tashkent', balance: 0, price: '400000', registration: '15-02-2024' },
];

const initialMockGroups: Group[] = [
  { id: 1, name: 'GE-101', students: 2, teachers: 'John Doe', courses: 'General English', rooms: 'Room 1', days: ['Mon', 'Wed', 'Fri'], startTime: '14:00', endTime: '15:30' },
  { id: 2, name: 'IELTS-201', students: 2, teachers: 'Sarah Williams', courses: 'IELTS Foundation', rooms: 'Room 2', days: ['Tue', 'Thu', 'Sat'], startTime: '16:00', endTime: '17:30' },
  { id: 3, name: 'MATH-101', students: 1, teachers: 'Jane Smith', courses: 'Math in English', rooms: 'Room 3', days: ['Mon', 'Wed', 'Fri'], startTime: '16:00', endTime: '17:30' },
];

const initialMockEmployees: Employee[] = [
  { id: 1, name: 'John Doe', phone: '+998901234567', qualification: 'CELTA', gender: 'Male', exp: 5, dob: '1990-05-15', joined: '2020-08-01', employeeType: 'English Teacher', address: 'Tashkent', salary: '5000000' },
  { id: 2, name: 'Jane Smith', phone: '+998902345678', qualification: 'BSc Math', gender: 'Female', exp: 3, dob: '1992-10-20', joined: '2021-09-15', employeeType: 'Math Teacher', address: 'Tashkent', salary: '4500000' },
  { id: 3, name: 'Mike Johnson', phone: '+998903456789', qualification: 'BBA', gender: 'Male', exp: 7, dob: '1988-03-10', joined: '2019-11-01', employeeType: 'Sales Manager', address: 'Tashkent', salary: '6000000' },
  { id: 4, name: 'Sarah Williams', phone: '+998904567890', qualification: 'IELTS 8.5', gender: 'Female', exp: 2, dob: '1995-07-25', joined: '2022-01-10', employeeType: 'English Teacher', address: 'Tashkent', salary: '4000000' },
];

const initialMockCourses: Course[] = [
  { id: 1, name: 'General English', price: '300000', reference: 'GE' },
  { id: 2, name: 'IELTS Foundation', price: '400000', reference: 'IELTS-F' },
  { id: 3, name: 'IELTS Graduation', price: '500000', reference: 'IELTS-G' },
  { id: 4, name: 'Math in English', price: '350000', reference: 'MATH-E' },
  { id: 5, name: 'SAT Math', price: '450000', reference: 'SAT-M' },
];

const initialMockRooms: Room[] = [
  { id: 1, name: 'Room 1', size: 15 },
  { id: 2, name: 'Room 2', size: 20 },
  { id: 3, name: 'Room 3', size: 12 },
  { id: 4, name: 'Room 4', size: 15 },
];

const initialMockPayments: Payment[] = [
  { id: 1, studentId: 1, course: 'General English', amount: '300000', type: 'Cash', date: '2024-01-10', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 2, studentId: 2, course: 'General English', amount: '300000', type: 'Card', date: '2024-01-15', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 3, studentId: 3, course: 'IELTS Foundation', amount: '400000', type: 'Cash', date: '2024-02-01', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 4, studentId: 4, course: 'Math in English', amount: '350000', type: 'Transfer', date: '2024-02-10', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 5, studentId: 5, course: 'IELTS Foundation', amount: '400000', type: 'Cash', date: '2024-02-15', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
];

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

const migrationKeyV4 = 'migration_reset_students_v5';
if (!localStorage.getItem(migrationKeyV4)) {
  try {
    const storedStudents = localStorage.getItem('mock_students');
    if (storedStudents) {
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
    }

    const storedGroups = localStorage.getItem('mock_groups');
    if (storedGroups) {
      const groups = JSON.parse(storedGroups);
      const resetGroups = groups.map((g: any) => ({
        ...g,
        students: 0
      }));
      localStorage.setItem('mock_groups', JSON.stringify(resetGroups));
    }
    
    localStorage.setItem('mock_payments', JSON.stringify([]));
  } catch (e) {}
  localStorage.setItem(migrationKeyV4, 'true');
}

const migrationKeyV5 = 'migration_populate_initial_data_v1';
if (!localStorage.getItem(migrationKeyV5)) {
  try {
    localStorage.setItem('mock_students', JSON.stringify(initialMockStudents));
    localStorage.setItem('mock_groups', JSON.stringify(initialMockGroups));
    localStorage.setItem('mock_employees', JSON.stringify(initialMockEmployees));
    localStorage.setItem('mock_courses', JSON.stringify(initialMockCourses));
    localStorage.setItem('mock_rooms', JSON.stringify(initialMockRooms));
    localStorage.setItem('mock_payments', JSON.stringify(initialMockPayments));
  } catch (e) {}
  localStorage.setItem(migrationKeyV5, 'true');
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
          .filter(p => p.course === groupName || p.course === course)
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
