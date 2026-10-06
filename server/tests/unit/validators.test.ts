import { describe, it, expect } from 'vitest';
import { Request } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { registerValidator } from '../../src/validators/auth';
import { bookSearchValidator, createBookValidator } from '../../src/validators/book';
import { checkoutValidator, renewValidator } from '../../src/validators/loan';
import { createReservationValidator } from '../../src/validators/reservation';

async function runValidator(
  validations: ValidationChain[],
  values: Record<string, unknown>
): Promise<ReturnType<typeof validationResult>> {
  // Validators target different locations (body/query/params); populate all of
  // them so the same helper can exercise every chain.
  const req = { body: values, query: values, params: values } as unknown as Request;
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

describe('bookSearchValidator', () => {
  it('rejects a limit above the hard cap', async () => {
    const result = await runValidator(bookSearchValidator, { limit: '1000' });
    expect(result.isEmpty()).toBe(false);
  });

  it('coerces valid pagination values', async () => {
    const result = await runValidator(bookSearchValidator, { page: '2', limit: '50' });
    expect(result.isEmpty()).toBe(true);
  });
});

describe('createBookValidator', () => {
  it('rejects a non-numeric copy count', async () => {
    const result = await runValidator(createBookValidator, {
      isbn: '9780451524935',
      title: '1984',
      numberOfCopies: 'many',
    });
    expect(result.isEmpty()).toBe(false);
  });
});

describe('checkoutValidator', () => {
  it('rejects a non-UUID book copy id', async () => {
    const result = await runValidator(checkoutValidator, {
      bookCopyId: 'not-a-uuid',
      userId: 'not-a-uuid',
    });
    expect(result.isEmpty()).toBe(false);
  });

  it('accepts a barcode as the copy reference', async () => {
    const result = await runValidator(checkoutValidator, {
      barcode: 'LIB-ABC-123',
      userId: '3f1b2c9e-4a5d-4b6f-8c7e-9d0a1b2c3d4e',
    });
    expect(result.isEmpty()).toBe(true);
  });

  it('requires either a copy id or a barcode', async () => {
    const result = await runValidator(checkoutValidator, {
      userId: '3f1b2c9e-4a5d-4b6f-8c7e-9d0a1b2c3d4e',
    });
    expect(result.isEmpty()).toBe(false);
  });
});

describe('renewValidator', () => {
  it('rejects a non-UUID loan id', async () => {
    const req = { body: {}, query: {}, params: { loanId: 'nope' } } as unknown as Request;
    await Promise.all(renewValidator.map((validation) => validation.run(req)));
    expect(validationResult(req).isEmpty()).toBe(false);
  });
});

describe('createReservationValidator', () => {
  it('requires a UUID book id', async () => {
    const result = await runValidator(createReservationValidator, { bookId: 'nope' });
    expect(result.isEmpty()).toBe(false);
  });
});
