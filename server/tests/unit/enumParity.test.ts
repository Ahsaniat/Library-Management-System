import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  UserRole,
  BookStatus,
  LoanStatus,
  ReservationStatus,
  FineStatus,
  NotificationType,
} from '../../src/types';
import { BookRequestStatus } from '../../src/models/BookRequest';

/**
 * The client keeps a copy of the shared enums in its own types file. This test
 * fails as soon as the two definitions drift apart, so API and UI cannot
 * silently disagree about valid values.
 */
const clientTypesPath = path.resolve(__dirname, '../../../client/src/types/index.ts');
const clientSource = fs.readFileSync(clientTypesPath, 'utf8');
const clientRequestPath = path.resolve(
  __dirname,
  '../../../client/src/services/bookRequestService.ts'
);
const clientRequestSource = fs.readFileSync(clientRequestPath, 'utf8');

function parseClientEnum(name: string): Record<string, string> {
  const match = new RegExp(`export enum ${name} \\{([\\s\\S]*?)\\}`, 'm').exec(clientSource);
  if (!match) {
    throw new Error(`Enum ${name} not found in client types`);
  }

  const entries: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const entry = /^\s*([A-Z_]+)\s*=\s*'([^']+)'/.exec(line);
    if (entry) {
      entries[entry[1]] = entry[2];
    }
  }
  return entries;
}

describe('client/server enum parity', () => {
  it('UserRole matches', () => expect(parseClientEnum('UserRole')).toEqual(UserRole));
  it('BookStatus matches', () => expect(parseClientEnum('BookStatus')).toEqual(BookStatus));
  it('LoanStatus matches', () => expect(parseClientEnum('LoanStatus')).toEqual(LoanStatus));
  it('ReservationStatus matches', () =>
    expect(parseClientEnum('ReservationStatus')).toEqual(ReservationStatus));
  it('FineStatus matches', () => expect(parseClientEnum('FineStatus')).toEqual(FineStatus));
  it('NotificationType matches', () =>
    expect(parseClientEnum('NotificationType')).toEqual(NotificationType));
  it('BookRequestStatus matches the client union', () => {
    const union = /status: ([^;]+);/.exec(clientRequestSource);
    expect(union).toBeTruthy();
    const values = (union![1].match(/'([^']+)'/g) ?? []).map((value) =>
      value.replace(/'/g, '')
    );
    expect(values.sort()).toEqual(Object.values(BookRequestStatus).sort());
  });
});
