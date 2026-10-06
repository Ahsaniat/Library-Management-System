import { useState, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services';
import { Button, Input } from '../components';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const resetPassword = useMutation({
    mutationFn: ({ resetToken, newPassword }: { resetToken: string; newPassword: string }) =>
      authService.resetPassword(resetToken, newPassword),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('Reset link is invalid.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword.mutateAsync({ resetToken: token, newPassword: password });
      navigate('/login', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.';
      setError(message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
          Choose a new password
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </div>
          )}

          <Input
            id="password"
            type="password"
            label="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={resetPassword.isPending}>
            Reset password
          </Button>

          <p className="text-center text-sm">
            <Link to="/login" className="underline" style={{ color: 'var(--accent-warm)' }}>
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
