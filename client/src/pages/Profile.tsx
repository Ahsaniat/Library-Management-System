import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Save, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store';
import { Button, Input, LoadingSpinner } from '../components';
import api from '../services/api';
import { ApiResponse, User as UserType } from '../types';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser, user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.patch<ApiResponse<{ user: UserType }>>('/auth/profile', data);
      return response.data.data!.user;
    },
    onSuccess: (updatedUser) => {
      if (user) {
        setUser({ ...user, ...updatedUser });
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await api.post('/auth/change-password', data);
    },
  });
}

export default function Profile() {
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profileData, setProfileData] = useState<UpdateProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(profileData);
      setSuccessMessage('Profile updated successfully!');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setErrorMessage(message);
      setSuccessMessage(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccessMessage('Password changed successfully!');
      setErrorMessage(null);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setErrorMessage(message);
      setSuccessMessage(null);
    }
  };

  if (!user) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--ink-primary)' }}>
        My Profile
      </h1>

      {successMessage && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <Check className="h-5 w-5" style={{ color: '#22c55e' }} />
          <p style={{ color: '#22c55e' }}>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
          <p style={{ color: '#ef4444' }}>{errorMessage}</p>
        </div>
      )}

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--parchment-light)' }}>
        <div className="p-6 border-b flex items-center gap-6" style={{ borderColor: 'var(--parchment-border)' }}>
          <div className="relative">
            <div className="h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--ink-primary)' }}>
              {user.firstName} {user.lastName}
            </h2>
            <p style={{ color: 'var(--ink-secondary)' }}>{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full capitalize" style={{ backgroundColor: 'var(--parchment-dark)', color: 'var(--ink-primary)' }}>
              {user.role}
            </span>
          </div>
        </div>

        <div className="flex border-b" style={{ borderColor: 'var(--parchment-border)' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className="flex-1 py-3 text-center transition-colors"
            style={{
              backgroundColor: activeTab === 'profile' ? 'var(--parchment-dark)' : 'transparent',
              color: 'var(--ink-primary)',
            }}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className="flex-1 py-3 text-center transition-colors"
            style={{
              backgroundColor: activeTab === 'password' ? 'var(--parchment-dark)' : 'transparent',
              color: 'var(--ink-primary)',
            }}
          >
            Change Password
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                    <User className="inline-block h-4 w-4 mr-2" />
                    First Name
                  </label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                    <User className="inline-block h-4 w-4 mr-2" />
                    Last Name
                  </label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  <Mail className="inline-block h-4 w-4 mr-2" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={user.email}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--ink-secondary)' }}>
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  <Phone className="inline-block h-4 w-4 mr-2" />
                  Phone Number
                </label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  <MapPin className="inline-block h-4 w-4 mr-2" />
                  Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="Your address"
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--parchment-border)', backgroundColor: 'var(--parchment-light)' }}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={updateProfile.isPending} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  Current Password
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-secondary)' }}>
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={changePassword.isPending}
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  Change Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
