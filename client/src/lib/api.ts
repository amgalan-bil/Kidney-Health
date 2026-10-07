/**
 * Client for the Express API in /server: fundraiser records and QPay donations.
 * The API authenticates with an httpOnly `token` cookie set by /api/v1/auth/login,
 * so every request is sent with credentials rather than an Authorization header.
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '');

export type Fundraiser = {
  _id: string;
  name: string;
  goal: number;
  totalDonatedAmount: number;
};

export type Donation = {
  _id: string;
  name: string;
  message?: string;
  amount: number;
  createdAt: string;
};

/** The signed-in person's own fundraiser record. */
export type Account = {
  userId: string;
  name: string;
  goal: number;
  raisedAmount: number;
};

export type QPayBankLink = {
  name: string;
  description: string;
  logo: string;
  link: string;
};

export type QPayInvoice = {
  invoice_id: string;
  qr_image: string;
  urls?: QPayBankLink[];
};

export type Page = { currentPage: number; totalPages: number };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    // The session lives in an httpOnly cookie on the API host.
    credentials: 'include',
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => null)) as ({ success?: boolean; message?: string } & T) | null;
  if (!res.ok || !data?.success) {
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`);
  }
  return data;
}

/** MongoDB ids are 24 hex characters; anything else can't be a fundraiser. */
export function isFundraiserId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export function listFundraisers({ page = 1, limit = 12, search = '' } = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit), search });
  return request<{ users: Fundraiser[]; pagination: Page }>(`/api/v1/users/all?${query}`);
}

export function getFundraiser(id: string) {
  return request<{ user: Fundraiser }>(`/api/v1/users/${id}`);
}

export function listDonations(fundraiserId: string, page = 1, limit = 8) {
  return request<{ donors: Donation[]; pagination: Page }>(
    `/api/v1/users/userDonors/${fundraiserId}?page=${page}&limit=${limit}`,
  );
}

export function getAccount() {
  return request<{ userData: Account }>('/api/v1/users/data');
}

export function updateGoal(goal: number) {
  return request<{ user: Fundraiser }>('/api/v1/users/goal', {
    method: 'PATCH',
    body: JSON.stringify({ goal }),
  });
}

/* ---------------------------------------------------------------- auth ---- */

/** True when the cookie still identifies a signed-in fundraiser. */
export async function isAuthenticated() {
  try {
    await request('/api/v1/auth/is-auth');
    return true;
  } catch {
    return false;
  }
}

export function login(email: string, password: string) {
  return request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return request('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  return request('/api/v1/auth/logout', { method: 'POST' });
}

export function sendResetOtp(email: string) {
  return request('/api/v1/auth/send-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(email: string, otp: string, newPassword: string) {
  return request('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  });
}

export function createInvoice(input: { amount: number; userId?: string; name: string; message: string }) {
  return request<{ qpayData: QPayInvoice }>('/api/v1/donation/create-invoice', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function checkPayment(invoiceId: string) {
  return request<{ status: 'PAID' | 'PENDING'; message: string }>(
    `/api/v1/donation/check-payment/${encodeURIComponent(invoiceId)}`,
    { method: 'POST' },
  );
}
