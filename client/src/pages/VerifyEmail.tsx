import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../services';

type VerificationState = 'pending' | 'success' | 'error';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<VerificationState>('pending');

  useEffect(() => {
    let cancelled = false;

    async function verify(): Promise<void> {
      if (!token) {
        if (!cancelled) setState('error');
        return;
      }

      try {
        await authService.verifyEmail(token);
        if (!cancelled) setState('success');
      } catch {
        if (!cancelled) setState('error');
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4">
      <div
        className="max-w-md w-full rounded-lg p-8 text-center"
        style={{ backgroundColor: 'var(--parchment-light)', border: '1px solid var(--parchment-border)' }}
      >
        {state === 'pending' && <p style={{ color: 'var(--ink-secondary)' }}>Verifying your email...</p>}

        {state === 'success' && (
          <>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--ink-primary)' }}>
              Email verified
            </h2>
            <p className="mb-4" style={{ color: 'var(--ink-secondary)' }}>
              Your account is now active.
            </p>
            <Link to="/login" className="underline" style={{ color: 'var(--accent-warm)' }}>
              Sign in
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--ink-primary)' }}>
              Verification failed
            </h2>
            <p className="mb-4" style={{ color: 'var(--ink-secondary)' }}>
              The verification link is invalid or has expired. Request a new one from the sign-in page.
            </p>
            <Link to="/login" className="underline" style={{ color: 'var(--accent-warm)' }}>
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
