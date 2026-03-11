import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, X, Edit, Lock, Trash2 } from 'lucide-react';
import { useEmployees, useGroups, Employee } from '../lib/mockData.ts';
import { cn } from '../lib/utils.ts';

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items: employees, updateItem, deleteItem } = useEmployees();
  const { items: groups } = useGroups();
  
  const employee = employees.find(e => e.id === Number(id));
  const employeeGroups = groups.filter(g => g.teachers === employee?.name || g.teachers.includes(employee?.name || ''));

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [editItem, setEditItem] = useState<Employee | null>(null);
  const [credentialsItem, setCredentialsItem] = useState<Employee | null>(null);
  
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    qualification: '', 
    gender: '', 
    exp: 0, 
    dob: '', 
    joined: '', 
    username: '', 
    password: '',
    employeeType: '',
    address: '',
    salary: ''
  });

  const [credentialsData, setCredentialsData] = useState({
    username: '',
    password: ''
  });

  if (!employee) {
    return <div className="p-6 text-zinc-500">Employee not found</div>;
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteItem(employee.id);
      navigate('/employees');
    }
  };

  const openEditModal = () => {
    const [firstName = '', ...lastNameParts] = (employee.name || '').split(' ');
    const lastName = lastNameParts.join(' ');
    setFormData({ 
      firstName, 
      lastName, 
      phone: employee.phone || '', 
      qualification: employee.qualification || '', 
      gender: employee.gender || '', 
      exp: employee.exp || 0, 
      dob: employee.dob || '', 
      joined: employee.joined || '', 
      username: employee.username || '', 
      password: employee.password || '',
      employeeType: employee.employeeType || '',
      address: employee.address || '',
      salary: employee.salary || ''
    });
    setEditItem(employee);
    setIsActionsOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateItem(editItem.id, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        qualification: formData.qualification,
        gender: formData.gender,
        exp: formData.exp,
        dob: formData.dob,
        joined: formData.joined,
        username: formData.username,
        password: formData.password,
        employeeType: formData.employeeType,
        address: formData.address,
        salary: formData.salary
      });
      setEditItem(null);
    }
  };

  const openCredentialsModal = () => {
    setCredentialsData({
      username: employee.username || '',
      password: employee.password || ''
    });
    setCredentialsItem(employee);
    setIsActionsOpen(false);
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentialsItem) {
      updateItem(credentialsItem.id, {
        ...employee,
        username: credentialsData.username,
        password: credentialsData.password
      });
      setCredentialsItem(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{employee.name}</h1>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Employee type:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{employee.employeeType || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Qualification:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{employee.qualification || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Years of experience:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{employee.exp || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Gender:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{employee.gender || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Phone:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{employee.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Date of birth:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{employee.dob || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">Joined date:</span>
              <span className="text-zinc-600 dark:text-zinc-400">{employee.joined || '-'}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Actions
            <ChevronDown className="w-4 h-4" />
          </button>

          {isActionsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsActionsOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
                <button 
                  onClick={openEditModal}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit details
                </button>
                <button 
                  onClick={openCredentialsModal}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Edit credentials
                </button>
                <div className="h-px bg-zinc-800/50 my-1"></div>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800/50 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800/50"></div>

      {/* Groups Section */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Groups</h2>
        
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800/50">
              <tr>
                <th className="px-6 py-4 font-bold whitespace-nowrap bg-zinc-50 dark:bg-zinc-900/30">#</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap bg-zinc-50 dark:bg-zinc-900/30">Group name</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap bg-zinc-50 dark:bg-zinc-900/30">Number of students</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap bg-zinc-50 dark:bg-zinc-900/30">Teachers</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap bg-zinc-50 dark:bg-zinc-900/30">Courses</th>
                <th className="px-6 py-4 font-bold whitespace-nowrap bg-zinc-50 dark:bg-zinc-900/30">Rooms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
              {employeeGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                    No groups assigned to this teacher.
                  </td>
                </tr>
              ) : (
                employeeGroups.map((group, index) => (
                  <tr key={group.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{index + 1}</td>
                    <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{group.name}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{group.students}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{group.teachers}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{group.courses}</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">{group.rooms}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Details Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Edit the employee</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Fill the form with new employee details.</p>
            </div>
            <form className="space-y-6" onSubmit={handleEditSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">First name</label>
                <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Last name</label>
                <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
                <input disabled value="Employee" type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 dark:text-zinc-500 focus:outline-none cursor-not-allowed" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Employee type</label>
                <select value={formData.employeeType} onChange={e => setFormData({...formData, employeeType: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
                  <option value="">Select type</option>
                  <option value="English Teacher">English Teacher</option>
                  <option value="Math Teacher">Math Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Date of birth</label>
                  <input required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gender</label>
                  <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors appearance-none">
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Address of residence <span className="text-zinc-500 font-normal">(optional)</span></label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Qualification</label>
                  <input required value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Years of experience</label>
                  <input required value={formData.exp} onChange={e => setFormData({...formData, exp: parseInt(e.target.value) || 0})} type="number" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Joined date</label>
                <input required value={formData.joined} onChange={e => setFormData({...formData, joined: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Salary <span className="text-zinc-500 font-normal">(optional)</span></label>
                <input value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</label>
                  <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                  <input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
                </div>
              </div>

              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Credentials Modal */}
      {credentialsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl relative">
            <button 
              onClick={() => setCredentialsItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Edit credentials</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Update username and password for this employee.</p>
            </div>
            <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</label>
                <input required value={credentialsData.username} onChange={e => setCredentialsData({...credentialsData, username: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <input required value={credentialsData.password} onChange={e => setCredentialsData({...credentialsData, password: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-zinc-900 dark:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-colors">Save credentials</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
