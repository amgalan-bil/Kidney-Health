'use client';

import { useEffect, useState } from 'react';
import { listFundraisers, type Fundraiser, type Page } from '@/lib/api';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; fundraisers: Fundraiser[]; pagination: Page };

/** One page of fundraisers, highest raised first (the API's order). */
export function useFundraisers(page: number, limit: number) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    listFundraisers({ page, limit })
      .then(({ users, pagination }) => {
        if (!cancelled) setState({ status: 'ready', fundraisers: users, pagination });
      })
      .catch((error) => {
        console.error('Failed to load fundraisers', error);
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  return state;
}
