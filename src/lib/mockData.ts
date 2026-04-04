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
  duration?: number;
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
  { id: 1, name: 'Behruz Ibodullayev', phone: '505043093', courses: '', group: '', gender: 'Male', parent: 'Dilfuza Xudoyberganova', parentPhone: '901234567', dob: '2005-04-12', address: '', balance: 0, price: '', registration: '' },
  { id: 2, name: 'Jasmina To\'rayeva', phone: '949848177', courses: '', group: '', gender: 'Female', parent: 'Raximova Gulasal', parentPhone: '902345678', dob: '2006-08-22', address: '', balance: 0, price: '', registration: '' },
  { id: 3, name: 'Shaxnoza Matsapoyeva', phone: '886000421', courses: '', group: '', gender: 'Female', parent: 'Murod Xolmurodov', parentPhone: '903456789', dob: '2004-11-05', address: '', balance: 0, price: '', registration: '' },
  { id: 4, name: 'Marjona Taganova', phone: '956566131', courses: '', group: '', gender: 'Female', parent: 'Marjona Taganova', parentPhone: '904567890', dob: '2007-02-18', address: '', balance: 0, price: '', registration: '' },
  { id: 5, name: 'Jadra Umirzoqova', phone: '914342811', courses: '', group: '', gender: 'Female', parent: 'Jadra Umirzoqova', parentPhone: '905678901', dob: '2005-09-30', address: '', balance: 0, price: '', registration: '' },
  { id: 6, name: 'Shaxzoda Saydullayeva', phone: '507225351', courses: '', group: '', gender: 'Female', parent: 'Ibragimova Dilorom', parentPhone: '906789012', dob: '2008-01-15', address: '', balance: 0, price: '', registration: '' },
  { id: 7, name: 'Sevinch Xo\'djayeva', phone: '932881846', courses: '', group: '', gender: 'Female', parent: 'Diana Do\'simbetova', parentPhone: '907890123', dob: '2006-05-20', address: '', balance: 0, price: '', registration: '' },
  { id: 8, name: 'Husinboy Ro\'zimboyev', phone: '938022370', courses: '', group: '', gender: 'Male', parent: 'Durdona Masharipova', parentPhone: '908901234', dob: '2007-10-10', address: '', balance: 0, price: '', registration: '' },
  { id: 9, name: 'Hasanboy Ro\'zimboyev', phone: '938022370', courses: '', group: '', gender: 'Male', parent: 'Durdona Masharipova', parentPhone: '909012345', dob: '2007-10-10', address: '', balance: 0, price: '', registration: '' },
  { id: 10, name: 'Amirbek Samandarov', phone: '904307977', courses: '', group: '', gender: 'Male', parent: 'Umrbek Atajanov', parentPhone: '901122334', dob: '2005-12-05', address: '', balance: 0, price: '', registration: '' },
];

const initialMockGroups: Group[] = [
  { id: 1, name: 'Grammar | E-10:00-Khakimbek', students: 0, teachers: 'Khakimbek Erkinboev', courses: 'Grammar', rooms: 'Room A', days: ['even'], startTime: '10:00', endTime: '11:30' },
  { id: 2, name: 'General English | O-10:00-Umarbek', students: 0, teachers: 'Umarbek Erkinboev', courses: 'General English', rooms: 'Room C', days: ['odd'], startTime: '10:00', endTime: '11:30' },
  { id: 3, name: 'Grammar | O-10:00-Umar', students: 0, teachers: 'Umarbek Erkinboev', courses: 'Grammar', rooms: 'Room B', days: ['odd'], startTime: '10:00', endTime: '11:30' },
  { id: 4, name: 'IELTS | E-14:00-Khakimbek', students: 0, teachers: 'Khakimbek Erkinboev', courses: 'IELTS', rooms: 'Room C', days: ['even'], startTime: '14:00', endTime: '16:30' },
];

