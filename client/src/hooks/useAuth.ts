import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import { useAuthStore } from '../store';
import { LoginCredentials, RegisterData } from '../types';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
  });
}

export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return async () => {
    try {
      await authService.logout();
    } catch {
      // The server session is already unusable; clearing local state is enough.
    }
    logout();
    queryClient.clear();
  };
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
  });
}
