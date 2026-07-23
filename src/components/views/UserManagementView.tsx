import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DataTable, Column } from '../common/DataTable';
import { GuestBanner } from '../common/GuestBanner';
import { Modal } from '../common/Modal';
import { User, UserRole } from '../../types';
import {
  Users,
  Plus,
  Save,
  Trash2,
  ShieldCheck,
  UserCheck,
  HardDrive,
  Network,
  CheckCircle2,
  XCircle,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
  UserX,
  Clock,
  Key
} from 'lucide-react';

interface UserManagementViewProps {
  onOpenMobileMenu: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ onOpenMobileMenu }) => {
  const { users, addUser, updateUser, deleteUser, currentUser, addToast } = useApp();

  const isGuest = currentUser?.role === 'guest';
  const isAdmin = currentUser?.role === 'admin';

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [department, setDepartment] = useState('Quality Department');
  const [active, setActive] = useState(true);

  // Password Reset Specific State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('Password123!');
    setShowPasswordInModal(false);
    setFullName('');
    setEmail('');
    setRole('user');
    setDepartment('Quality Department');
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password || '••••••••');
    setShowPasswordInModal(false);
    setFullName(u.fullName);
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department || 'Quality Department');
    setActive(u.active);
    setIsModalOpen(true);
  };

  const openPasswordResetModal = (u: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setResetTargetUser(u);
    setNewPassword('WarlborPass2026!');
    setShowNewPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (isPasswordModalOpen) {
      setNewPassword(res);
    } else {
      setPassword(res);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) return;

    if (!username.trim()) {
      addToast('error', 'Validation Error', 'Username is required.');
      return;
    }

    if (!editingUser && users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      addToast('error', 'Duplicate Username', `Username "${username}" is already taken.`);
      return;
    }

    if (editingUser) {
      updateUser({
        ...editingUser,
        username: username.trim(),
        password: password.trim() || editingUser.password || 'password123',
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        department,
        active
      });
    } else {
      addUser({
        username: username.trim(),
        password: password.trim() || 'password123',
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        department,
        active
      });
    }
    setIsModalOpen(false);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || isGuest) return;

    if (!newPassword.trim()) {
      addToast('error', 'Validation Error', 'Password cannot be empty.');
      return;
    }

    updateUser({
      ...resetTargetUser,
      password: newPassword.trim()
    });

    addToast('success', 'Password Reset Successful', `Password updated for account "${resetTargetUser.username}".`);
    setIsPasswordModalOpen(false);
    setResetTargetUser(null);
  };

  const handleToggleStatus = (u: User, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) return;
    if (currentUser?.id === u.id) {
      addToast('error', 'Action Restricted', 'You cannot deactivate your own active session.');
      return;
    }
    updateUser({
      ...u,
      active: !u.active
    });
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.active) ||
      (statusFilter === 'inactive' && !u.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // KPI Calculations
  const totalUserCount = users.length;
  const activeCount = users.filter(u => u.active).length;
  const adminCount = users.filter(u => u.role === 'admin' && u.active).length;
  const inactiveCount = users.filter(u => !u.active).length;

  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'Account & Credentials',
      accessor: u => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0 border border-blue-200 uppercase">
            {u.username.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-900">{u.username}</span>
              <span className="text-[10px] text-slate-400 font-mono">({u.id})</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                <Key className="w-2.5 h-2.5 text-slate-400" />
                Pass: {u.password ? '••••••••' : 'Not Set'}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={e => openPasswordResetModal(u, e)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'fullName',
      header: 'User Profile & Contact',
      accessor: u => (
        <div>
          <span className="font-bold text-xs text-slate-900 block">{u.fullName}</span>
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
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
              isAdm
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : isGuestRole
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            {isAdm ? 'Admin (Quality Manager)' : isGuestRole ? 'Guest (Auditor)' : 'User (QC Analyst / Tech)'}
          </span>
        );
      }
    },
    {
      key: 'department',
      header: 'Department / Section',
      accessor: u => <span className="text-xs font-semibold text-slate-700">{u.department || 'Quality Department'}</span>
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      accessor: u => (
        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {u.lastLogin || 'Never Logged In'}
        </span>
      )
    },
    {
      key: 'active',
      header: 'Account Status',
      accessor: u => (
        <button
          type="button"
          onClick={e => handleToggleStatus(u, e)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
            u.active
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }`}
        >
          {u.active ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
          {u.active ? 'Active' : 'Suspended'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Header
        title="User & Access Management"
        subtitle="Manage authorized user accounts, password credentials, access privileges, and security status"
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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Total System Users</p>
            <p className="text-xl font-black text-slate-900">{totalUserCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Active Accounts</p>
            <p className="text-xl font-black text-emerald-700">{activeCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">System Administrators</p>
            <p className="text-xl font-black text-indigo-700">{adminCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Suspended / Inactive</p>
            <p className="text-xl font-black text-red-700">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by username, name, email, or department..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin Only</option>
            <option value="user">User / Tech Only</option>
            <option value="guest">Guest Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={u => u.id}
        title="Authorized System Users Directory"
        subtitle="Click any user account to view or modify profile details and system access privileges"
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
        title={editingUser ? `Edit User Profile: ${editingUser.username}` : 'Create New System User Account'}
        subtitle="Manage Account Credentials, Password & System Access Privileges"
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
                placeholder="e.g. eko or tech_sarah"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Account Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswordInModal ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-3 pr-16 py-2 font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPasswordInModal ? 'Hide password' : 'Show password'}
                  >
                    {showPasswordInModal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                    title="Generate Random Password"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
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
                placeholder="e.g. Eko Prasetyo"
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
                placeholder="e.g. eko.prasetyo@warlbor.com"
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
                placeholder="e.g. Quality Department"
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
                <option value="user">User (QC Analyst / Lab Technician / Operational Access)</option>
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
                <option value="false">Suspended (Access Disabled)</option>
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
                <Trash2 className="w-3.5 h-3.5" /> Delete User Account
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

      {/* Modal Quick Password Reset */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={`Reset Password for Account: ${resetTargetUser?.username}`}
        subtitle={`User: ${resetTargetUser?.fullName} (${resetTargetUser?.role?.toUpperCase()})`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveResetPassword} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <strong>Password Override Notice:</strong> As an Administrator, setting a new password here will immediately allow the user to sign in with the new credential.
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-3 pr-20 py-2.5 font-mono text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Generate Random Password"
                >
                  <RefreshCw className="w-3 h-3" /> Auto
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" /> Confirm Password Reset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
