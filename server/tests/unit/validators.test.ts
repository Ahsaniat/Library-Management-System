import { describe, it, expect } from 'vitest';
import { Request } from 'express';
import { validationResult } from 'express-validator';
import { registerValidator } from '../../src/validators/auth';

async function runValidator(
  validations: ReturnType<typeof registerValidator>,
  body: Record<string, unknown>
): Promise<ReturnType<typeof validationResult>> {
  const req = { body, query: {}, params: {} } as unknown as Request;
  await Promise.all(validations.map((validation) => validation.run(req)));
  return validationResult(req);
}

const validPayload = {
  email: 'new.member@example.com',
  password: 'Passw0rd!',
  firstName: 'New',
  lastName: 'Member',
};

describe('registerValidator', () => {
  it('accepts a valid registration payload', async () => {
    const result = await runValidator(registerValidator, validPayload);
    expect(result.isEmpty()).toBe(true);
  });

  it('rejects a client-supplied admin role (privilege escalation)', async () => {
    const result = await runValidator(registerValidator, {
      ...validPayload,
      role: 'admin',
    });

    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors.some((error) => 'path' in error && error.path === 'role')).toBe(true);
  });

  it('rejects weak passwords', async () => {
    const result = await runValidator(registerValidator, {
      ...validPayload,
      password: 'weakpass',
    });
    expect(result.isEmpty()).toBe(false);
  });
});
