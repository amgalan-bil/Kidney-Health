'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getAccount,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  startFundraiser as apiStartFundraiser,
  updateGoal as saveGoal,
  type Account,
} from '@/lib/api';

type Status = 'signed-out' | 'loading' | 'ready' | 'error';

type AccountState = {
  /** The signed-in person's fundraiser record, once loaded. */
  account: Account | null;
  status: Status;
  reload: () => Promise<void>;
  updateGoal: (goal: number) => Promise<void>;
  startFundraiser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AccountContext = createContext<AccountState | null>(null);

/**
 * Holds the signed-in fundraiser's record. The session itself is an httpOnly
 * cookie set by the Express API, so there is no token to keep here: asking for
 * /api/v1/users/data either succeeds (signed in) or fails (signed out).
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const { userData } = await getAccount();
      setAccount(userData);
      setStatus('ready');
    } catch {
      // A rejected request here just means nobody is signed in on this browser.
      setAccount(null);
      setStatus('signed-out');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await apiLogin(email, password);
      await reload();
    },
    [reload],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      await apiRegister(name, email, password);
      await reload();
    },
    [reload],
  );

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      // Whether or not the API acknowledged it, this browser is done.
      setAccount(null);
      setStatus('signed-out');
    }
  }, []);

  const updateGoal = useCallback(async (goal: number) => {
    const { user } = await saveGoal(goal);
    setAccount((current) => (current ? { ...current, goal: user.goal } : current));
  }, []);

  const startFundraiser = useCallback(async () => {
    await apiStartFundraiser();
    setAccount((current) => (current ? { ...current, isFundraiser: true } : current));
  }, []);

  return (
    <AccountContext.Provider
      value={{ account, status, reload, updateGoal, startFundraiser, signIn, signUp, signOut }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error('useAccount must be used inside <AccountProvider>');
  return value;
}