const initialMockEmployees: Employee[] = [
  { id: 1, name: 'Suhrob Shuhratov', phone: '995645648', qualification: 'CEFR C1', gender: 'Male', exp: 1, dob: '', joined: '', employeeType: 'English Teacher' },
  { id: 2, name: 'Khakimbek Erkinboev', phone: '943133787', qualification: 'IELTS 8.0', gender: 'Male', exp: 2, dob: '', joined: '', employeeType: 'English Teacher' },
  { id: 3, name: 'Gulnur Bobojonova', phone: '970922266', qualification: 'IELTS 7.5', gender: 'Female', exp: 8, dob: '', joined: '', employeeType: 'English Teacher' },
  { id: 4, name: 'Quvonchoy Razzakova', phone: '880242112', qualification: 'IELTS 8.0', gender: 'Female', exp: 1, dob: '', joined: '', employeeType: 'English Teacher' },
  { id: 5, name: 'Husniya Botirova', phone: '885195353', qualification: 'IELTS 6.5', gender: 'Female', exp: 3, dob: '', joined: '', employeeType: 'English Teacher' },
  { id: 6, name: 'Eldor Bohramov', phone: '887327276', qualification: 'Talaba', gender: 'Male', exp: 1, dob: '', joined: '', employeeType: 'Sales Manager' },
  { id: 7, name: 'Aziza Ro\'zmatova', phone: '932452074', qualification: 'Talaba', gender: 'Female', exp: 2, dob: '', joined: '', employeeType: 'Math Teacher' },
  { id: 8, name: 'Akmalbek Xandurdiyev', phone: '932848343', qualification: 'IELTS 7.0', gender: 'Male', exp: 1, dob: '', joined: '', employeeType: 'English Teacher' },
  { id: 9, name: 'Go\'zal Allaberganova', phone: '940447050', qualification: 'Talaba', gender: 'Female', exp: 2, dob: '', joined: '', employeeType: 'Adminstrator' },
];

const initialMockCourses: Course[] = [
  { id: 1, name: 'IELTS', price: '550000', reference: '', duration: 2.5 },
  { id: 2, name: 'Grammar', price: '450000', reference: '', duration: 1.5 },
  { id: 3, name: 'Matematika', price: '450000', reference: '', duration: 1.5 },
  { id: 4, name: 'KID\'s English', price: '400000', reference: '', duration: 1.5 },
  { id: 5, name: 'CEFR', price: '550000', reference: '', duration: 2 },
  { id: 6, name: 'Pre-IELTS', price: '450000', reference: '', duration: 2 },
  { id: 7, name: 'General English', price: '450000', reference: '', duration: 1.5 },
];

const initialMockRooms: Room[] = [
  { id: 1, name: 'Room A', size: 15 },
  { id: 2, name: 'Room B', size: 20 },
  { id: 3, name: 'Room C', size: 12 },
  { id: 4, name: 'Room D', size: 15 },
];

