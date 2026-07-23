import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { User, UserRole } from '../../types';
import { Users, Plus, Save, Trash2, ShieldCheck, UserCheck, HardDrive, Network, CheckCircle2, XCircle } from 'lucide-react';

interface UserManagementViewProps {
  onOpenMobileMenu: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ onOpenMobileMenu }) => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const isAdmin = currentUser?.role === 'admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [department, setDepartment] = useState('Quality Assurance');
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setEmail('');
    setRole('user');
    setDepartment('Quality Control Lab');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setFullName(u.fullName);
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department || 'Quality Assurance');
    setActive(u.active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        username,
        fullName,
        email,
        role,
        department,
        active
      });
    } else {
      addUser({
        username,
        fullName,
        email,
        role,
        department,
        active
      });
    }
    setIsModalOpen(false);
  };

  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'Username / Account ID',
      accessor: u => (
        <div>
          <span className="font-mono font-bold text-slate-900 block">{u.username}</span>
          <span className="text-[10px] text-slate-500">{u.id}</span>
        </div>
      )
    },
    {
      key: 'fullName',
      header: 'Full Name & Email',
      accessor: u => (
        <div>
          <span className="font-bold text-slate-900 block">{u.fullName}</span>
          <span className="text-[11px] text-slate-500">{u.email}</span>
        </div>
      )
    },
    {
      key: 'role',
      header: 'System Access Role',
      accessor: u => {
        const isAdm = u.role === 'admin';
        const isGuestRole = u.role === 'guest';
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            isAdm
              ? 'bg-blue-100 text-blue-900 border-blue-300'
              : isGuestRole
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
          }`}>
            <ShieldCheck className="w-3 h-3" />
            {isAdm ? 'Admin (Quality Manager)' : isGuestRole ? 'Guest (Auditor)' : 'User (Technician)'}
          </span>
        );
      }
    },
    {
      key: 'department',
      header: 'Department / Section',
      accessor: u => <span className="text-xs font-medium text-slate-800">{u.department || 'QA / QC'}</span>
    },
    {
      key: 'active',
      header: 'Account Status',
      accessor: u => (
        <span className={`inline-flex items-center gap-1 text-xs font-bold ${u.active ? 'text-emerald-600' : 'text-slate-400'}`}>
          {u.active ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
          {u.active ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="User & Access Management"
        subtitle="Manage user accounts, system roles, departmental access privileges, and NAS shared folder storage"
        icon={Users}
        actions={
          isAdmin ? (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New User Account
            </button>
          ) : undefined
        }
        onOpenMobileMenu={onOpenMobileMenu}
      />

      <GuestBanner />

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        keyExtractor={u => u.id}
        title="Authorized System Users"
        subtitle="Click any user account to edit permissions, status, or contact details"
        onRowClick={isAdmin ? openEditModal : undefined}
        exportFileName="LEMS_System_Users.csv"
      />

      {/* NAS Shared Folder Storage Information Box */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white rounded-2xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              NAS (Network Attached Storage) & Document Storage Integration
            </h3>
            <p className="text-xs text-slate-300">
              Information regarding local sharefolder and network document storage access for LEMS
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-1 border-t border-slate-800">
          <div className="space-y-1.5">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-400" /> Embedded Base64 Storage Mode
            </h4>
            <p className="leading-relaxed">
              All uploaded Calibration Certificates, Chemical COA, and MSDS documents are embedded directly as Base64 encoded attachments within the database state and export backups. They can be viewed and downloaded on any browser tab.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Network className="w-4 h-4 text-indigo-400" /> Enterprise NAS / Sharefolder Access
            </h4>
            <p className="leading-relaxed">
              For intranet NAS access (e.g. <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">\\nas-qc-tobacco\LEMS_Docs\</code>), users can reference filenames and attach documents directly via file uploads or export full JSON database backups to the shared directory.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.username}` : 'Create New System User'}
        subtitle="Manage Account Credentials and Privilege Level"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. ahmed.hassan"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Ahmed Hassan"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. ahmed@tobacco-mfg.com"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Department / Section
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. QA Analytical Lab"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                System Access Role *
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                <option value="admin">Admin (Full Management & Audit Log Access)</option>
                <option value="user">User (Lab Technician / Operational Execution)</option>
                <option value="guest">Guest (Read-Only Observer / ISO Auditor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Account Status *
              </label>
              <select
                value={active ? 'true' : 'false'}
                onChange={e => setActive(e.target.value === 'true')}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                <option value="true">Active (Access Granted)</option>
                <option value="false">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {editingUser ? (
              <button
                type="button"
                onClick={() => {
                  deleteUser(editingUser.id);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete User
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save User Account
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
