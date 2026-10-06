import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services';
import { Button, Input } from '../components';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const requestReset = useMutation({
    mutationFn: (value: string) => authService.forgotPassword(value),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await requestReset.mutateAsync(email);
      setSent(true);
    } catch {
      // The API always returns the same message; show the generic state anyway.
      setSent(true);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold" style={{ color: 'var(--ink-primary)' }}>
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--ink-secondary)' }}>
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}>
            <p style={{ color: 'var(--ink-primary)' }}>
              If the email exists, a reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" className="inline-block mt-4 underline" style={{ color: 'var(--accent-warm)' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
            <Button type="submit" className="w-full" size="lg" isLoading={requestReset.isPending}>
              Send reset link
            </Button>
            <p className="text-center text-sm">
              <Link to="/login" className="underline" style={{ color: 'var(--accent-warm)' }}>
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