const initialMockPayments: Payment[] = [
  { id: 1, studentId: 1, course: 'General English', amount: '300000', type: 'Cash', date: '2024-01-10', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 2, studentId: 2, course: 'General English', amount: '300000', type: 'Card', date: '2024-01-15', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 3, studentId: 3, course: 'IELTS Foundation', amount: '400000', type: 'Cash', date: '2024-02-01', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 4, studentId: 4, course: 'Math in English', amount: '350000', type: 'Transfer', date: '2024-02-10', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
  { id: 5, studentId: 5, course: 'IELTS Foundation', amount: '400000', type: 'Cash', date: '2024-02-15', notes: 'First month', addedBy: 'Admin', editedDate: '', editedBy: '' },
];

// Migration to reset student details and payments
const migrationKeyV9 = 'migration_populate_initial_data_v5';
if (!localStorage.getItem(migrationKeyV9)) {
  try {
    localStorage.setItem('mock_students', JSON.stringify(initialMockStudents));
    localStorage.setItem('mock_groups', JSON.stringify(initialMockGroups));
    localStorage.setItem('mock_employees', JSON.stringify(initialMockEmployees));
    localStorage.setItem('mock_courses', JSON.stringify(initialMockCourses));
    localStorage.setItem('mock_rooms', JSON.stringify(initialMockRooms));
    localStorage.setItem('mock_payments', JSON.stringify([]));
  } catch (e) {}
  localStorage.setItem(migrationKeyV9, 'true');
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
  const { items, setItems, addItem, updateItem: baseUpdateItem, deleteItem: baseDeleteItem } = useGroupsBase();
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

  const deleteItem = (id: number) => {
    const groupToDelete = items.find(g => g.id === id);
    baseDeleteItem(id);

    if (groupToDelete) {
      const currentStudents = getStudents();
      const newStudents = currentStudents.map(s => {
        if (!s.group) return s;
        const groupsArr = s.group.split(',').map(g => g.trim());
        const index = groupsArr.indexOf(groupToDelete.name);
        
        if (index !== -1) {
          const newGroups = [...groupsArr]; newGroups.splice(index, 1);
          const newCourses = s.courses ? s.courses.split(',').map(c => c.trim()) : [];
          if (newCourses.length > index) newCourses.splice(index, 1);
          const newPrices = s.price ? s.price.split(',').map(p => p.trim()) : [];
          if (newPrices.length > index) newPrices.splice(index, 1);
          const newRegs = s.registration ? s.registration.split(',').map(r => r.trim()) : [];
          if (newRegs.length > index) newRegs.splice(index, 1);
          const newLast = s.lastChargedDate ? s.lastChargedDate.split(',').map(d => d.trim()) : [];
          if (newLast.length > index) newLast.splice(index, 1);

          return {
            ...s,
            group: newGroups.join(', '),
            courses: newCourses.join(', '),
            price: newPrices.join(', '),
            registration: newRegs.join(', '),
            lastChargedDate: newLast.join(', ')
          };
        }
        return s;
      });
      setStudents(newStudents);

      // Delete payments associated with this group
      const currentPayments = JSON.parse(localStorage.getItem('mock_payments') || '[]');
      const newPayments = currentPayments.filter((p: any) => p.course !== groupToDelete.name);
      localStorage.setItem('mock_payments', JSON.stringify(newPayments));
      // Force a reload to reflect payment changes if needed, or we can just rely on the next render
      window.dispatchEvent(new Event('storage'));
    }
  };

  return { items, setItems, addItem, updateItem, deleteItem };
}

const useEmployeesBase = createUseEntityHook<Employee>('mock_employees', initialMockEmployees);
export function useEmployees() {
  const base = useEmployeesBase();
  const { items: groups, setItems: setGroups } = useGroupsBase();
  
  const updateItem = (id: number, data: Partial<Employee>) => {
    const oldEmp = base.items.find(e => e.id === id);
    base.updateItem(id, data);
    if (oldEmp && data.name && oldEmp.name !== data.name) {
      setGroups(groups.map(g => g.teachers === oldEmp.name ? { ...g, teachers: data.name! } : g));
    }
  };

  const deleteItem = (id: number) => {
    const emp = base.items.find(e => e.id === id);
    base.deleteItem(id);
    if (emp) {
      setGroups(groups.map(g => g.teachers === emp.name ? { ...g, teachers: '' } : g));
    }
  };
  return { ...base, updateItem, deleteItem };
}

const useCoursesBase = createUseEntityHook<Course>('mock_courses', initialMockCourses);
export function useCourses() {
  const base = useCoursesBase();
  const { items: groups, setItems: setGroups } = useGroupsBase();
  const { items: students, setItems: setStudents } = useStudentsBase();
  
  const updateItem = (id: number, data: Partial<Course>) => {
    const oldCourse = base.items.find(c => c.id === id);
    base.updateItem(id, data);
    if (oldCourse && data.name && oldCourse.name !== data.name) {
      setGroups(groups.map(g => g.courses === oldCourse.name ? { ...g, courses: data.name! } : g));
      
      const newStudents = students.map(s => {
        if (!s.courses) return s;
        const coursesArr = s.courses.split(',').map(c => c.trim());
        if (coursesArr.includes(oldCourse.name)) {
          const newCourses = coursesArr.map(c => c === oldCourse.name ? data.name! : c).join(', ');
          return { ...s, courses: newCourses };
        }
        return s;
      });
      setStudents(newStudents);
    }
  };

  const deleteItem = (id: number) => {
    const course = base.items.find(c => c.id === id);
    base.deleteItem(id);
    if (course) {
      setGroups(groups.map(g => g.courses === course.name ? { ...g, courses: '' } : g));
      
      const newStudents = students.map(s => {
        if (!s.courses) return s;
        const coursesArr = s.courses.split(',').map(c => c.trim());
        const index = coursesArr.indexOf(course.name);
        
        if (index !== -1) {
          const newCourses = [...coursesArr]; newCourses.splice(index, 1);
          const newGroups = s.group ? s.group.split(',').map(g => g.trim()) : [];
          if (newGroups.length > index) newGroups.splice(index, 1);
          const newPrices = s.price ? s.price.split(',').map(p => p.trim()) : [];
          if (newPrices.length > index) newPrices.splice(index, 1);
          const newRegs = s.registration ? s.registration.split(',').map(r => r.trim()) : [];
          if (newRegs.length > index) newRegs.splice(index, 1);
          const newLast = s.lastChargedDate ? s.lastChargedDate.split(',').map(d => d.trim()) : [];
          if (newLast.length > index) newLast.splice(index, 1);

          return {
            ...s,
            group: newGroups.join(', '),
            courses: newCourses.join(', '),
            price: newPrices.join(', '),
            registration: newRegs.join(', '),
            lastChargedDate: newLast.join(', ')
          };
        }
        return s;
      });
      setStudents(newStudents);

      // Delete payments associated with this course
      const currentPayments = JSON.parse(localStorage.getItem('mock_payments') || '[]');
      const groupsForCourse = groups.filter(g => g.courses === course.name).map(g => g.name);
      const newPayments = currentPayments.filter((p: any) => p.course !== course.name && !groupsForCourse.includes(p.course));
      localStorage.setItem('mock_payments', JSON.stringify(newPayments));
      window.dispatchEvent(new Event('storage'));
    }
  };
  return { ...base, updateItem, deleteItem };
}

const useRoomsBase = createUseEntityHook<Room>('mock_rooms', initialMockRooms);
export function useRooms() {
  const base = useRoomsBase();
  const { items: groups, setItems: setGroups } = useGroupsBase();
  
  const updateItem = (id: number, data: Partial<Room>) => {
    const oldRoom = base.items.find(r => r.id === id);
    base.updateItem(id, data);
    if (oldRoom && data.name && oldRoom.name !== data.name) {
      setGroups(groups.map(g => g.rooms === oldRoom.name ? { ...g, rooms: data.name! } : g));
    }
  };

  const deleteItem = (id: number) => {
    const room = base.items.find(r => r.id === id);
    base.deleteItem(id);
    if (room) {
      setGroups(groups.map(g => g.rooms === room.name ? { ...g, rooms: '' } : g));
    }
  };
  return { ...base, updateItem, deleteItem };
}

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
  const { items, setItems, addItem, updateItem, deleteItem: baseDeleteItem } = useStudentsBase();
  const { items: payments, setItems: setPayments } = usePayments();
  
  const deleteItem = (id: number) => {
    baseDeleteItem(id);
    setPayments(payments.filter(p => p.studentId !== id));
  };
  
  const computedStudents = items.map(student => {
    const studentPayments = payments.filter(p => p.studentId === student.id);
    const totalPayments = studentPayments.reduce((sum, p) => sum + (parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0), 0);

    let totalCharges = 0;
    const registrationDates = student.registration ? student.registration.split(',').map(d => d.trim()) : [];
    const prices = student.price ? student.price.split(',').map(p => p.trim()) : [];
    const courses = student.courses ? student.courses.split(',').map(c => c.trim()) : [];
    const groups = student.group ? student.group.split(',').map(g => g.trim()) : [];
    const groupBalances: { [groupName: string]: number } = {};

    const consumedPaymentIds = new Set<number>();
    const groupCharges: { [groupName: string]: number } = {};

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
        groupCharges[groupName] = (groupCharges[groupName] || 0) + courseCharges;
        
        const exactPayments = studentPayments.filter(p => p.course?.trim() === groupName?.trim());
        const exactPaymentsSum = exactPayments.reduce((sum, p) => {
          consumedPaymentIds.add(p.id);
          return sum + (parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0);
        }, 0);
        
        groupBalances[groupName] = (groupBalances[groupName] || 0) + exactPaymentsSum - courseCharges;
      }
    });

    courses.forEach((course, index) => {
      const groupName = groups[index];
      if (groupName) {
        const courseLevelPayments = studentPayments.filter(p => 
          p.course?.trim() === course?.trim() && !consumedPaymentIds.has(p.id)
        );
        const courseLevelPaymentsSum = courseLevelPayments.reduce((sum, p) => {
          consumedPaymentIds.add(p.id);
          return sum + (parseInt(p.amount.replace(/[^0-9]/g, ''), 10) || 0);
        }, 0);
        groupBalances[groupName] += courseLevelPaymentsSum;
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
