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

const initialMockStudents: Student[] = [
  { id: 1, name: 'Behruz Ibodullayev', phone: '505043093', courses: 'General English', group: 'Grammar | E-15:30-Quvonchoy', gender: 'Male', parent: 'Dilfuza Xudoyberganova', parentPhone: '94...', dob: '12-05-2005', address: 'Urganch', balance: 0, price: '350,000 UZS', registration: '13-09-2025', lastChargedDate: '13-09-2025' },
  { id: 2, name: 'Jasmina To\'rayeva', phone: '949848177', courses: 'Matematika\nCEFR', group: 'Matematika | O-14:00-Aziza', gender: 'Female', parent: 'Raximova Gulasal', parentPhone: '95...', dob: '12-02-2007', address: 'Yangibozor', balance: -350000, price: '350,000 UZS', registration: '13-09-2025', lastChargedDate: '13-09-2025' },
  { id: 3, name: 'Shaxnoza Matsapoyeva', phone: '886000421', courses: 'Pre-IELTS', group: 'IELTS | E-15:30-Akmal', gender: 'Female', parent: 'Murod Xolmurodov', parentPhone: '97...', dob: '12-05-2005', address: 'Urganch', balance: 100000, price: '350,000 UZS', registration: '13-09-2025', lastChargedDate: '13-09-2025' },
  { id: 4, name: 'Marjona Taganova', phone: '956566131', courses: 'Pre-IELTS', group: 'IELTS | E-15:30-Akmal', gender: 'Female', parent: 'Marjona Taganova', parentPhone: '95...', dob: '12-05-2005', address: 'Urganch', balance: -700000, price: '350,000 UZS', registration: '13-09-2025', lastChargedDate: '13-09-2025' },
];

const initialMockGroups: Group[] = [
  { id: 1, name: 'Pre-IELTS | O-10:00-Akmal', students: 15, teachers: 'Akmalbek Xandurdiyev', courses: 'Pre-IELTS', rooms: 'Room A', days: ['odd'], startTime: '10:00', endTime: '11:30' },
  { id: 2, name: 'Grammar | O-14:00-Suhrob', students: 12, teachers: 'Suhrob Shuhratov', courses: 'Grammar', rooms: 'Room A', days: ['odd'], startTime: '15:00', endTime: '16:30' },
  { id: 3, name: 'CEFR | O-15:30-Suhrob', students: 10, teachers: 'Suhrob Shuhratov', courses: 'CEFR', rooms: 'Room A', days: ['odd'], startTime: '16:30', endTime: '18:00' },
  { id: 4, name: 'Pre-IELTS | O-15:30-Akmal', students: 14, teachers: 'Akmalbek Xandurdiyev', courses: 'Pre-IELTS', rooms: 'Room B', days: ['odd'], startTime: '16:30', endTime: '18:00' },
  { id: 5, name: 'KIDS | E-10:00-Husniya', students: 8, teachers: 'Husniya Botirova', courses: 'KIDS', rooms: 'Room A', days: ['even'], startTime: '10:30', endTime: '12:00' },
  { id: 6, name: 'Grammar | E-14:00-Husniya', students: 14, teachers: 'Husniya Botirova', courses: 'Grammar', rooms: 'Room A', days: ['even'], startTime: '14:30', endTime: '16:00' },
  { id: 7, name: 'IELTS | E-15:30-Akmal', students: 19, teachers: 'Akmalbek Xandurdiyev', courses: 'IELTS', rooms: 'Room A', days: ['even'], startTime: '16:00', endTime: '18:00' },
  { id: 8, name: 'Beginner | E-14:00-Sharifa', students: 11, teachers: 'Sharifa Madrahimova', courses: 'Beginner', rooms: 'Room B', days: ['even'], startTime: '14:30', endTime: '16:00' },
  { id: 9, name: 'KIDS | E-15:30-Husniya', students: 9, teachers: 'Husniya Botirova', courses: 'KIDS', rooms: 'Room B', days: ['even'], startTime: '16:00', endTime: '17:30' },
  { id: 10, name: 'Grammar | E-14:00-Suhrob', students: 13, teachers: 'Suhrob Shuhratov', courses: 'Grammar', rooms: 'Room C', days: ['even'], startTime: '14:30', endTime: '16:00' },
  { id: 11, name: 'Grammar | E-15:30-Suhrob', students: 12, teachers: 'Suhrob Shuhratov', courses: 'Grammar', rooms: 'Room C', days: ['even'], startTime: '16:00', endTime: '17:30' },
  { id: 12, name: 'Grammar | E-14:00-Quvonchoy', students: 14, teachers: 'Quvonchoy Razzakova', courses: 'Grammar', rooms: 'Room D', days: ['even'], startTime: '14:30', endTime: '16:00' },
  { id: 13, name: 'Grammar | E-15:30-Quvonchoy', students: 14, teachers: 'Quvonchoy Razzakova', courses: 'Grammar', rooms: 'Room D', days: ['even'], startTime: '16:00', endTime: '17:30' },
  { id: 14, name: 'Beginner | O-10:30-Sharifa', students: 10, teachers: 'Sharifa Madrahimova', courses: 'Beginner', rooms: 'Room D', days: ['even'], startTime: '10:30', endTime: '12:00' },
  { id: 15, name: 'Matematika | O-14:00-Aziza', students: 13, teachers: 'Aziza Ro\'zmatova', courses: 'Matematika', rooms: 'Room C', days: ['odd'], startTime: '14:00', endTime: '15:30' },
  { id: 16, name: 'Grammar | O-10:00-Umar (finished)', students: 2, teachers: 'Khakimbek Erkinboev', courses: 'Grammar', rooms: '-', days: [], startTime: '', endTime: '' },
];

