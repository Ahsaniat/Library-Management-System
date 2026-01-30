import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Button, Input, LoadingSpinner } from '../../components';
import { User as UserType, UserRole } from '../../types';

interface UsersResponse {
  success: boolean;
  data: {
    data: UserType[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

function useUsers(params: { page?: number; limit?: number; role?: string; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const response = await api.get<UsersResponse>('/admin/users', { params });
      return response.data.data;
    },
  });
}

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.MEMBER,
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useUsers({ page, limit: 20, role: roleFilter, search });

  const createUser = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      await api.post('/admin/users', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowAddModal(false);
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: UserRole.MEMBER });
    },
    onError: (error: Error) => {
      alert(`Failed to create user: ${error.message}`);
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await api.patch(`/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditingUser(null);
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      await api.patch(`/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>User Management</h1>
          <p style={{ color: 'var(--ink-secondary)' }} className="mt-2">Manage library members and staff</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--parchment-light)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--ink-secondary)' }} />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="librarian">Librarian</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--ink-secondary)' }}>No users found</div>
        ) : (
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
            <thead style={{ backgroundColor: 'var(--parchment-dark)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Verified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--ink-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--parchment-border)' }}>
              {data.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--parchment-dark)' }}>
                          <span style={{ color: 'var(--ink-primary)' }} className="font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium" style={{ color: 'var(--ink-primary)' }}>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser?.id === user.id ? (
                      <select
                        defaultValue={user.role}
                        onChange={(e) => {
                          updateRole.mutate({ userId: user.id, role: e.target.value });
                        }}
                        className="px-2 py-1 border rounded"
                        style={{ borderColor: 'var(--parchment-border)' }}
                      >
                        <option value="admin">Admin</option>
                        <option value="librarian">Librarian</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}
                      >
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus.mutate({ userId: user.id, isActive: !user.isActive })}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}
                    >
                      {user.isEmailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingUser(editingUser?.id === user.id ? null : user)}
                      className="mr-3 hover:opacity-70"
                      style={{ color: 'var(--accent-warm)' }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user?')) {
                          deleteUser.mutate(user.id);
                        }
                      }}
                      className="hover:opacity-70"
                      style={{ color: 'var(--ink-secondary)' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t" style={{ backgroundColor: 'var(--parchment-dark)', borderColor: 'var(--parchment-border)' }}>
            <div className="text-sm" style={{ color: 'var(--ink-secondary)' }}>
              Page {data.pagination.page} of {data.pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg shadow-xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--parchment-light)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-primary)' }}>Add New User</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                    First Name
                  </label>
                  <Input
                    placeholder="First name"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                    Last Name
                  </label>
                  <Input
                    placeholder="Last name"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-secondary)' }}>
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
                >
                  <option value={UserRole.MEMBER}>Member</option>
                  <option value={UserRole.LIBRARIAN}>Librarian</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createUser.mutate(newUser)}
                disabled={!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName}
                isLoading={createUser.isPending}
              >
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
