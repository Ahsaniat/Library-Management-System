import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../services/settingService';
import { formatCurrency } from '../utils';

export function useSettings() {
  return useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: () => settingService.getSettings(),
  });
}

/** Currency configured in system settings, with a formatter (USD $, BDT ৳). */
export function useCurrency() {
  const { data: settings } = useQuery({
    queryKey: ['settings', 'public'],
    queryFn: () => settingService.getPublicSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const code = settings?.find((setting) => setting.key === 'fine.currency')?.value ?? 'USD';

  return {
    code,
    format: (amount: number | string | undefined) => formatCurrency(amount, code),
  };
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