const initialMockEmployees: Employee[] = [
  { id: 1, name: 'Suhrob Shuhratov', phone: '995645648', qualification: 'IELTS 7.5', gender: 'Male', exp: 1, dob: '11-12-2005', joined: '01-09-2023', username: 'suhrob', password: '123', employeeType: 'English Teacher' },
  { id: 2, name: 'Khakimbek Erkinboev', phone: '943133787', qualification: 'IELTS 8.0', gender: 'Male', exp: 2, dob: '03-10-2000', joined: '11-09-2023', username: 'khakimbek', password: '123', employeeType: 'English Teacher' },
  { id: 3, name: 'Gulnur Bobojonova', phone: '970922266', qualification: 'IELTS 7.5', gender: 'Female', exp: 8, dob: '26-06-1995', joined: '01-09-2023', username: 'gulnur', password: '123', employeeType: 'English Teacher' },
  { id: 4, name: 'Quvonchoy Razzakova', phone: '880242112', qualification: 'IELTS 8.0', gender: 'Female', exp: 1, dob: '21-12-2005', joined: '25-09-2023', username: 'quvonchoy', password: '123', employeeType: 'English Teacher' },
  { id: 5, name: 'Aziza Ro\'zmatova', phone: '991234567', qualification: 'Math Degree', gender: 'Female', exp: 3, dob: '15-05-1998', joined: '01-09-2023', username: 'aziza', password: '123', employeeType: 'Math Teacher' },
];

const initialMockCourses: Course[] = [
  { id: 1, name: 'IELTS', price: '550,000 UZS', reference: '' },
  { id: 2, name: 'Grammar', price: '450,000 UZS', reference: 'https://t.me/c/2121869342/8' },
  { id: 3, name: 'Matematika', price: '450,000 UZS', reference: '' },
  { id: 4, name: 'KID\'s English', price: '400,000 UZS', reference: '' },
  { id: 5, name: 'Pre-IELTS', price: '450,000 UZS', reference: '' },
  { id: 6, name: 'CEFR', price: '550,000 UZS', reference: 'https://t.me/c/2121869342/110' },
  { id: 7, name: 'General English', price: '450,000 UZS', reference: '' },
];

const initialMockRooms: Room[] = [
  { id: 1, name: 'Room D', size: 16 },
  { id: 2, name: 'Room C', size: 16 },
  { id: 3, name: 'Room A', size: 22 },
  { id: 4, name: 'Room B', size: 16 },
];

