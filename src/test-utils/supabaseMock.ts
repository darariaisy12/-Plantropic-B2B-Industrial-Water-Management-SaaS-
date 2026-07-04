/**
 * Minimal thenable query-builder mock for Supabase client tests. Every
 * chained method (select/eq/order/...) returns the same chain object; the
 * chain resolves to a fixed `{ data, error }` result when awaited, and
 * `.then()` returns a real Promise so `.then().catch()` fire-and-forget
 * calls (see admin_audit_logs inserts) don't blow up.
 */

import { vi } from 'vitest';

export interface SupabaseResult<T = unknown> {
  data: T;
  error: { message: string } | null;
}

const CHAIN_METHODS = ['select', 'eq', 'order', 'limit', 'maybeSingle', 'single', 'upsert', 'insert', 'update'] as const;

export function createSupabaseChain<T = unknown>(result: SupabaseResult<T>) {
  const chain: Record<string, unknown> = {
    then: (onFulfilled?: (value: SupabaseResult<T>) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  for (const method of CHAIN_METHODS) {
    chain[method] = vi.fn(() => chain);
  }
  return chain;
}
