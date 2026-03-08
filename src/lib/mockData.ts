import { useState, useEffect } from 'react';

export type Student = {
  id: number;
  name: string;
  phone: string;
  courses: string;
  gender: string;
  parent: string;
  parentPhone: string;
  dob: string;
  address: string;
  balance: number;
  price: string;
  registration: string;
};

export type Group = {
  id: number;
  name: string;
  students: number;
  teachers: string;
  courses: string;
  rooms: string;
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

const initialMockStudents: Student[] = [
  { id: 1, name: 'Behruz Ibodullayev', phone: '505043093', courses: 'General English', gender: 'Male', parent: 'Dilfuza Xudoyberganova', parentPhone: '94...', dob: '12-05-2005', address: 'Urganch', balance: 0, price: '350,000 UZS', registration: '13-09-2025' },
  { id: 2, name: 'Jasmina To\'rayeva', phone: '949848177', courses: 'Matematika\nCEFR', gender: 'Female', parent: 'Raximova Gulasal', parentPhone: '95...', dob: '12-02-2007', address: 'Yangibozor', balance: 0, price: '350,000 UZS', registration: '13-09-2025' },
  { id: 3, name: 'Shaxnoza Matsapoyeva', phone: '886000421', courses: 'Pre-IELTS', gender: 'Female', parent: 'Murod Xolmurodov', parentPhone: '97...', dob: '12-05-2005', address: 'Urganch', balance: 0, price: '350,000 UZS', registration: '13-09-2025' },
  { id: 4, name: 'Marjona Taganova', phone: '956566131', courses: 'Pre-IELTS', gender: 'Female', parent: 'Marjona Taganova', parentPhone: '95...', dob: '12-05-2005', address: 'Urganch', balance: 0, price: '350,000 UZS', registration: '13-09-2025' },
];

const initialMockGroups: Group[] = [
  { id: 1, name: 'IELTS | E-15:30-Akmal', students: 19, teachers: 'Akmalbek Xandurdiyev', courses: 'IELTS', rooms: 'Room A' },
  { id: 2, name: 'Grammar | E-15:30-Quvonchoy', students: 14, teachers: 'Quvonchoy Razzakova', courses: 'Grammar', rooms: 'Room D' },
  { id: 3, name: 'Grammar | E-14:00-Husniya', students: 14, teachers: 'Husniya Botirova', courses: 'Grammar', rooms: 'Room A' },
  { id: 4, name: 'Matematika | O-14:00-Aziza', students: 13, teachers: 'Aziza Ro\'zmatova', courses: 'Matematika', rooms: 'Room C' },
  { id: 5, name: 'Grammar | O-10:00-Umar (finished)', students: 2, teachers: 'Khakimbek Erkinboev', courses: 'Grammar', rooms: '-' },
];

const initialMockEmployees: Employee[] = [
  { id: 1, name: 'Suhrob Shuhratov', phone: '995645648', qualification: 'IELTS 7.5', gender: 'Male', exp: 1, dob: '11-12-2005', joined: '01-09-2023' },
  { id: 2, name: 'Khakimbek Erkinboev', phone: '943133787', qualification: 'IELTS 8.0', gender: 'Male', exp: 2, dob: '03-10-2000', joined: '11-09-2023' },
  { id: 3, name: 'Gulnur Bobojonova', phone: '970922266', qualification: 'IELTS 7.5', gender: 'Female', exp: 8, dob: '26-06-1995', joined: '01-09-2023' },
  { id: 4, name: 'Quvonchoy Razzakova', phone: '880242112', qualification: 'IELTS 8.0', gender: 'Female', exp: 1, dob: '21-12-2005', joined: '25-09-2023' },
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

export const useGroups = createUseEntityHook<Group>('mock_groups', initialMockGroups);
export const useEmployees = createUseEntityHook<Employee>('mock_employees', initialMockEmployees);
export const useCourses = createUseEntityHook<Course>('mock_courses', initialMockCourses);
export const useRooms = createUseEntityHook<Room>('mock_rooms', initialMockRooms);

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
  return {
    students: items,
    setStudents: setItems,
    addStudent: addItem,
    updateStudent: updateItem,
    deleteStudent: deleteItem
  };
}