const initialMockPayments: Payment[] = [
  { id: 1, studentId: 1, course: 'Grammar', amount: '400,000 UZS', type: 'Cash', date: '11-11-2025', notes: 'Sep 22 - Oct 22', addedBy: 'Umarbek Erkinboev (Admin)', editedDate: '', editedBy: '' },
  { id: 2, studentId: 2, course: 'Matematika', amount: '350,000 UZS', type: 'Card', date: '01-01-2026', notes: 'Monthly payment', addedBy: 'Umarbek Erkinboev (Admin)', editedDate: '01-02-2026', editedBy: 'Umarbek Erkinboev (Admin)' },
];

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

    const setItems = (newItems: T[]) => {
      setItemsState(newItems);
      localStorage.setItem(key, JSON.stringify(newItems));
      window.dispatchEvent(new Event(`${key}_updated`));
    };

    const addItem = (item: Omit<T, 'id'>) => {
      const newItem = {
        ...item,
        id: Math.max(0, ...items.map(i => i.id)) + 1,
      } as T;
      setItems([...items, newItem]);
      return newItem;
    };

    const updateItem = (id: number, data: Partial<T>) => {
      setItems(items.map(i => i.id === id ? { ...i, ...data } : i));
    };

    const deleteItem = (id: number) => {
      setItems(items.filter(i => i.id !== id));
    };

    return { items, setItems, addItem, updateItem, deleteItem };
  };
}

const useGroupsBase = createUseEntityHook<Group>('mock_groups', initialMockGroups);

export function useGroups() {
  const { items, setItems, addItem, updateItem: baseUpdateItem, deleteItem } = useGroupsBase();
  const { items: students, setItems: setStudents } = useStudentsBase();

  const updateItem = (id: number, data: Partial<Group>) => {
    const oldGroup = items.find(g => g.id === id);
    baseUpdateItem(id, data);

    if (oldGroup && data.name && oldGroup.name !== data.name) {
      // Update students' group name
      const newStudents = students.map(s => {
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

let monthlyChargesProcessed = false;

const useStudentsBase = createUseEntityHook<Student>('mock_students', initialMockStudents);
export function useStudents() {
  const { items, setItems, addItem, updateItem, deleteItem } = useStudentsBase();
  
  useEffect(() => {
    if (monthlyChargesProcessed || items.length === 0) return;
    monthlyChargesProcessed = true;
    
    let updated = false;
    const newItems = items.map(student => {
      if (!student.lastChargedDate) return student;
      
      const lastChargedDates = student.lastChargedDate.split(',').map(d => d.trim());
      const registrationDates = student.registration ? student.registration.split(',').map(d => d.trim()) : [];
      const prices = student.price ? student.price.split(',').map(p => p.trim()) : [];
      
      let studentUpdated = false;
      let totalDeduction = 0;
      const newLastChargedDates = [...lastChargedDates];
      
      lastChargedDates.forEach((dateStr, index) => {
        const parts = dateStr.split('-');
        const regStr = registrationDates[index] || registrationDates[0] || dateStr;
        const regParts = regStr.split('-');
        
        if (parts.length !== 3 || regParts.length !== 3) return;
        
        const lastCharged = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const regDay = parseInt(regParts[0]);
        const now = new Date();
        
        let monthsPassed = (now.getFullYear() - lastCharged.getFullYear()) * 12 + (now.getMonth() - lastCharged.getMonth());
        if (now.getDate() < regDay) {
          monthsPassed--;
        }
        
        if (monthsPassed > 0) {
          studentUpdated = true;
          const priceStr = prices[index] || prices[0] || '0';
          const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
          
          totalDeduction += price * monthsPassed;
          
          let newMonth = lastCharged.getMonth() + monthsPassed;
          let newYear = lastCharged.getFullYear() + Math.floor(newMonth / 12);
          newMonth = newMonth % 12;
          
          const newChargeDate = new Date(newYear, newMonth, regDay);
          if (newChargeDate.getMonth() !== newMonth) {
            newChargeDate.setDate(0); // Cap to last day of the month
          }
          
          newLastChargedDates[index] = `${newChargeDate.getDate().toString().padStart(2, '0')}-${(newChargeDate.getMonth() + 1).toString().padStart(2, '0')}-${newChargeDate.getFullYear()}`;
        }
      });
      
      if (studentUpdated) {
        updated = true;
        return {
          ...student,
          balance: student.balance - totalDeduction,
          lastChargedDate: newLastChargedDates.join(', ')
        };
      }
      return student;
    });
    
    if (updated) {
      setItems(newItems);
    }
  }, [items, setItems]);

  return {
    students: items,
    setStudents: setItems,
    addStudent: addItem,
    updateStudent: updateItem,
    deleteStudent: deleteItem
  };
}
