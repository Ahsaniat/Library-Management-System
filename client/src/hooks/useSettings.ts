import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../services/settingService';

export function useSettings() {
  return useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: () => settingService.getSettings(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      settingService.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
