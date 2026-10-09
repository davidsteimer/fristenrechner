// SPDX-License-Identifier: AGPL-3.0-only
import * as React from 'react';

export interface DateInputCommitResult {
  readonly value: string;
  readonly errorMessage?: string;
}
export interface DateInputHandle {
  readonly commit: (now: Date) => DateInputCommitResult;
}
export interface DateInputSession {
  readonly register: (name: string, handle: DateInputHandle) => () => void;
  readonly commitAll: () => Record<string, DateInputCommitResult>;
}

/** One submit resolves every currently mounted date against the same instant. */
export function createDateInputSession(): DateInputSession {
  const fields = new Map<string, DateInputHandle>();
  return {
    register(name, handle) {
      fields.set(name, handle);
      return () => { if (fields.get(name) === handle) fields.delete(name); };
    },
    commitAll() {
      const now = new Date();
      const values: Record<string, DateInputCommitResult> = Object.create(null) as Record<string, DateInputCommitResult>;
      for (const [name, handle] of fields) values[name] = handle.commit(now);
      return values;
    }
  };
}
export const DateInputSessionContext = React.createContext<DateInputSession | undefined>(undefined);
export function useDateInputSession(): DateInputSession {
  return React.useMemo(() => createDateInputSession(), []);
}
