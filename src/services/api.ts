import { AdminDashboardStats, Rating, Role, Store, StoreOwnerDashboardData, StoreWithUserRating, User } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('storerate_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg) as Error & { field?: string; status: number };
    error.field = data.field;
    error.status = res.status;
    throw error;
  }
  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    address: string;
  }): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminDashboard(): Promise<AdminDashboardStats> {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminUsers(params?: {
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: User[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createAdminUser(userData: {
    name: string;
    email: string;
    password: string;
    address: string;
    role: Role;
  }): Promise<{ user: User; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async getAdminStores(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ stores: Store[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const res = await fetch(`${API_BASE}/admin/stores?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createAdminStore(storeData: {
    name: string;
    email: string;
    address: string;
    ownerId?: string;
  }): Promise<{ store: Store; message: string }> {
    const res = await fetch(`${API_BASE}/admin/stores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(storeData),
    });
    return handleResponse(res);
  },

  // Normal User & Stores
  async getStores(params?: {
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ stores: StoreWithUserRating[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const res = await fetch(`${API_BASE}/stores?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitOrUpdateRating(storeId: string, rating: number): Promise<{
    rating: Rating;
    overallRating: number;
    totalRatings: number;
    action: 'created' | 'updated';
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ storeId, rating }),
    });
    return handleResponse(res);
  },

  async getMyRatings(): Promise<{ ratings: (Rating & { storeName: string; storeAddress: string })[] }> {
    const res = await fetch(`${API_BASE}/ratings/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Store Owner
  async getStoreOwnerDashboard(): Promise<StoreOwnerDashboardData> {
    const res = await fetch(`${API_BASE}/store-owner/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getStoreOwnerRatings(): Promise<{ ratings: Rating[] }> {
    const res = await fetch(`${API_BASE}/store-owner/ratings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Reset Demo
  async resetDemoData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/system/reset-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  // Veo Video Animation
  async generateVideo(data: {
    prompt?: string;
    imageBase64: string;
    mimeType: string;
    aspectRatio: '16:9' | '9:16';
  }): Promise<{ operationName: string }> {
    const res = await fetch(`${API_BASE}/video/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async checkVideoStatus(operationName: string): Promise<{ done: boolean; error?: any }> {
    const res = await fetch(`${API_BASE}/video/status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ operationName }),
    });
    return handleResponse(res);
  },

  async downloadVideoBlob(operationName: string): Promise<Blob> {
    const res = await fetch(`${API_BASE}/video/download`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ operationName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to download video.');
    }
    return res.blob();
  },
};
