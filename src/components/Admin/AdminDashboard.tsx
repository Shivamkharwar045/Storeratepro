import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Building2,
  MapPin,
  Mail,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { AdminDashboardStats, Store as StoreType, User } from '../../types';
import { api } from '../../services/api';
import { StarRating } from '../StarRating';
import { AddUserModal } from './AddUserModal';
import { AddStoreModal } from './AddStoreModal';
import { UserDetailModal } from './UserDetailModal';
import { SortHeaderCell } from '../SortHeaderCell';
import { MultiSortToolbar } from '../MultiSortToolbar';
import { useMultiSort } from '../../hooks/useMultiSort';
import {
  multiSortStores,
  multiSortUsers,
  StoreSortKey,
  UserSortKey,
} from '../../utils/sorting';

interface AdminDashboardProps {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNotify }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stores' | 'users'>('stores');
  const [loading, setLoading] = useState<boolean>(true);

  // Stores State
  const [stores, setStores] = useState<StoreType[]>([]);
  const [storeSearch, setStoreSearch] = useState<string>('');

  // Stores Multi-Sort Hook
  const {
    sortedItems: sortedStores,
    criteria: storeCriteria,
    handleSort: handleStoreSort,
    clearSort: clearStoreSort,
    getSortInfo: getStoreSortInfo,
    isMultiSortMode: isStoreMultiSortMode,
    toggleMultiSortMode: toggleStoreMultiSortMode,
    setCriteria: setStoreCriteria,
  } = useMultiSort<StoreType, StoreSortKey>(stores, multiSortStores, {
    initialCriteria: [{ key: 'name', order: 'asc' }],
    defaultOrder: (k) => (k === 'overallRating' || k === 'totalRatings' ? 'desc' : 'asc'),
  });

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Users Multi-Sort Hook
  const {
    sortedItems: sortedUsers,
    criteria: userCriteria,
    handleSort: handleUserSort,
    clearSort: clearUserSort,
    getSortInfo: getUserSortInfo,
    isMultiSortMode: isUserMultiSortMode,
    toggleMultiSortMode: toggleUserMultiSortMode,
    setCriteria: setUserCriteria,
  } = useMultiSort<User, UserSortKey>(users, multiSortUsers, {
    initialCriteria: [{ key: 'name', order: 'asc' }],
    defaultOrder: (k) => (k === 'storeRating' ? 'desc' : 'asc'),
  });

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState<boolean>(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      const data = await api.getAdminDashboard();
      setStats(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await api.getAdminStores({
        search: storeSearch,
      });
      setStores(data.stores);
    } catch (err: any) {
      onNotify(err.message || 'Failed to fetch stores.', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
      });
      setUsers(data.users);
    } catch (err: any) {
      onNotify(err.message || 'Failed to fetch users.', 'error');
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchStores(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStores();
  }, [storeSearch]);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter]);

  const storeOwnersList = users.filter((u) => u.role === 'STORE_OWNER');

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider">
            System Administrator
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Platform Administration Console
          </h1>
          <p className="text-xs text-slate-500">
            Real-time management of stores, user accounts, and platform rating records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshAll}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            title="Refresh console"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddStoreOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Store</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddUserOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* 3 Main Stat Cards (Assignment Requirement: Users, Stores, Ratings) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Users
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono-numbers mt-1">
              {stats?.totalUsers ?? '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-mono-numbers">
              <span>{stats?.roleBreakdown.user ?? 0} Users</span>
              <span>·</span>
              <span>{stats?.roleBreakdown.storeOwner ?? 0} Owners</span>
              <span>·</span>
              <span>{stats?.roleBreakdown.admin ?? 0} Admins</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Stores */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Stores
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono-numbers mt-1">
              {stats?.totalStores ?? '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Registered retail outlets
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Store className="w-5 h-5" />
          </div>
        </div>

        {/* Total Ratings */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Ratings
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono-numbers mt-1">
              {stats?.totalRatings ?? '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Submitted customer evaluations
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <Star className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs: Stores Management vs Users Management */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('stores')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'stores'
              ? 'border-slate-900 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Stores Directory ({stores.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-slate-900 text-slate-900 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Roles ({users.length})</span>
        </button>
      </div>

      {/* STORES MANAGEMENT VIEW */}
      {activeTab === 'stores' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Filter by store name, email, or address..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono-numbers">
              Showing {stores.length} stores
            </div>
          </div>

          {/* Multi-Sort Toolbar */}
          <MultiSortToolbar<StoreSortKey>
            criteria={storeCriteria}
            keyLabels={{
              name: 'Store Name',
              email: 'Email',
              address: 'Address',
              overallRating: 'Overall Rating',
              totalRatings: 'Total Reviews',
            }}
            isMultiSortMode={isStoreMultiSortMode}
            onToggleMultiSortMode={toggleStoreMultiSortMode}
            onRemoveCriterion={(k) => setStoreCriteria((prev) => prev.filter((c) => c.key !== k))}
            onClearSort={clearStoreSort}
            tableName="Admin Stores"
          />

          {/* Stores Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <SortHeaderCell
                      label="Store Name"
                      sortInfo={getStoreSortInfo('name')}
                      onSort={(e) => handleStoreSort('name', e)}
                    />
                    <SortHeaderCell
                      label="Email"
                      sortInfo={getStoreSortInfo('email')}
                      onSort={(e) => handleStoreSort('email', e)}
                    />
                    <SortHeaderCell
                      label="Address"
                      sortInfo={getStoreSortInfo('address')}
                      onSort={(e) => handleStoreSort('address', e)}
                    />
                    <SortHeaderCell
                      label="Overall Rating"
                      sortInfo={getStoreSortInfo('overallRating')}
                      onSort={(e) => handleStoreSort('overallRating', e)}
                    />
                    <th scope="col" className="py-3 px-4 text-right">
                      Assigned Owner
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedStores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No stores found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedStores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-[240px]">
                          <div className="flex items-center gap-2.5">
                            {s.imageUrl ? (
                              <img
                                src={s.imageUrl}
                                alt={s.name}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                                <Building2 className="w-4 h-4" />
                              </div>
                            )}
                            <div className="truncate">
                              <span className="block truncate font-bold text-slate-900" title={s.name}>
                                {s.name}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-normal truncate">
                                {s.category || 'Retail Store'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                          {s.email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[240px] truncate" title={s.address}>
                          {s.address}
                        </td>
                        <td className="py-3.5 px-4">
                          <StarRating value={s.overallRating} totalRatings={s.totalRatings} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-600 text-xs font-medium">
                          {s.ownerName || 'Unassigned'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT VIEW */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar with Search and Role Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter users by name, email, or address..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Role filter (Assignment explicitly requires role filter: All, Admin, Normal User, Store Owner) */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono-numbers">
              Showing {users.length} users
            </div>
          </div>

          {/* Multi-Sort Toolbar */}
          <MultiSortToolbar<UserSortKey>
            criteria={userCriteria}
            keyLabels={{
              name: 'Name',
              email: 'Email',
              address: 'Address',
              storeRating: 'Store Rating',
              role: 'Role',
              createdAt: 'Date Joined',
            }}
            isMultiSortMode={isUserMultiSortMode}
            onToggleMultiSortMode={toggleUserMultiSortMode}
            onRemoveCriterion={(k) => setUserCriteria((prev) => prev.filter((c) => c.key !== k))}
            onClearSort={clearUserSort}
            tableName="Admin Users"
          />

          {/* Users Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <SortHeaderCell
                      label="Name"
                      sortInfo={getUserSortInfo('name')}
                      onSort={(e) => handleUserSort('name', e)}
                    />
                    <SortHeaderCell
                      label="Email"
                      sortInfo={getUserSortInfo('email')}
                      onSort={(e) => handleUserSort('email', e)}
                    />
                    <SortHeaderCell
                      label="Address"
                      sortInfo={getUserSortInfo('address')}
                      onSort={(e) => handleUserSort('address', e)}
                    />
                    <SortHeaderCell
                      label="Store Rating"
                      sortInfo={getUserSortInfo('storeRating')}
                      onSort={(e) => handleUserSort('storeRating', e)}
                      align="center"
                    />
                    <SortHeaderCell
                      label="Role"
                      sortInfo={getUserSortInfo('role')}
                      onSort={(e) => handleUserSort('role', e)}
                      align="right"
                    />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No users match the search filters.
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map((u) => {
                      const roleConfig = {
                        ADMIN: {
                          label: 'ADMIN',
                          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                          icon: Shield,
                        },
                        STORE_OWNER: {
                          label: 'STORE OWNER',
                          bg: 'bg-amber-50 text-amber-700 border-amber-200',
                          icon: Store,
                        },
                        USER: {
                          label: 'USER',
                          bg: 'bg-slate-100 text-slate-700 border-slate-200',
                          icon: UserIcon,
                        },
                      }[u.role];

                      const Icon = roleConfig.icon;

                      return (
                        <tr
                          key={u.id}
                          onClick={() => {
                            setSelectedUserDetail(u);
                            setIsUserDetailOpen(true);
                          }}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                          title="Click to view full user details"
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {u.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-[280px] truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {u.role === 'STORE_OWNER' ? (
                              u.storeRating !== null && u.storeRating !== undefined ? (
                                <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold text-amber-900">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                  <span>{u.storeRating > 0 ? u.storeRating.toFixed(1) : 'New'}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400">Unassigned</span>
                              )
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${roleConfig.bg}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{roleConfig.label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSuccess={(msg) => {
          onNotify(msg, 'success');
          refreshAll();
        }}
      />

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        storeOwners={storeOwnersList}
        onSuccess={(msg) => {
          onNotify(msg, 'success');
          refreshAll();
        }}
      />

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUserDetail}
        isOpen={isUserDetailOpen}
        onClose={() => setIsUserDetailOpen(false)}
      />
    </div>
  );
};
